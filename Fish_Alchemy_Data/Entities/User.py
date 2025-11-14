from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from Fish_Alchemy_Data.database import Base
from pydantic import BaseModel

class UserCreateDto(BaseModel):
    username: str
    email: str
    password: str

class UserGetDto(BaseModel):
    id: int
    username: str

class LoginDto(BaseModel):
    username: str
    password: str

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    auth = relationship("UserAuth", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def toDto(self) -> UserGetDto:
        userdto = UserGetDto(id=self.id, username=self.username)
        return userdto
