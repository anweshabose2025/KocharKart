from fastapi import APIRouter, HTTPException
from pydantic import EmailStr
from ..database import products_collection
from ..database import wishlist_collection
from ..pydanticmodel import Wishlist

router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)


@router.post("/add")
def add_to_wishlist(item: Wishlist):

    existing_item = wishlist_collection.find_one({
        "user_email": item.user_email,
        "product_name": item.product_name
    })

    if existing_item:
        raise HTTPException(
            status_code=400,
            detail="Product already in wishlist."
        )

    item_data = (
        item.model_dump()
        if hasattr(item, "model_dump")
        else item.dict()
    )

    wishlist_collection.insert_one(item_data)

    return {
        "message": "Product added to wishlist."
    }

@router.delete("/{user_email}/{product_name}")
def remove_from_wishlist(
    user_email: EmailStr,
    product_name: str
):

    result = wishlist_collection.delete_one({
        "user_email": user_email,
        "product_name": product_name
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found in wishlist."
        )

    return {
        "message": "Product removed from wishlist."
    }

@router.get("/{user_email}")
def get_cart(user_email:EmailStr):
    wishlist_items = list(wishlist_collection.find({"user_email":user_email}, {"_id":0}))
    result = []

    for item in wishlist_items:

        product = products_collection.find_one(
            {"name": item["product_name"]},
            {"_id": 0}
        )

        if product:
            result.append({
                "product_name": item["product_name"],
                "price": product["price"],
                "image": product["image"],
                "discount":product["discount"]
            })

    return result