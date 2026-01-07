# app/deps.py
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.connection import SessionLocal
from core import auth  # import Twojego auth.py


# --- DB session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- CurrentUser wrapper ---
class CurrentUser:
    def __init__(self, user_id: int, email: str, roles: list[str]):
        self.id = user_id
        self.email = email
        self.roles = roles

