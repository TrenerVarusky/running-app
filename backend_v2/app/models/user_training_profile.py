from sqlalchemy import Column, Integer, Numeric, Text, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend_v2.app.core.database import Base

class UserTrainingProfile(Base):
    __tablename__ = "user_training_profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)
    height_cm = Column(Numeric(5, 2), nullable=True)
    resting_hr = Column(Integer, nullable=True)
    hr_zones_json = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.sysdatetime(), nullable=False)
    updated_at = Column(DateTime, server_default=func.sysdatetime(), onupdate=func.sysdatetime(), nullable=False)

    user = relationship("User", back_populates="training_profile")

    def __repr__(self) -> str:
        return f"<UserTrainingProfile user_id={self.user_id}>"
