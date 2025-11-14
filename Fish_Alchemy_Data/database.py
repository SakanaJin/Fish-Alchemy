import pymysql
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()
USER = os.getenv('USER')
PASSWORD = os.getenv('PASSWORD')
IPPORT = os.getenv('IPPORT')

#engine = create_engine(f'{SQL}+{DRIVER}://{USER}:{PASSWORD}@{IPPORT}/{DATABASE}')
engine = create_engine('mysql+pymysql://root:1337@localhost:3306/Fish', echo=True, future=True)
# engine = create_engine(f'mysql+pymysql://{USER}:{PASSWORD}@{IPPORT}/Fish')
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
