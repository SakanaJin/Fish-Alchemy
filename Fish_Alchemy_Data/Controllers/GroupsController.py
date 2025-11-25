from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
import os
import uuid
from Fish_Alchemy_Data.database import get_db
from Fish_Alchemy_Data.Common.Response import Response, HttpException

from Fish_Alchemy_Data.Entities.Groups import Group, GroupCreateDto, GroupUpdateDto, DEFAULT_LOGO, DEFAULT_BANNER
from Fish_Alchemy_Data.Entities.Users import User
from Fish_Alchemy_Data.Entities.UserGroups import UserGroup
from Fish_Alchemy_Data.Controllers.AuthController import get_current_user

LOGO_PATH = "/media/group/logo"
BANNER_PATH = "/media/group/banner"

router = APIRouter(prefix="/api/groups", tags=['Groups'])

@router.post("/")
def create_group(groupdto: GroupCreateDto, db: Session = Depends(get_db), userdto: User = Depends(get_current_user)):
    response = Response()
    if len(groupdto.name) == 0:
        response.add_error("name", "name must not be empty")
        raise HttpException(status_code=400, response=response)
    group = Group(name = groupdto.name)
    user = db.query(User).filter(User.id == userdto.id).first()
    group.users.append(user)
    db.add(group)
    db.commit()
    response.data=group.toGetDto()
    return response

@router.put("/{id}/name")
def update_name(groupdto: GroupUpdateDto, id: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
    if len(groupdto.name) == 0:
        response.add_error("name", "name cannot be empty")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    group.name = groupdto.name
    response.data = group.toGetDto()
    return response

@router.post("/{groupId}/user/{userId}")
def add_user(groupId: int, userId: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == groupId, Group.users.any(User.id != userId)).first()
    user = db.query(User).filter(User.id == userId).first()
    if not group:
        response.add_error("id", "group not found or user already in group")
    if not user:
        response.add_error("id", "user not found")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    group.users.append(user)
    db.commit()
    response.data = group.toGetDto()
    return response

@router.delete("/{groupId}/user/{userId}")
def remove_user(groupId: int, userId: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == groupId, Group.users.any(User.id == userId)).first()
    user = db.query(User).filter(User.id == userId).first()
    if not group:
        response.add_error("id", "group not found or user not in group")
    if not user:
        response.add_error("id", "user not found")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    if len(group.users) == 1:
        response.add_error("user", "cannot have a group with no users")
        raise HttpException(status_code=400, response=response)
    group.users.remove(user)
    db.commit()
    response.data = group.toGetDto()
    return response

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    response = Response()
    groups = db.query(Group).all()
    response.data = [group.toGetDto() for group in groups]
    return response

@router.get("/{id}")
def get_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
        raise HttpException(status_code=404, response=response)
    response.data = group.toGetDto()
    return response

@router.put("/{id}/logo")
async def update_logo(id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
    if not file.content_type.startswith("image/"):
        response.add_error("File", "File must be an image")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    cwd = os.getcwd()
    filepath = os.path.join(LOGO_PATH, filename)
    if group.logo_path != DEFAULT_LOGO:
        os.remove(os.path.join(cwd, group.logo_path[1:]))
    with open(os.path.join(cwd, filepath[1:]), "wb") as f:
        f.write(await file.read())
    group.logo_path = filepath
    db.commit()
    response.data = group.toGetDto()
    return response

@router.put("/{id}/banner")
async def update_banner(id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
    if not file.content_type.startswith("image/"):
        response.add_error("File", "File must be an image")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    cwd = os.getcwd()
    filepath = os.path.join(BANNER_PATH, filename)
    if group.banner_path != DEFAULT_BANNER:
        os.remove(os.path.join(cwd, group.banner_path[1:]))
    with open(os.path.join(cwd, filepath[1:]), "wb") as f:
        f.write(await file.read())
    group.banner_path = filepath
    db.commit()
    response.data = group.toGetDto()
    return response 

@router.delete("/{id}/logo")
def remove_logo(id: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
        raise HttpException(status=400, response=response)
    if group.logo_path == DEFAULT_LOGO:
        response.add_error("logo", "no logo")
        raise HttpException(status_code=400, response=response)
    cwd = os.getcwd()
    os.remove(os.path.join(cwd, group.logo_path[1:]))
    group.logo_path = DEFAULT_LOGO
    db.commit()
    response.data = group.toGetDto()
    return response

@router.delete("/{id}/banner")
def remove_banner(id: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
    if group.banner_path == DEFAULT_BANNER:
        response.add_error("banner", "no banner")
        raise HttpException(status_code=400, response=response)
    cwd = os.getcwd()
    os.remove(os.path.join(cwd, group.banner_path[1:]))
    group.banner_path = DEFAULT_BANNER
    db.commit()
    response.data = group.toGetDto()
    return response

@router.delete("/{id}")
def delete_group(id: int, db: Session = Depends(get_db)):
    response = Response()
    group = db.query(Group).filter(Group.id == id).first()
    if not group:
        response.add_error("id", "group not found")
        raise HttpException(status_code=404, response=response)
    db.delete(group)
    db.commit()
    response.data = True
    return response