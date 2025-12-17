from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Entities.Groups import GroupShallowDto
from Fish_Alchemy_Data.Entities.Users import UserShallowDto

DEFAULT_LOGO = '/media/project/logo/default.png'
DEFAULT_BANNER = '/media/project/banner/default.jpg'

class ProjectCreateDto(BaseModel):
    name: str
    description: str
    discord_webhook_url: str
    github_url: str

class ProjectUpdateDto(BaseModel):
    name: str
    description: str
    discord_webhook_url: str
    github_url: str

class ProjectGetDto(BaseModel):
    id: int
    name: str
    description: str
    lead: UserShallowDto
    ticket_count: int
    discord_webhook_url: str
    github_url: str
    logo_path: str
    banner_path: str
    group: GroupShallowDto
    tickets: list
    graphs: list

class ProjectShallowDto(BaseModel):
    id: int
    name: str
    logo_path: str

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=False, nullable=False)
    description = Column(Text, nullable=True)
    ticket_count = Column(Integer, default=0)
    discord_webhook_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    logo_path = Column(String(255), default="/media/project/logo/default.png")
    banner_path = Column(String(255), default="/media/project/banner/default.jpg")

    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"))
    group = relationship("Group", back_populates="projects")

    tickets = relationship("Ticket", back_populates="project", cascade="all, delete-orphan")

    graphs = relationship("Graph", back_populates="project", cascade="all, delete-orphan")

    lead_id = Column(Integer, ForeignKey("users.id"))
    lead = relationship("User")

    def toGetDto(self) -> ProjectGetDto:
        projectdto = ProjectGetDto(
            id=self.id, 
            name=self.name, 
            description=self.description,
            lead=self.lead.toShallowDto(), 
            ticket_count=self.ticket_count,
            discord_webhook_url=self.discord_webhook_url, 
            github_url=self.github_url, logo_path=self.logo_path, 
            banner_path=self.banner_path, 
            group=self.group.toShallowDto(),
            tickets=[ticket.toShallowDto() for ticket in self.tickets],
            graphs=[graph.toShallowDto() for graph in self.graphs]
        )
        return projectdto
    
    def toShallowDto(self) -> ProjectShallowDto:
        projectdto = ProjectShallowDto(id=self.id, name=self.name, logo_path=self.logo_path)
        return projectdto