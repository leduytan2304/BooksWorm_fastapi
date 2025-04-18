from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import reviews
from crud.book_crud import get_all_books
from database import get_db
router = APIRouter()


@router.get("/reviews", response_model=list[reviews])

async def get_books(db: Session = Depends(get_db)):
    return get_all_books(db)