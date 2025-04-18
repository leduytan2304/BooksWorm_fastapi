from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from schemas import Book
from models import Book as BookModel, Discount, Review
from database import get_db
from typing import List
from sqlalchemy.orm import joinedload
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from database import SQLALCHEMY_DATABASE_URL

router = APIRouter()


@router.get("/books", response_model=list[Book])
async def get_books(sort_by : Optional[str] = Query('discount_desc', description = 
                                                           "sort_option: 'discount_desc'," \
                                                           " 'popular_desc', 'final_price_asc', 'final_price_desc'"),
                    # page: int = Query(1, ge=1, description="Page number"),
                    # per_page: int = Query(5, ge=1,  description="Number of books per page: (5,10,15,20)"),
                   
                    db: Session = Depends(get_db)):
    try:
       
       query = db.query(BookModel).options(joinedload(BookModel.discounts))
       
       if sort_by:
         
         if sort_by == 'discount_desc':
            query = query.join(BookModel.discounts)\
            .order_by((BookModel.book_price - Discount.discount_price).desc())
         elif sort_by == 'popular_desc':
                query = query.outerjoin(BookModel.reviews)\
                    .outerjoin(BookModel.discounts)\
                    .group_by(BookModel.id, Discount.discount_price)\
                    .order_by(
                        func.count(Review.id).desc(),
                        (BookModel.book_price - func.coalesce(Discount.discount_price, 0)).asc()
                    )
         elif sort_by == 'final_price_asc':
                query = query.join(BookModel.discounts)\
                    .order_by(Discount.discount_price.asc())
            
         elif sort_by == 'final_price_desc':
                query = query.join(BookModel.discounts)\
                    .order_by(Discount.discount_price.desc())
         else:
                raise HTTPException(status_code=400, detail="Invalid sort parameter")
                
       else:
                raise HTTPException(status_code=400, detail="Invalid sort parameter")

       books = query.all()
       if not books:
            raise HTTPException(status_code=404, detail="No books found")
            
       return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


   
