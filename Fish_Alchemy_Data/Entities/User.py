from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

class UserCreateDto(BaseModel):
    username: str
    email: str
    password: str

class UserGetDto(BaseModel):
    id: int
    username: str
    pfp_path: str
    banner_path: str
    groups: list

class UserShallowDto(BaseModel):
    id: int
    username: str
    pfp_path: str

class LoginDto(BaseModel):
    username: str
    password: str

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    pfp_path = Column(String(255), default="/media/user/pfp/frog.jpg")
    banner_path = Column(String(255), default="/media/user/banner/P817hp4.jpg")

    auth = relationship("UserAuth", back_populates="user", uselist=False, cascade="all, delete-orphan")
    groups = relationship("Group", secondary='user_group', back_populates='users')

    def toGetDto(self) -> UserGetDto:
        userdto = UserGetDto(id=self.id, username=self.username, pfp_path=self.pfp_path, banner_path=self.banner_path, groups=[group.toShallowDto for group in self.groups])
        return userdto
    
    def toShallowDto(self) -> UserShallowDto:
        userdto = UserShallowDto(id=self.id, username=self.username, pfp_path=self.pfp_path)
