# app/models/user.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.connection import Base
from .user_training_profile import UserTrainingProfile
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String, default="Użytkownik")

    # relacja jeden-do-jeden z profilem
    profile = relationship("UserProfile", uselist=False, back_populates="user")
    training_profile = relationship(UserTrainingProfile, uselist=False, back_populates="user")