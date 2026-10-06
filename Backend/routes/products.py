from fastapi import APIRouter, HTTPException
from ..pydanticmodel import Product
from ..database import products_collection
from typing import List
from bson import ObjectId

router = APIRouter(prefix="/products", tags = ["Products"])


# Add a Product
@router.post("/add")
def add_products(product:Product):

    existing_product_name = products_collection.find_one({"name": product.name})
    if existing_product_name:
        raise HTTPException(
            status_code=400,
            detail="This product already exists."
        )
    
    products_data = product.model_dump() if hasattr(product, "model_dump") else product.dict()
    result = products_collection.insert_one(products_data)

    return {"message": "Product added successfully","product_id": str(result.inserted_id)}


# Get All Products
@router.get("/")
def get_all_products():

    products = list(
        products_collection.find()
    )

    for product in products:
        product["_id"] = str(product["_id"])

    return products

@router.get("/{product_id}")
def get_product_by_id(product_id: str):

    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid product ID."
        )

    product = products_collection.find_one(
        {"_id": ObjectId(product_id)},
        {"_id": 0}
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return product

# Update Product
@router.put("/{product_id}")
def update_product(product_id: str, product: Product):

    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid product ID."
        )

    product_data = (product.model_dump() if hasattr(product, "model_dump") else product.dict())

    result = products_collection.update_one({"_id": ObjectId(product_id)},{"$set": product_data})

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return {"message": "Product updated successfully."}


# Delete Product
@router.delete("/{product_id}")
def delete_product(product_id: str):
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid product ID."
        )

    result = products_collection.delete_one({"_id": ObjectId(product_id)})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return {"message": "Product deleted successfully."}


# Search Products by keyword (Regex search)
@router.get("/search/{keyword}")
def search_products(keyword: str):

    or_conditions = [
        {"name": {"$regex": keyword, "$options": "i"}},
        {"brand": {"$regex": keyword, "$options": "i"}},
        {"category": {"$regex": keyword, "$options": "i"}},
        {"subcategory": {"$regex": keyword, "$options": "i"}},
        {"seller": {"$regex": keyword, "$options": "i"}},
        {"description": {"$regex": keyword, "$options": "i"}}
    ]


    if keyword.isdigit():
        or_conditions.append({"price": int(keyword)})

    query = {"$or": or_conditions}

    products = list(
        products_collection.find(query,{"_id": 0}))

    return products


# Filter by category (Exact search)
@router.get("/category/{category}")
def get_category_products(category: str):

    products = list(
        products_collection.find({"category": {"$regex": f"^{category}$","$options": "i"}},{"_id": 0}))

    return products

# Filter by brand (Exact search)
@router.get("/brand/{brand}")
def get_brand_products(brand: str):

    products = list(
        products_collection.find({"brand": brand},{"_id": 0}))

    return products

# Filter by price (Exact search)
@router.get("/price/{min_price}/{max_price}")
def get_products_by_price(min_price: int,max_price: int):

    products = list(
        products_collection.find(
            {
                "price": {
                    "$gte": min_price,
                    "$lte": max_price
                }
            },
            {"_id": 0}
        )
    )

    return products

@router.get("/{product_name}")
def get_product(product_name: str):

    product = products_collection.find_one(
        {"name": product_name},
        {"_id": 0}
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return product