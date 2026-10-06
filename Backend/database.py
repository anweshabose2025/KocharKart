from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# Access individual variables using os.getenv()
db_url = os.getenv("MONGO_URI")

client = MongoClient(db_url)

database = client["ecom-own-db-1"]

products_collection = database["products"]
orders_collection = database["orders"]
cart_collection = database["cart"]
users_collection = database["users"]
wishlist_collection = database["wishlist"]

products_collection.create_index([
    ("name", "text"),
    ("description", "text"),
    ("brand", "text"),
    ("category", "text"),
    ("subcategory", "text")
])