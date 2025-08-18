# app/schemas/profile.py
from pydantic import BaseModel, Field
from pydantic import ConfigDict
from typing import Optional, Literal
from datetime import date

class ProfileIn(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    height_cm: Optional[float] = Field(None, gt=0)  # <-- float
    weight_kg: Optional[float] = Field(None, gt=0)  # <-- float
    gender: Optional[Literal["male", "female"]] = None
    preferred_units: Optional[Literal["metric", "imperial"]] = None

class ProfileOut(ProfileIn):
    model_config = ConfigDict(from_attributes=True)  # pydantic v2 odpowiednik orm_mode
    user_id: int
