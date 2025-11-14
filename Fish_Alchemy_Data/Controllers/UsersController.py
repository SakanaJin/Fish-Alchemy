from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import bcrypt

from typing import Any

from Fish_Alchemy_Data.Entities.User import User, UserCreateDto, UserGetDto
from Fish_Alchemy_Data.Entities.Auth import UserAuth
from Fish_Alchemy_Data.Common.Response import Response
from Fish_Alchemy_Data.database import get_db

router = APIRouter(prefix='/users', tags=["Users"])

def create_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

@router.post("/create")
def create_user(userdto: UserCreateDto, db: Session = Depends(get_db)):
    print("Recieved", userdto)
    response = Response()
    if len(userdto.username) == 0:
        response.add_error("username", "Cannot be empty")
    if len(userdto.email) == 0:
        response.add_error("email", "Cannot be empty")
    if len(userdto.password) == 0:
        response.add_error("password","Cannot be empty")
    if response.has_errors:
        raise HTTPException(status_code=400, detail=response.model_dump())
    user = User(username=userdto.username)
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        response.add_error("username", "Username already taken")
        raise HTTPException(status_code=409, detail=response.model_dump())
    auth = UserAuth(
        id = user.id,
        email = userdto.email,
        password_hash = create_password_hash(userdto.password)
    )
    db.add(auth)
    try:
        db.commit()
        db.refresh(user)
        response.data = user.toDto()
        return response
    except IntegrityError:
        db.rollback()
        response.add_error("email", "Email already in use")
        raise HTTPException(status_code=409, detail=response.model_dump())
