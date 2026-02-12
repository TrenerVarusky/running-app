from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend_v2.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String, default="Użytkownik")

    profile = relationship(
        "UserProfile",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )

    training_profile = relationship(
        "UserTrainingProfile",
        uselist=False,
        back_populates="user",
        cascade="all, delete-orphan",
    )
