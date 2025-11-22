from fastapi import APIRouter, Depends, HTTPException, Response, Request, Cookie
from sqlalchemy.orm import Session
from typing import Optional
import bcrypt
import itsdangerous
from typing import Optional

from Fish_Alchemy_Data.database import get_db
from Fish_Alchemy_Data.Entities.User import User, LoginDto

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = "Fish"
serializer = itsdangerous.URLSafeTimedSerializer(SECRET_KEY)
COOKIE_NAME = "session_token"
COOKIE_MAX_AGE = 60 * 60 * 24 # one day

def verify_password(plain:str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_session_token(user_id: int) -> str:
    return serializer.dumps({"user_id": user_id})

def verify_session_token(token: str) -> Optional[int]:
    try:
        data = serializer.loads(token, max_age=COOKIE_MAX_AGE)
        return data["user_id"]
    except itsdangerous.BadSignature:
        return None
    
@router.get("/get-current-user")
def get_current_user(request: Request, session_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if not session_token:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    user_id = verify_session_token(session_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.toGetDto()

@router.post("/logout")
def user_logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"message": "Logged out successfully"}

@router.post("/login")
def user_login(response: Response, logindto: LoginDto, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == logindto.username).first()
    if not user or not verify_password(logindto.password, user.auth.password_hash):
        raise HTTPException(status_code=401, detail="Username or password is incorrect")
    token = create_session_token(user.id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=COOKIE_MAX_AGE,
        samesite="lax",
        secure=False, # use true in prod https
    )
    return {"message": "Logged in successfully"}
