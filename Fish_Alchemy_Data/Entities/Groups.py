from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    users = relationship("users", secondary='user_group', back_populates='groups')