from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from db.connection import SessionLocal
from app.models.user import User
from app.schemas.user_schema import UserPublic

router = APIRouter(
    tags=["Users"]
)

# Dependency do sesji DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/Users", response_model=List[UserPublic])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
