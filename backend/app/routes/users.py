# app/routes/users.py
from fastapi import APIRouter
from db.user_crud import get_all_users

router = APIRouter()

@router.get("/users")
def read_users():
    return get_all_users()
