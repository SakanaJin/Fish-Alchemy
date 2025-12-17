from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Entities.Projects import ProjectShallowDto

class GraphCreateDto(BaseModel):
    name: str
    description: str

class GraphUpdateDto(BaseModel):
    name: str
    description: str

class GraphGetDto(BaseModel):
    id: int
    name: str
    description: str
    project: ProjectShallowDto
    nodes: list

class GraphShallowDto(BaseModel):
    id: int
    name: str

class Graph(Base):
    __tablename__ = "graphs"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    project = relationship("Project", back_populates="graphs")

    nodes = relationship("Node", back_populates="graph", cascade="all, delete-orphan")

    def toGetDto(self) -> GraphGetDto:
        graphdto = GraphGetDto(
            id=self.id,
            name=self.name,
            description=self.description,
            project=self.project.toShallowDto(),
            nodes=[node.toShallowDto() for node in self.nodes]
        )
        return graphdto
    
    def toShallowDto(self) -> GraphShallowDto:
        graphdto = GraphShallowDto(
            id=self.id,
            name=self.name
        )
        return graphdto