from pydantic import BaseModel, EmailStr
from typing import Optional

# 🔐 Do rejestracji
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Uzytkownik"  # domyślnie użytkownik

# 🔐 Do logowania
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 📤 Publiczny widok użytkownika (np. lista użytkowników)
class UserPublic(BaseModel):
    email: EmailStr
    role: Optional[str] = "Uzytkownik"

    class Config:
        orm_mode = True

# 📤 Pełne dane użytkownika (np. po rejestracji/logowaniu)
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True
