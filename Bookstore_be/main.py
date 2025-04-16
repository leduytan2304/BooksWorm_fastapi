from typing import Annotated

from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from routers import books
from routers import auth
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from routers.config import settings
app = FastAPI()



app.include_router(books.router, prefix="/api", tags=["/books"])
app.include_router(auth.router)
