from fastapi import APIRouter
from ..pydanticmodel import Cart
from ..database import cart_collection
from pydantic import EmailStr
from fastapi import HTTPException
from ..database import products_collection

router = APIRouter(prefix="/cart", tags = ["Cart"])

@router.post("/add")
def add_cart(item:Cart):
    existing_product = cart_collection.find_one({
    "user_email": item.user_email,
    "product_name": item.product_name,
})
    if existing_product:
            raise HTTPException(
                status_code=400,
                detail="This product already added to cart."
            )
    item_data = item.model_dump() if hasattr(item,"model_dump") else item.dict()
    cart_collection.insert_one(item_data)
    return {"message":"Added one item to cart"}

@router.get("/{user_email}")
def get_cart(user_email:EmailStr):
    cart_items = list(cart_collection.find({"user_email":user_email}, {"_id":0}))
    result = []

    for item in cart_items:

        product = products_collection.find_one(
            {"name": item["product_name"]},
            {"_id": 0}
        )

        if product:
            result.append({
                "product_name": item["product_name"],
                "quantity": item["quantity"],
                "price": product["price"],
                "image": product["image"],
                "discount":product["discount"]
            })

    return result

@router.delete("/{user_email}")
def delete_from_cart_many(user_email:EmailStr):
    result = cart_collection.delete_many({"user_email":user_email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404,detail="no cart item found for this user.")
    return {"message":"Cart deleted successfully"}

@router.delete("/{user_email}/{product_name}")
def delete_from_cart_one(user_email: EmailStr, product_name: str):

    result = cart_collection.delete_one({
        "user_email": user_email,
        "product_name": product_name
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found in cart."
        )

    return {
        "message": "Product removed from cart."
    }

@router.put("/{user_email}/{product_name}")
def update_cart_quantity(
    user_email: EmailStr,
    product_name: str,
    quantity: int
):

    if quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1."
        )

    result = cart_collection.update_one(
        {
            "user_email": user_email,
            "product_name": product_name
        },
        {
            "$set": {
                "quantity": quantity
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found in cart."
        )

    return {
        "message": "Cart quantity updated.",
        "quantity": quantity
    }

@router.get("/count/{user_email}")
def get_cart_count(user_email: EmailStr):
    count = cart_collection.count_documents({
        "user_email": user_email
    })

    return {"count": count}