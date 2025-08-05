# db/user_crud.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate
from app.utils.hash import hash_password


def create_user(db: Session, user: UserCreate):
    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
