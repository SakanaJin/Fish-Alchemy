from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

class GroupGetDto(BaseModel):
    id: str
    name: str
    logo_path: str
    banner_path: str
    users: list
    projects: list

class GroupShallowDto(BaseModel):
    id: str
    name: str
    logo_path: str

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    logo_path = Column(String(255), default="/media/group/logo/default.png")
    banner_path = Column(String(255), default="/media/group/banner/default.png")

    users = relationship("User", secondary='user_group', back_populates='groups')
    projects = relationship("Project", back_populates="group")

    def toGetDto(self) -> GroupGetDto:
        groupgetdto = GroupGetDto(
            id=self.id, 
            name=self.name, 
            logo_path=self.logo_path, 
            banner_path=self.banner_path, 
            users=[user.toShallowDto() for user in self.users], 
            project=[project.toShallowDto() for project in self.projects]
        )
        return groupgetdto
    
    def toShallowDto(self) -> GroupShallowDto:
        groupdto = GroupShallowDto(id=self.id, name=self.name, logo_path=self.logo_path)
        return groupdto