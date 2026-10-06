from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Backend.routes import (
    products,
    users,
    login,
    orders,
    cart,
    wishlist,
    chatbot,
    search)

app = FastAPI(title="Flipkart AI Backend")

# CORS
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

# Routers
app.include_router(products.router)
app.include_router(users.router)
app.include_router(login.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(chatbot.router)
app.include_router(search.router)

# uvicorn main:app --reload