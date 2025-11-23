from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

class NodeAssociation(Base):
    __tablename__ = "node_associations"
    dependent_id = Column(Integer, ForeignKey('nodes.id'), primary_key=True)
    dependency_id = Column(Integer, ForeignKey('nodes.id'), primary_key=True)