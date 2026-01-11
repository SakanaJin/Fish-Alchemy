from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from pydantic import BaseModel
import bcrypt

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Common.Role import Role

def create_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

class ChangePassDto(BaseModel):
    current_password: str
    new_password: str
    confirm_new: str

class UserAuth(Base):
    __tablename__ = "auth"
    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(Role), default=Role.USER, nullable=False)

    user = relationship("User", back_populates="auth")
