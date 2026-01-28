from pydantic import BaseModel, EmailStr

class LoginUser(BaseModel):
    email: EmailStr
    password: str