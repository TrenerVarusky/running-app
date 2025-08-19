# app/routers/me_profile.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas.profile import ProfileIn, ProfileOut
from app.models.user_profile import UserProfile
from db.connection import SessionLocal
from app.auth.deps import get_current_user  # <-- tu

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/MyProfile", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db), user=Depends(get_current_user)):
    prof = db.get(UserProfile, user.id)
    if not prof:
        prof = UserProfile(user_id=user.id)
        db.add(prof); db.commit(); db.refresh(prof)
    return prof

@router.put("/ChangeMyProfile", response_model=ProfileOut, status_code=status.HTTP_200_OK)
def update_profile(payload: ProfileIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    prof = db.get(UserProfile, user.id)
    if not prof:
        prof = UserProfile(user_id=user.id)
        db.add(prof)
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(prof, k, v)
    db.commit(); db.refresh(prof)
    return prof
