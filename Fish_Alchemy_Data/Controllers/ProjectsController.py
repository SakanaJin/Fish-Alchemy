from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
import os
import uuid
from Fish_Alchemy_Data.database import get_db
from Fish_Alchemy_Data.Common.Response import Response, HttpException

from Fish_Alchemy_Data.Entities.Projects import Project, ProjectUpdateDto, ProjectCreateDto, DEFAULT_LOGO, DEFAULT_BANNER
from Fish_Alchemy_Data.Entities.Groups import Group
from Fish_Alchemy_Data.Entities.Users import User
from Fish_Alchemy_Data.Controllers.AuthController import get_current_user

LOGO_PATH = "/media/project/logo"
BANNER_PATH = "/media/project/banner"

router = APIRouter(prefix="/api/projects", tags=['Projects'])

@router.post("/groupid/{groupid}")
def create(projectdto: ProjectCreateDto, groupid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    if len(projectdto.name) == 0:
        response.add_error("name", "name cannot be empty")
        raise HttpException(status_code=400, response=response)
    group = db.query(Group).filter(Group.id == groupid).first()
    if not group:
        response.add_error("group", "group not found")
    user = db.query(User).filter(User.id == user.id).first()
    if not user:
        response.add_error("user", "user not found")
    if response.has_errors:
        raise HttpException(status_code=404, response=response)
    project = Project(
        name=projectdto.name,
        description=projectdto.description,
        discord_webhook_url=projectdto.discord_webhook_url,
        github_url=projectdto.github_url,
        lead=user,
        group=group
    )
    db.add(project)
    db.commit()
    response.data=project.toGetDto()
    return response

@router.patch("/{projectid}")
def update(projectdto: ProjectUpdateDto, projectid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if len(projectdto.name) == 0:
        response.add_error("name", "name cannot be empty")
    if not project:
        response.add_error("id", "project not found")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    if project.lead_id != user.id:
        response.add_error("user", "only lead can update project")
        raise HttpException(status_code=400, response=response)
    project.name = projectdto.name    
    project.description = projectdto.description
    project.discord_webhook_url = project.discord_webhook_url
    project.github_url = projectdto.github_url
    db.commit()
    response.data = project.toGetDto()
    return response

@router.patch("/{projectid}/user/{userid}")
def change_lead(projectid: int, userid: int, db: Session = Depends(get_db), lead: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=404, response=response)
    if project.lead_id != lead.id:
        response.add_error("lead", "only lead can chage lead")
    if project.lead_id == userid:
        response.add_error("user", "user is already lead")
    user = db.query(User).filter(User.id == userid).first()
    if not user:
        response.add_error("userid", "user not found")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    project.lead = user
    db.commit()
    response.data = project.toGetDto()
    return response

@router.get("/{id}")
def get_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=404, response=response)
    response.data = project.toGetDto()
    return response

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    projects = db.query(Project).all()
    response.data = [project.toGetDto() for project in projects]
    return response

@router.get("/{id}/users")
def get_users(id: int, db: Session = Depends(get_db)):
    response = Response()
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=404, response=response)
    group = project.group
    users = db.query(Group).filter(Group.id == group.id).first().users
    response.data = [user.toShallowDto() for user in users]
    return response

@router.patch("/{projectid}/logo")
async def update_logo(projectid: int, file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
    if not file.content_type.startswith("image/"):
        response.add_error("file", "file must be an image")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    if project.lead_id != user.id:
        response.add_error("user", "only lead can update logo")
        raise HttpException(status_code=400, response=response)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    cwd = os.getcwd()
    filepath = os.path.join(LOGO_PATH, filename)
    if project.logo_path != DEFAULT_LOGO:
        os.remove(os.path.join(cwd, project.logo_path[1:]))
    with open(os.path.join(cwd, filepath[1:]), 'wb') as f:
        f.write(await file.read())
    project.logo_path = filepath
    db.commit()
    response.data = project.toGetDto()
    return response

@router.patch("/{projectid}/banner")
async def update_banner(projectid: int, file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
    if not file.content_type.startswith("image/"):
        response.add_error("file", "file must be an image")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    if project.lead_id != user.id:
        response.add_error("user", "only lead can update banner")
        raise HttpException(status_code=400, response=response)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    cwd = os.getcwd()
    filepath = os.path.join(BANNER_PATH, filename)
    if project.banner_path != DEFAULT_BANNER:
        os.remove(os.path.join(cwd, project.banner_path[1:]))
    with open(os.path.join(cwd, filepath[1:]), 'wb') as f:
        f.write(await file.read())
    project.banner_path = filepath
    db.commit()
    response.data = project.toGetDto()
    return response

@router.delete("/{projectid}/logo")
def remove_logo(projectid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=404, response=response)
    if project.logo_path == DEFAULT_LOGO:
        response.add_error("logo", "no logo")
    if project.lead_id != user.id:
        response.add_error("user", "only lead can remove logo")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    cwd = os.getcwd()
    os.remove(os.path.join(cwd, project.logo_path[1:]))
    project.logo_path = DEFAULT_LOGO
    db.commit()
    response.data = project.toGetDto()
    return response

@router.delete("/{projectid}/banner")
def remove_banner(projectid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=400, response=response)
    if project.banner_path == DEFAULT_BANNER:
        response.add_error("banner", "no banner")
    if project.lead_id != user.id:
        response.add_error("user", "only lead can remove banner")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    cwd = os.getcwd()
    os.remove(os.path.join(cwd, project.banner_path[1:]))
    project.banner_path = DEFAULT_BANNER
    db.commit()
    response.data = project.toGetDto()
    return response

@router.delete("/{projectid}")
def delete(projectid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    response = Response()
    project = db.query(Project).filter(Project.id == projectid).first()
    if not project:
        response.add_error("id", "project not found")
        raise HttpException(status_code=404, response="Project not found")
    if project.lead_id != user.id:
        response.add_error("user", "Only lead can delete project")
        raise HttpException(status_code=400, response=response)
    db.delete(project)
    db.commit()
    response.data = True
    return response