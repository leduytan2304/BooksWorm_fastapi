
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from schemas import Book
from models import Book as BookModel, Discount, Review
from database import get_db
from typing import List, Optional
from sqlalchemy import text
from enum import Enum
from services.book_service import (
    get_books_with_filter,
    get_recommended_books,
    get_popular_books,
    get_books_by_category,
    get_onsale_books,
    get_book_by_id
)

class SortOption(str, Enum):
    discount_desc = "discount_desc"
    popular_desc = "popular_desc"
    final_price_asc = "final_price_asc"
    final_price_desc = "final_price_desc"
    # recommended = "recommended"
    # popular = "popular"

router = APIRouter()


@router.get("/books", response_model=list[Book])
async def get_books(
    filterBy: SortOption = Query(
        SortOption.discount_desc, 
        description="Sort option for books"
    ),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    star: Optional[float] = Query(None, ge=0, le=5, description="Minimum average rating star"),
    search: Optional[str] = Query(None, description="Search by book title or author name"),
    limit: Optional[int] = Query(None, ge=1, description="Maximum number of records to return"),
    offset: Optional[int] = Query(0, ge=0, description="Number of books to skip"),
    db: Session = Depends(get_db)
):
    try:
        # Add debug logging
        print(f"Received parameters: filterBy={filterBy}, author_id={author_id}, category_id={category_id}, star={star}, search={search}, limit={limit}, offset={offset}")
        
        # Use the service function to get books with filters
        books = get_books_with_filter(
            db=db,
            filter_by=filterBy,
            author_id=author_id,
            category_id=category_id,
            star=star,
            search=search,
            limit=limit,
            offset=offset
        )
        
        # Add debug logging
        print(f"Query returned {len(books)} books")
        
        return books
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/books/recommended", response_model=list[Book])
async def get_books_recommended(db: Session = Depends(get_db)):
    try:
        return get_recommended_books(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/books/popular", response_model=list[Book])
async def get_books_popular(db: Session = Depends(get_db)):
    try:
        return get_popular_books(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/books/category", response_model=list[Book])
async def get_books_by_category_endpoint(category_id: int, db: Session = Depends(get_db)):
    try:
        return get_books_by_category(db, category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/books/onsale", response_model=List[Book])
async def get_onsale_books_endpoint(db: Session = Depends(get_db)):
    try:
        return get_onsale_books(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/books/{book_id}", response_model=Book)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    try:
        book = get_book_by_id(db, book_id)
        
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return book
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    


@router.get("/books/author/{author_id}", response_model=list[Book])
async def get_books_by_author(author_id: int, db: Session = Depends(get_db)):
    try:
        sql_query = text("""
            SELECT 
                b.id,
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.author_name,
                json_agg(
                    json_build_object(
                        'discount_price', d.discount_price,
                        'discount_end_date', d.discount_end_date
                    )
                ) as discounts,
                json_build_object(
                    'id', a.id,
                    'author_name', a.author_name
                ) as author
            FROM book b
            JOIN discount d ON b.id = d.book_id
            JOIN author a ON b.author_id = a.id
            WHERE b.author_id = :author_id
            GROUP BY 
                b.id, 
                b.book_title,
                b.book_summary,
                b.book_price,
                b.book_cover_photo,
                b.category_id,
                b.author_id,
                a.id,
                a.author_name
        """)
        result = db.execute(sql_query, {"author_id": author_id})
        books = result.fetchall()
        return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
