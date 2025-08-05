# app/schemas/token_schema.py

from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
