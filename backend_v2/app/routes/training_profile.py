from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend_v2.app.core.database import get_db
from backend_v2.app.models.user_training_profile import UserTrainingProfile
from backend_v2.app.models.user_profile import UserProfile
from backend_v2.app.schemas.training_profile import TrainingProfileIn, TrainingProfileOut
from backend_v2.app.api.deps import get_current_user
from decimal import Decimal
from datetime import date
from typing import Optional, cast, Any
import json

router = APIRouter(prefix="/TrainingProfile", tags=["TrainingProfile"])

def age_from_birth(d: Optional[date]) -> Optional[int]:
    if not d: return None
    today = date.today()
    return today.year - d.year - ( (today.month, today.day) < (d.month, d.day) )

def tanaka_hrmax(age: int) -> int:
    return int(round(208 - 0.7 * age))

def karvonen_zones(hrmax: int, hrrest: int):
    hrr = hrmax - hrrest
    def rng(lo: float, hi: float):
        lo_v = int(round(hrrest + hrr * lo))
        hi_v = int(round(hrrest + hrr * hi))
        return [lo_v, hi_v]
    return {
        "z1": rng(0.50, 0.60),
        "z2": rng(0.60, 0.70),
        "z3": rng(0.70, 0.80),
        "z4": rng(0.80, 0.90),
        "z5": rng(0.90, 1.00),
    }

def get_or_create_training(db: Session, user_id: int) -> UserTrainingProfile:
    p = db.get(UserTrainingProfile, user_id)
    if not p:
        p = UserTrainingProfile(user_id=user_id)
        db.add(p)
        db.flush()
        db.commit()
    return p

def serialize_out(p: UserTrainingProfile) -> TrainingProfileOut:
    weight = cast(Optional[Decimal], p.weight_kg)
    height = cast(Optional[Decimal], p.height_cm)
    zones_json: Optional[str] = cast(Optional[str], p.hr_zones_json)
    return TrainingProfileOut.model_validate({
        "user_id": p.user_id,
        "weight_kg": float(weight) if weight is not None else None,
        "height_cm": float(height) if height is not None else None,
        "resting_hr": p.resting_hr,
        "hr_zones": json.loads(zones_json) if zones_json else None,
    })


@router.get("/MyTrainingProfile", response_model=TrainingProfileOut)
def read_training_profile(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    p = get_or_create_training(db, user.id)
    zones_json: Optional[str] = cast(Optional[str], p.hr_zones_json)

    return TrainingProfileOut.model_validate({
        "user_id": p.user_id,
        "weight_kg": float(cast(Any, p.weight_kg)) if p.weight_kg is not None else None,
        "height_cm": float(cast(Any, p.height_cm)) if p.height_cm is not None else None,
        "resting_hr": p.resting_hr,
        "hr_zones": json.loads(zones_json) if zones_json else None,
    })

@router.put("/ChangeTrainingProfile", response_model=TrainingProfileOut)
def update_training_profile(
    payload: TrainingProfileIn,
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    p = get_or_create_training(db, user.id)
    data = payload.model_dump(exclude_unset=True)

    for k in ("weight_kg", "height_cm", "resting_hr"):
        if k in data:
            setattr(p, k, data[k])

    prof = db.get(UserProfile, user.id)
    birth_date_val: Optional[date] = cast(Optional[date], getattr(prof, "birth_date", None))
    resting_hr_val: Optional[int] = cast(Optional[int], getattr(p, "resting_hr", None))

    zones = None
    if resting_hr_val is not None:
        if "hr_max" in data and data["hr_max"]:
            hrmax_used = int(data["hr_max"])
            zones = karvonen_zones(hrmax_used, resting_hr_val)
        else:
            age_opt: Optional[int] = age_from_birth(birth_date_val)
            if age_opt is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nie podano daty urodzenia. Uzupełnij ją w sekcji „Szczegóły profilu”, aby obliczyć strefy tętna."
                )
            age_val: int = cast(int, age_opt)
            hrmax_used = tanaka_hrmax(age_val)
            zones = karvonen_zones(hrmax_used, resting_hr_val)
    else:
        zones = None

    setattr(p, "hr_zones_json", json.dumps(zones) if zones else None)

    db.add(p); db.flush(); db.commit(); db.refresh(p)

    zones_json: Optional[str] = cast(Optional[str], p.hr_zones_json)
    return TrainingProfileOut.model_validate({
        "user_id": p.user_id,
        "weight_kg": float(cast(Any, p.weight_kg)) if p.weight_kg is not None else None,
        "height_cm": float(cast(Any, p.height_cm)) if p.height_cm is not None else None,
        "resting_hr": resting_hr_val,
        "hr_zones": json.loads(zones_json) if zones_json else None,
    })
