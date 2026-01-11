from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import os
import uuid

from typing import Any

from Fish_Alchemy_Data.Entities.Users import User, UserCreateDto, UserUpdateDto, DEFAULT_PFP, DEFAULT_BANNER
from Fish_Alchemy_Data.Entities.Auth import UserAuth, create_password_hash
from Fish_Alchemy_Data.Controllers.AuthController import require_admin
from Fish_Alchemy_Data.Common.Response import Response, HttpException
from Fish_Alchemy_Data.Common.Role import Role
from Fish_Alchemy_Data.database import get_db

PFP_PATH = "/media/user/pfp"
BANNER_PATH = "/media/user/banner"

router = APIRouter(prefix='/api/users', tags=["Users"])

@router.post("/")
def create_user(userdto: UserCreateDto, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    response = Response()
    if len(userdto.username) == 0:
        response.add_error("username", "Cannot be empty")
    if userdto.username == "Uriel":
        response.add_error("username", "you can't have that one")
    if len(userdto.email) == 0:
        response.add_error("email", "Cannot be empty")
    if len(userdto.password) == 0:
        response.add_error("password","Cannot be empty")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    user = User(username=userdto.username)
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        response.add_error("username", "Username taken")
        raise HttpException(status_code=409, response=response)
    auth = UserAuth(
        id = user.id,
        email = userdto.email,
        password_hash = create_password_hash(userdto.password)
    )
    db.add(auth)
    try:
        db.commit()
        db.refresh(user)
        response.data = user.toGetDto()
        return response
    except IntegrityError:
        db.rollback()
        response.add_error("email", "Email already in use")
        raise HttpException(status_code=409, response=response)
    
@router.patch("/{id}/username")
def update_username(userdto: UserUpdateDto, id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
    if len(userdto.username) == 0:
        response.add_error("username", "cannot be empty")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    user.username = userdto.username
    try:
        db.commit()
        response.data = user.toGetDto()
        return response
    except IntegrityError:
        db.rollback()
        response.add_error("username", "username taken")
        raise HttpException(status_code=409, response=response)

@router.get("/")
def get_all_users(db: Session = Depends(get_db)):
    response = Response()
    users = db.query(User).all()
    response.data = [user.toGetDto() for user in users]
    return response

@router.get("/{id}")
def get_user_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
        raise HttpException(status_code=404, response=response)
    response.data = user.toGetDto()
    return response

@router.patch("/{id}/pfp")
async def update_pfp(id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
    if not file.content_type.startswith("image/"):
        response.add_error("File", "File must be an image")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    cwd = os.getcwd()
    filepath = os.path.join(PFP_PATH, filename)
    if user.pfp_path != DEFAULT_PFP:
        os.remove(os.path.join(cwd, user.pfp_path[1:]))
    with open(os.path.join(cwd, filepath[1:]), "wb") as f:
        f.write(await file.read())
    user.pfp_path = filepath
    db.commit()
    response.data = user.toGetDto()
    return response

@router.patch("/{id}/banner")
async def update_banner(id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
    if not file.content_type.startswith("image/"):
        response.add_error("File", "File must be an image")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    cwd = os.getcwd()
    filepath = os.path.join(BANNER_PATH, filename)
    if user.banner_path != DEFAULT_BANNER:
        os.remove(os.path.join(cwd, user.banner_path[1:]))
    with open(os.path.join(cwd, filepath[1:]), "wb") as f:
        f.write(await file.read())
    user.banner_path = filepath
    db.commit()
    response.data = user.toGetDto()
    return response

@router.delete("/{id}/pfp")
def remove_pfp(id: int, db: Session = Depends(get_db)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
        raise HttpException(status_code=404, response=response)
    if user.pfp_path == DEFAULT_PFP:
        response.add_error("pfp", "no pfp")
        raise HttpException(status_code=404, response=response)
    cwd = os.getcwd()
    os.remove(os.path.join(cwd, user.pfp_path[1:]))
    user.pfp_path = DEFAULT_PFP
    db.commit()
    response.data = user.toGetDto()
    return response

@router.delete("/{id}/banner")
def remove_banner(id: int, db: Session = Depends(get_db)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
        raise HttpException(status_code=404, response=response)
    if user.banner_path == DEFAULT_BANNER:
        response.add_error("pfp", "no banner")
        raise HttpException(status_code=404, response=response)
    cwd = os.getcwd()
    os.remove(os.path.join(cwd, user.banner_path[1:]))
    user.banner_path = DEFAULT_BANNER
    db.commit()
    response.data = user.toGetDto()
    return response

@router.delete("/{id}")
def delete_user(id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    response = Response()
    user = db.query(User).filter(User.id == id).first()
    if not user:
        response.add_error("id", "user not found")
        raise HttpException(status_code=404, response=response)
    if user.username == "Uriel" and user.auth.role == Role.ADMIN:
        response.add_error("Hubris", ":(")
        raise HttpException(status_code=403, response=response)
    db.delete(user)
    db.commit()
    response.data = True
    return response