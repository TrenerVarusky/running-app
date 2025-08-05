from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate, UserOut
from app.models.user import User
from db.connection import SessionLocal
from core.security import hash_password
from core.auth import create_access_token
from fastapi.responses import JSONResponse
from app.schemas.auth import LoginUser
from app.utils.auth import verify_password
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Dependency do sesji DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Użytkownik o takim e-mailu już istnieje.")

    hashed_pw = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Tworzenie tokenu
    token = create_access_token(data={"email": new_user.email, "name": new_user.name, "role": new_user.role})

    return JSONResponse(
        status_code=201,
        content={
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "access_token": token,
            "token_type": "bearer"
        }
    )

@router.post("/login")
def login_user(user_data: LoginUser, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Nieprawidłowy e-mail lub hasło.")

    access_token = create_access_token(data={"email": user.email, "name": user.name, "role": user.role})
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "access_token": access_token,
        "token_type": "bearer"
    }
