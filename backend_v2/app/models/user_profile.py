from sqlalchemy import Column, Integer, String, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)

    first_name = Column(String(80), nullable=True)
    last_name  = Column(String(80), nullable=True)
    birth_date = Column(Date, nullable=True)

    gender = Column(String(10), nullable=True)

    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile user_id={self.user_id}>"
