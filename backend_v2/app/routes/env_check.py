from fastapi import APIRouter
import os
from backend_v2.app.core.auth import load_dotenv

router = APIRouter()

@router.get("/env-check")
def check_env():
    return {
        "server": os.getenv("DB_SERVER"),
        "port": os.getenv("DB_PORT"),
        "db": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER")
    }