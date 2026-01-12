from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base
from Fish_Alchemy_Data.Entities.Graphs import GraphShallowDto
from Fish_Alchemy_Data.Entities.NodeAssociation import NodeAssociation

class NodeCreateDto(BaseModel):
    name: str

class NodeUpdateDto(BaseModel):
    name: str

class NodeGetDto(BaseModel):
    id: int
    name: str
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

    graph_id = Column(Integer, ForeignKey("graphs.id"))
    graph = relationship("Graph", back_populates="nodes")

    # dependencies = relationship(
    #     "Node",
    #     secondary="node_associations",
    #     primaryjoin="NodeAssociation.dependent_id==Node.id",
    #     secondaryjoin="NodeAssociation.dependency_id==Node.id",
    #     cascade="all, delete-orphan",
    #     single_parent=True,
    #     passive_deletes=True
    # )

    dependents = relationship(
        "NodeAssociation",
        foreign_keys=[NodeAssociation.dependent_id],
        back_populates="dependent",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    dependencies = relationship(
        "NodeAssociation",
        foreign_keys=[NodeAssociation.dependency_id],
        back_populates="dependency",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def toGetDto(self) -> NodeGetDto:
        nodedto = NodeGetDto(
            id=self.id,
            name=self.name,
            graph=self.graph.toShallowDto(),
            dependencies=[edge.dependency.toShallowDto() for edge in self.dependents],
        )
        return nodedto
    
    def toShallowDto(self) -> NodeShallowDto:
        nodedto = NodeShallowDto(
            id=self.id,
            name=self.name
        )
        return nodedto