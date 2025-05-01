from typing import Annotated

from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from routers import books
from routers import auth
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from routers.config import settings
from routers import author
from routers import order
from routers import reviews
from routers import category

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix="/api", tags=["/books"])
app.include_router(author.router, prefix="/api", tags=["/authors"])
app.include_router(auth.router, prefix="/api", tags=["/auth"])
app.include_router(order.router, prefix="/api", tags=["/orders"])
app.include_router(reviews.router, prefix="/api", tags=["/reviews"])
app.include_router(category.router, prefix="/api", tags=["/category"])

