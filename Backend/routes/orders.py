from fastapi import APIRouter
from pydantic import EmailStr
from ..database import orders_collection
from ..pydanticmodel import Order

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/place")
def place_order(order:Order):
    order_placed = order.model_dump() if hasattr(order,"model_dump") else order.dict()
    orders_collection.insert_one(order_placed)
    return {"message":"Order placed successfully"}

@router.get("/{user_email}")
def get_all_orders(user_email:EmailStr):
    all_orders = list(orders_collection.find({"user_email":user_email},{"_id":0}))
    return all_orders