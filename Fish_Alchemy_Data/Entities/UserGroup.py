from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship, ForeignKey
from pydantic import BaseModel

from Fish_Alchemy_Data.database import Base

class UserGroup(Base):
    __tablename__ = "user_group"
    user_id = Column(Integer, ForeignKey('users.id'))
    group_id = Column(Integer, ForeignKey('groups.id'))