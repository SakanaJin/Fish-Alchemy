from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from Fish_Alchemy_Data.database import Base, engine, db_session, URIELPASS

from Fish_Alchemy_Data.Common.Response import HttpException
from Fish_Alchemy_Data.Common.Role import Role

from Fish_Alchemy_Data.Entities.Users import User
from Fish_Alchemy_Data.Entities.Auth import UserAuth
from Fish_Alchemy_Data.Entities.Groups import Group
from Fish_Alchemy_Data.Entities.UserGroups import UserGroup
from Fish_Alchemy_Data.Entities.Projects import Project
from Fish_Alchemy_Data.Entities.Tickets import Ticket
from Fish_Alchemy_Data.Entities.Graphs import Graph
from Fish_Alchemy_Data.Entities.Nodes import Node
from Fish_Alchemy_Data.Entities.NodeAssociation import NodeAssociation

from Fish_Alchemy_Data.Controllers import UsersController, AuthController, GroupsController, ProjectsController, TicketsController, GraphsController, NodesController

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_Uriel()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(UsersController.router)
app.include_router(AuthController.router)
app.include_router(GroupsController.router)
app.include_router(ProjectsController.router)
app.include_router(TicketsController.router)
app.include_router(GraphsController.router)
app.include_router(NodesController.router)

app.mount("/media", StaticFiles(directory="media"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "http://127.0.0.1:4173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HttpException)
def HttpExceptionHandler(request: Request, exception: HttpException):
    return JSONResponse(
        exception.response.model_dump(),
        status_code=exception.status_code
    )

def seed_Uriel():
    with db_session() as db:
        if db.query(User).filter(User.username == "Uriel").first():
            return
        Uriel = User(
            username="Uriel"
        )
        db.add(Uriel)
        db.flush()
        UrielAuth = UserAuth(
            id=Uriel.id,
            email="Uriel@Heaven.God", # I really hope this domain doesn't exist because I sure ain't checkin
            role=Role.ADMIN,
            password_hash=UsersController.create_password_hash(URIELPASS)
        )
        db.add(UrielAuth)
        db.commit()