from pydantic import BaseModel, EmailStr
from typing import List

class Product(BaseModel):
    name:str
    description:str
    price:int
    category:str
    subcategory: str
    brand: str
    stock: int
    size:List[str]
    colour:List[str]
    image:str
    rating: float
    discount: int|str

class Order(BaseModel):
    user_email:EmailStr
    product_name:str
    quantity:int
    stock: int

class Cart(BaseModel):
    user_email:EmailStr
    product_name:str
    quantity:int

class Wishlist(BaseModel):
    user_email: EmailStr
    product_name: str
    
class NewUserRegister(BaseModel):
    user_name: str
    user_email:EmailStr
    phone:str
    password:str
    
class Login(BaseModel):
    user_email: EmailStr
    password: str


class ChatRequest(BaseModel):
    query: str