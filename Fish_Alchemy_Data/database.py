import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

load_dotenv()
DBSTRING = os.getenv("DBSTRING")
URIELPASS = os.getenv("URIELPASS")

engine = create_engine(DBSTRING, echo=True, future=True)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()