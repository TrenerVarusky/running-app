from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

# konfiguracja
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

class CurrentUser:
    def __init__(self, user_id: int, email: str, roles: list[str]):
        self.id = user_id
        self.email = email
        self.roles = roles