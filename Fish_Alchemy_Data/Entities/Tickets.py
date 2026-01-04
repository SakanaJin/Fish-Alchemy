from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime, timedelta

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Common.TicketState import TicketState
from Fish_Alchemy_Data.Entities.Users import UserShallowDto
from Fish_Alchemy_Data.Entities.Projects import ProjectShallowDto

class TicketCreateDto(BaseModel):
    name: str
    description: str
    github_url: str

class TicketUpdateDto(BaseModel):
    name: str
    description: str
    github_url: str

class TicketStateDto(BaseModel):
    state: str

class TicketDateDto(BaseModel):
    date: str

class TicketGetDto(BaseModel):
    id: int
    name: str
    description: str
    ticketnum: int
    state: TicketState
    github_url: str
    created_at: datetime
    duedate: datetime
    user: UserShallowDto
    project: ProjectShallowDto
    
class TicketShallowDto(BaseModel):
    id: int
    name: str
    description: str
    ticketnum: int
    state: TicketState
    github_url: str
    created_at: datetime
    duedate: datetime
    projectid: int
    projectname: str
    user: UserShallowDto

class Ticket(Base):
    __tablename__ = 'tickets'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    ticketnum = Column(Integer)
    state = Column(Enum(TicketState), default=TicketState.BACKLOG, nullable=False)
    github_url = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.now())
    duedate = Column(DateTime(timezone=True), default=datetime.now() + timedelta(weeks=1))

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="tickets")

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    project = relationship("Project", back_populates="tickets")

    def toGetDto(self) -> TicketGetDto:
        ticketdto = TicketGetDto(
            id=self.id,
            name=self.name,
            description=self.description,
            ticketnum=self.ticketnum,
            state=self.state,
            github_url=self.github_url,
            created_at=self.created_at,
            duedate=self.duedate,
            user=self.user.toShallowDto(),
            project=self.project.toShallowDto()
        )
        return ticketdto
    
    def toShallowDto(self) -> TicketShallowDto:
        ticketdto = TicketShallowDto(
            id=self.id,
            name=self.name,
            description=self.description,
            ticketnum=self.ticketnum,
            state=self.state,
            github_url=self.github_url,
            created_at=self.created_at,
            duedate=self.duedate,
            projectid=self.project.id,
            projectname=self.project.name,
            user=self.user.toShallowDto()
        )
        return ticketdto