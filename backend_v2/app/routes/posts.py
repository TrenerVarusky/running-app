from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func
from typing import List
from backend_v2.app.core.database import get_db
from backend_v2.app.models.post import Post
from backend_v2.app.schemas.post import PostOut

router = APIRouter(prefix="/Posts", tags=["Posts"])


@router.get("/latest", response_model=List[PostOut])
def latest_posts(limit: int = 3, db: Session = Depends(get_db)):
    stmt = select(Post).where(Post.published == True).order_by(desc(Post.created_at)).limit(limit)
    return db.scalars(stmt).all()


@router.get("", response_model=List[PostOut])
def list_posts(response: Response, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    total = db.scalar(select(func.count()).select_from(Post).where(Post.published == True)) or 0
    response.headers["X-Total-Count"] = str(total)
    stmt = select(Post).where(Post.published == True).order_by(desc(Post.created_at)).offset((page-1)*page_size).limit(page_size)
    return db.scalars(stmt).all()


@router.get("/{slug}", response_model=PostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    obj = db.scalar(select(Post).where(Post.published == True, Post.slug == slug))
    if not obj:
        raise HTTPException(status_code=404, detail="Post not found")
    return obj
