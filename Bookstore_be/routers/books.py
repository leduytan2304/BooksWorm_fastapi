from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import Book
from crud.book_crud import get_all_books
from database import get_db
router = APIRouter()


@router.get("/books", response_model=list[Book])

async def get_books(db: Session = Depends(get_db)):
    return get_all_books(db)

   