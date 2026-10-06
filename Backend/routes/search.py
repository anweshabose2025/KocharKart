from fastapi import APIRouter, Query
from typing import List, Optional
from ..database import products_collection
from ..pydanticmodel import Product

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/products", response_model=List[Product])
async def search_products(
    q: Optional[str] = Query(None)
):

    if not q or q.strip() == "":
        cursor = products_collection.find().limit(20)

    else:
        cursor = products_collection.find(
            {"$text": {"$search": q}},
            {"score": {"$meta": "textScore"}}
        ).sort(
            [("score",{"$meta": "textScore"})]
        ).limit(50)

    products = list(cursor)

    return products