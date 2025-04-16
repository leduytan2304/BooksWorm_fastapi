from sqlalchemy.orm import Session
from models import Book
from datetime import datetime
from fastapi import HTTPException



def get_all_books(db:Session):
    return db.query(Book).all()



