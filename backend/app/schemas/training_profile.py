from pydantic import BaseModel, Field, ConfigDict, conint, confloat
from typing import Optional, List, Literal

class HRZones(BaseModel):
    z1: List[int]; z2: List[int]; z3: List[int]; z4: List[int]; z5: List[int]

class TrainingProfileIn(BaseModel):
    weight_kg: Optional[float] = Field(None, gt=0, description="Waga w kg")
    height_cm: Optional[float] = Field(None, gt=0, description="Wzrost w cm")
    resting_hr: Optional[int] = Field(None, gt=30, lt=120, description="Tętno spoczynkowe (HRrest)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "weight_kg": 0,
                "height_cm": 0,
                "resting_hr": 0
            }
        }
    )

class TrainingProfileOut(TrainingProfileIn):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    hr_zones: Optional[HRZones] = None
    resting_hr: Optional[int] = None
