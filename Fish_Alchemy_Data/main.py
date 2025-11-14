from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from Fish_Alchemy_Data.Controllers import UsersController, AuthController
from Fish_Alchemy_Data.database import Base, engine

from Fish_Alchemy_Data.Entities.User import User
from Fish_Alchemy_Data.Entities.Auth import UserAuth

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(UsersController.router)
app.include_router(AuthController.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)