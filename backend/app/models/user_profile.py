# app/models/user_profile.py
from sqlalchemy import Column, Integer, String, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from db.connection import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    # FK do users.id (INT) + klucz główny = 1–1 z User
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)

    first_name = Column(String(80), nullable=True)
    last_name  = Column(String(80), nullable=True)
    birth_date = Column(Date, nullable=True)

    height_cm  = Column(DECIMAL(5, 2))
    weight_kg  = Column(DECIMAL(5, 2), nullable=True)

    gender = Column(String(10), nullable=True)              # 'male' | 'female' | 'other'
    preferred_units = Column(String(10), nullable=True, default="metric")  # 'metric' | 'imperial'

    # odwrotna strona relacji (w User: profile = relationship(...))
    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile user_id={self.user_id}>"
