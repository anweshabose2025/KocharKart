from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from ..pydanticmodel import Login
from ..database import users_collection

router = APIRouter(prefix="/auth",tags=["Authentication"])


@router.post("/login")
def login(login_data: Login):

    user = users_collection.find_one(
        {"user_email": login_data.user_email}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if user["password"] != login_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    return {
        "message": "Login successful.",
        "user": {
            "user_name": user["user_name"],
            "user_email": user["user_email"],
            "phone": user["phone"]
        }
    }