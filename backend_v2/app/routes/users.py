from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend_v2.app.core.database import get_db
from backend_v2.app.models.user import User
from backend_v2.app.schemas.user_schema import UserPublic

router = APIRouter(
    tags=["Users"]
)

@router.get("/Users", response_model=List[UserPublic])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
