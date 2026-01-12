from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

class NodeAssociation(Base):
    __tablename__ = "node_associations"
    dependent_id = Column(Integer, ForeignKey('nodes.id', ondelete="CASCADE"), primary_key=True)
    dependency_id = Column(Integer, ForeignKey('nodes.id', ondelete="CASCADE"), primary_key=True)

    dependent = relationship("Node", foreign_keys=[dependent_id], back_populates="dependents")
    dependency = relationship("Node", foreign_keys=[dependency_id], back_populates="dependencies")