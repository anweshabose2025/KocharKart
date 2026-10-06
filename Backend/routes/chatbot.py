"""
Chatbot API - Text2NoSQL shopping assistant using Pydantic AI.

How it works:
- Normal conversation (greetings, questions): agent replies with plain text.
- Product queries (show me X, find Y under Z price): agent calls `search_products`
    tool which queries MongoDB and returns matching products.
- The endpoint figures out which type of response to send to the frontend.
"""
import os
from fastapi import APIRouter, Body
from Backend.database import products_collection
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from ..pydanticmodel import ChatRequest

load_dotenv()

CUSTOMER_CARE_NUMBER = os.getenv("CUSTOMER_CARE_NUMBER")

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class StoreDeps(BaseModel):
    """Holds the list of products found during this run."""
    found_products: List[Dict[str, Any]] = []

    class Config:
        arbitrary_types_allowed = True

agent = Agent(
    "groq:openai/gpt-oss-120b",
    deps_type=StoreDeps, ## thus, the agent can remember: The products it found.
    system_prompt=(
        "You are a friendly shopping assistant for KocharKart — an online Mega store. "
        "The store sells Electronics, Mobile, Furniture, Lifestyle, Grocery, Large, Home and BGM."
        "Electronics => Laptop, Charger, Mouse, Keyboard, Watch, Iron, Tubelight"
        "Mobile => Phone and mobile"
        "Furniture => Table, Chair"
        "Lifestyle => Chothes, Pant, Shirt, Shoes, Sarees, Lahenga, T-shirt"
        "Grocery => Tomato, Potato, Oil, Grocey items"
        "Large => Fridge, Washing Machine, AC"
        "Home => Home Decor"
        "BGM (Books and General Marchendice) => Books, Bag, Others"
        "\n\n"
        "RULES:\n"
        "1. If the user greets you or asks who you are → reply naturally and warmly.\n"
        "2. If the user wants to browse, find, or buy products → ALWAYS call the `search_products` tool with the right filters. Never describe products yourself.\n"
        "3. For any PRODUCT or ITEM related discussion, ALWAYS call the `search_products` tool with the right filters.\n"
        "4. After calling `search_products`, confirm to the user what you searched for (e.g. 'Here are men's shirts under ₹2000!').\n"
        "5. DO NOT make up product names, prices, or details ever."
    ),
)



@agent.tool
def search_products(
    ctx: RunContext[StoreDeps], ## the way it will output
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    max_price: Optional[int] = None,
    min_price: Optional[int] = None,
) -> str:
    """
    Search the ClothStore product database.

    Args:
        category: Filter by category — one of 'Electronics, Mobile, Furniture, Lifestyle, Grocery, Large, Home and BGM'.
        keyword: Search by product name keyword (e.g. 'Laptop', 'Mobile', 'Phones', 'Shirt', 'Charger', 'Almirah', 'Table', 'Dress', 'Tomato', 'Milk', 'Jacket').
        max_price: Maximum price in rupees (e.g. 2000 means under ₹2000).
        min_price: Minimum price in rupees (e.g. 100 means under ₹100).

    Returns:
        A short confirmation string of what was found.
    """
    query: Dict[str, Any] = {}

    if category:
        query["category"] = {"$regex": f"^{category.strip()}$", "$options": "i"}

    if keyword:
        query["name"] = {"$regex": keyword.strip(), "$options": "i"}

    # Build price filter
    price_filter: Dict[str, int] = {}
    if max_price is not None:
        price_filter["$lte"] = max_price
    if min_price is not None:
        price_filter["$gte"] = min_price
    if price_filter:
        query["price"] = price_filter

    raw_results = list(products_collection.find(query).limit(8))

    processed = []
    for r in raw_results:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        r.pop("image_data", None)       # never send Base64 blobs to the LLM
        r.pop("image_content_type", None)
        processed.append(r)

    # Store results so the endpoint can send them to the frontend
    ctx.deps.found_products = processed

    if not processed:
        return "No products found matching those filters."
    return f"Found {len(processed)} products matching the request."


@router.post("/")
async def chat_bot(data: ChatRequest):
    """
    Main chat endpoint. Accepts a user message and returns either
    a plain text reply or a list of matching products.
    """
    user_message = data.query
    if not user_message:
        return {"type": "text", "message": "Please type a message!", "data": None}

    deps = StoreDeps()

    try:
        result = await agent.run(user_message, deps=deps)
        text_reply = result.output  # plain string from the LLM

        # If the tool was called and found products → send them to the frontend
        if deps.found_products:
            return {
                "type": "products",
                "message": text_reply,
                "data": deps.found_products,
            }

        # Otherwise just a normal conversation reply
        return {
            "type": "text",
            "message": text_reply,
            "data": None,
        }

    except Exception as e:
        print(f"[Chatbot Error] {e}")
        return {
            "type": "text",
            "message": "Sorry, I ran into an issue. Please try again or contact customer care at 9907441145.",
            "data": None,
        }
