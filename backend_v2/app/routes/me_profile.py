# app/routers/me_profile.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend_v2.app.schemas.profile import ProfileIn, ProfileOut
from backend_v2.app.models.user_profile import UserProfile
from backend_v2.app.core.database import get_db
from backend_v2.app.api.deps import get_current_user

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
