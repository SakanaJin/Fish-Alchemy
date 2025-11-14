from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from Fish_Alchemy_Data.database import Base

class UserAuth(Base):
    __tablename__ = "auth"
    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user = relationship("User", back_populates="auth")
