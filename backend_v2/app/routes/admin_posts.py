from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile, Response
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from backend_v2.app.core.database import get_db
from backend_v2.app.models.post import Post, ImageAsset, PostSection
from backend_v2.app.schemas.post import PostOut, SectionOut
from backend_v2.app.api.deps import get_current_user  # ten sam, co w TrainingProfile
from typing import Optional, List
import json

router = APIRouter(prefix="/Admin/posts", tags=["Admin"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 5 * 1024 * 1024

# Prosta weryfikacja roli admin – działa gdy user ma atrybut/klucz 'role'
def require_admin(user = Depends(get_current_user)):
    role = getattr(user, "role", None)
    if role is None and isinstance(user, dict):
        role = user.get("role")
    role = role or []
    print(role)
    if "Admin" not in role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak wymaganej roli")
    return user

@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    title: str = Form(..., max_length=200),
    subtitle: Optional[str] = Form(None, max_length=300),
    slug: str = Form(..., max_length=220),
    # sections must be JSON array: [{"heading": "..", "text": ".."}, ...]
    sections: str = Form(..., description="JSON array of sections with at least one item"),
    # tags as CSV or JSON array
    tags: Optional[str] = Form(None, description='CSV "trening,wiedza" or JSON ["trening"]'),
    published: bool = Form(False),
    hero_image: UploadFile = File(..., description="Required hero image"),
    gallery: Optional[List[UploadFile]] = File(None, description="Optional gallery images"),
    db: Session = Depends(get_db),
    user = Depends(require_admin),
):
# unique slug
    if db.execute(select(Post).where(Post.slug == slug)).scalar_one_or_none():
        raise HTTPException(409, "Slug already exists")


    # validate sections: JSON array, >=1, each text non-empty
    try:
        sec_list = json.loads(sections)
        if not isinstance(sec_list, list):
            raise ValueError
    except Exception:
        raise HTTPException(422, "'sections' musi być poprawnym JSON-em (listą)")


    cleaned_sections: List[dict] = []
    for i, s in enumerate(sec_list, start=1):
        heading = (s.get("heading") or None) if isinstance(s, dict) else None
        text = (s.get("text") if isinstance(s, dict) else None)
        if not text or not str(text).strip():
            raise HTTPException(422, f"Sekcja {i} musi zawierać 'text'.")
        if heading is not None and len(str(heading)) > 200:
            raise HTTPException(422, f"Sekcja {i}: 'heading' max 200 znaków.")
        cleaned_sections.append({"heading": str(heading).strip() if heading else None, "text": str(text).strip()})
    if len(cleaned_sections) < 1:
        raise HTTPException(422, "Wymagana jest co najmniej jedna sekcja.")


    # tags → min 1
    tags_list: List[str] = []
    if tags:
        t = tags.strip()
        if t.startswith("["):
            tags_list = [str(x).strip() for x in json.loads(t)]
        else:
            tags_list = [s.strip() for s in t.replace(";", ",").split(",") if s.strip()]
    if not tags_list:
        raise HTTPException(422, "Wymagany co najmniej jeden tag (np. 'trening').")
    tags_csv = ",".join(tags_list)


    # hero image validation
    if hero_image.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, f"Niedozwolony typ: {hero_image.content_type}")
    hero_bytes = await hero_image.read()
    if not hero_bytes:
        raise HTTPException(422, "Plik obrazka jest pusty.")
    if len(hero_bytes) > MAX_BYTES:
        raise HTTPException(413, f"Plik za duży (> {MAX_BYTES//1024//1024} MB).")


    uid = getattr(user, "id", None) or getattr(user, "sub", 0)
    email = getattr(user, "email", "")

    post = Post(
        title=title,
        subtitle=subtitle,
        slug=slug,
        tags=tags_csv,
        published=published,
        author_id=int(uid) if uid is not None else 0,
        author_name=email or "",
    )
    db.add(post); db.flush() # get post.id

    post.images.append(ImageAsset(
        is_hero=True,
        content_type=hero_image.content_type,
        size_bytes=len(hero_bytes),
        data=hero_bytes,
    ))

    # GALERIA (opcjonalnie) – też przez relację
    if gallery:
        for f in gallery:
            if f is None: 
                continue
            if f.content_type not in ALLOWED_TYPES:
                raise HTTPException(415, f"Niedozwolony typ w galerii: {f.content_type}")
            d = await f.read()
            if not d:
                continue
            if len(d) > MAX_BYTES:
                raise HTTPException(413, "Plik w galerii jest zbyt duży.")
            post.images.append(ImageAsset(
                is_hero=False,
                content_type=f.content_type,
                size_bytes=len(d),
                data=d,
            ))

    # SEKCJE – również przez relację
    for idx, s in enumerate(cleaned_sections, start=1):
        post.sections.append(PostSection(
            order_index=idx,
            heading=s["heading"],
            text=s["text"],
        ))

    db.commit()

    # 🔽 odczytaj posta z eager-loadem relacji, żeby Pydantic miał wszystko
    post = db.execute(
        select(Post)
        .options(selectinload(Post.images), selectinload(Post.sections))
        .where(Post.id == post.id)
    ).scalar_one()

    return post

@router.get("/{post_id}/images/{image_id}")
def get_image(post_id: int, image_id: int, db: Session = Depends(get_db)):
    img = db.get(ImageAsset, image_id)
    if not img or img.post_id != post_id:
        raise HTTPException(404, "Image not found")
    return Response(content=img.data, media_type=img.content_type, headers={"Cache-Control": "public, max-age=31536000"})
