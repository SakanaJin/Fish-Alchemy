from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Entities.Users import UserShallowDto

DEFAULT_LOGO = "/media/group/logo/default.png"
DEFAULT_BANNER = "/media/group/banner/default.png"

class GroupCreateDto(BaseModel):
    name: str

class GroupUpdateDto(BaseModel):
    name: str

class GroupGetDto(BaseModel):
    id: int
    name: str
    logo_path: str
    banner_path: str
    creator: UserShallowDto
    users: list
    projects: list

class GroupShallowDto(BaseModel):
    id: int
    name: str
    logo_path: str

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    logo_path = Column(String(255), default="/media/group/logo/default.png")
    banner_path = Column(String(255), default="/media/group/banner/default.png")

    users = relationship("User", secondary='user_group', back_populates='groups')
    projects = relationship("Project", back_populates="group", cascade="all, delete-orphan")

    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User")

    def toGetDto(self) -> GroupGetDto:
        groupgetdto = GroupGetDto(
            id=self.id, 
            name=self.name, 
            logo_path=self.logo_path, 
            banner_path=self.banner_path, 
            creator=self.creator.toShallowDto(),
            users=[user.toShallowDto() for user in self.users], 
            projects=[project.toShallowDto() for project in self.projects]
        )
        return groupgetdto
    
    def toShallowDto(self) -> GroupShallowDto:
        groupdto = GroupShallowDto(id=self.id, name=self.name, logo_path=self.logo_path)
        return groupdto