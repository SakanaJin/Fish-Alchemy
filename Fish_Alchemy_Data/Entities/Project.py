from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Entities.Groups import GroupShallowDto

class ProjectGetDto(BaseModel):
    id: int
    name: str
    description: str
    discord_webhook_url: str
    github_url: str
    logo_path: str
    banner_path: str
    group: GroupShallowDto

class ProjectShallowDto(BaseModel):
    id: int
    name: str
    logo_path: str

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=False, nullable=False)
    description = Column(Text, nullable=True)
    discord_webhook_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    logo_path = Column(String(255), default="/media/project/logo/star.png")
    banner_path = Column(String(255), default="/media/project/banner/default.jpg")

    group_id = Column(Integer, ForeignKey("groups.id"))
    group = relationship("Group", back_populates="projects")

    def toGetDto(self) -> ProjectGetDto:
        projectdto = ProjectGetDto(
            id=self.id, 
            name=self.name, 
            description=self.description, 
            discord_webhook_url=self.discord_webhook_url, 
            github_url=self.github_url, logo_path=self.logo_path, 
            banner_path=self.banner_path, 
            group=self.group.toShallowDto()
        )
        return projectdto
    
    def toShallowDto(self) -> ProjectShallowDto:
        projectdto = ProjectShallowDto(id=self.id, name=self.name, logo_path=self.logo_path)
        return projectdto