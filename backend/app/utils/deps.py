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


# --- Pobieranie aktualnego użytkownika z JWT ---
def get_current_user(authorization: str = None) -> CurrentUser:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header")

    token = authorization.split(" ", 1)[1]
    payload = auth.decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    roles = payload.get("roles") or []
    return CurrentUser(user_id=int(payload.get("sub")), email=payload.get("email", ""), roles=roles)


# --- Sprawdzanie ról ---
def require_roles(*allowed: str):
    def _inner(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not any(r in allowed for r in user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role"
            )
        return user

    return _inner
