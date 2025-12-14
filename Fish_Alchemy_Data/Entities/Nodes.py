from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Entities.Graphs import GraphShallowDto

class NodeCreateDto(BaseModel):
    name: str
    description: str

class NodeUpdateDto(BaseModel):
    name: str
    description: str

class NodeGetDto(BaseModel):
    id: int
    name: str
    description: str
    graph: GraphShallowDto
    dependencies: list
    # dependents: list

class NodeShallowDto(BaseModel):
    id: int
    name: str

class Node(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    graph_id = Column(Integer, ForeignKey("graphs.id"))
    graph = relationship("Graph", back_populates="nodes")

    dependencies = relationship(
        "Node",
        secondary="node_associations",
        primaryjoin="NodeAssociation.dependent_id==Node.id",
        secondaryjoin="NodeAssociation.dependency_id==Node.id",
        # backref="dependents"
    )

    # dependents = relationship(
    #     "Node",
    #     secondary="node_associations",
    #     primaryjoin="NodeAssociation.dependency_id==Node.id",
    #     secondaryjoin="NodeAssociation.dependent_id==Node.id",
    #     backref="dependencies"
    # )

    def toGetDto(self) -> NodeGetDto:
        nodedto = NodeGetDto(
            id=self.id,
            name=self.name,
            description=self.description,
            graph=self.graph.toShallowDto(),
            dependencies=[node.toShallowDto() for node in self.dependencies],
            # dependents=[node.toShallowDto() for node in self.dependents]
        )
        return nodedto
    
    def toShallowDto(self) -> NodeShallowDto:
        nodedto = NodeShallowDto(
            id=self.id,
            name=self.name
        )
        return nodedto