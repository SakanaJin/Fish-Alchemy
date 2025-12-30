from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

DEFAULT_PFP = "/media/user/pfp/default.jpg"
DEFAULT_BANNER = "/media/user/banner/default.jpg"

class UserCreateDto(BaseModel):
    username: str
    email: str
    password: str

class UserUpdateDto(BaseModel):
    username: str

class UserGetDto(BaseModel):
    id: int
    username: str
    pfp_path: str
    banner_path: str
    groups: list
    tickets: list

class UserShallowDto(BaseModel):
    id: int
    username: str
    pfp_path: str
    banner_path: str

class LoginDto(BaseModel):
    username: str
    password: str

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    pfp_path = Column(String(255), default=DEFAULT_PFP)
    banner_path = Column(String(255), default=DEFAULT_BANNER)

    auth = relationship("UserAuth", back_populates="user", uselist=False, cascade="all, delete-orphan")

    groups = relationship("Group", secondary='user_group', back_populates='users')

    tickets = relationship("Ticket", back_populates="user")

    def toGetDto(self) -> UserGetDto:
        userdto = UserGetDto(
            id=self.id,
            username=self.username, 
            pfp_path=self.pfp_path, 
            banner_path=self.banner_path, 
            groups=[group.toShallowDto() for group in self.groups],
            tickets=[ticket.toShallowDto() for ticket in self.tickets]
        )
        return userdto
    
    def toShallowDto(self) -> UserShallowDto:
        userdto = UserShallowDto(id=self.id, username=self.username, pfp_path=self.pfp_path, banner_path=self.banner_path)
        return userdto
