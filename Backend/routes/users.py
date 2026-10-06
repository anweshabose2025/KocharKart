from fastapi import APIRouter, HTTPException
from pydantic import EmailStr

from ..database import users_collection
from ..pydanticmodel import NewUserRegister

router = APIRouter(prefix="/users", tags=["Users"])


# Register User
@router.post("/register")
def register_user(user: NewUserRegister):

    existing_user = users_collection.find_one(
        {"user_email": user.user_email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists."
        )

    user_data = user.model_dump() if hasattr(user, "model_dump") else user.dict()

    users_collection.insert_one(user_data)

    return {
        "message": "User registered successfully."
    }


# Get User
@router.get("/{user_email}")
def get_user(user_email: EmailStr):

    user = users_collection.find_one(
        {"user_email": user_email},
        {"_id": 0, "password": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return user


# Update User
@router.put("/{user_email}")
def update_user(user_email: EmailStr, user: NewUserRegister):

    user_data = user.model_dump() if hasattr(user, "model_dump") else user.dict()

    result = users_collection.update_one(
        {"user_email": user_email},
        {"$set": user_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "message": "User updated successfully."
    }


# Delete User
@router.delete("/{user_email}")
def delete_user(user_email: EmailStr):

    result = users_collection.delete_one(
        {"user_email": user_email}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "message": "User deleted successfully."
    }