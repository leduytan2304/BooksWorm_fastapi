from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from schemas import Book
from models import Book as BookModel, Discount
from database import get_db
from typing import List
from sqlalchemy.orm import joinedload
from typing import Optional
router = APIRouter()


@router.get("/books", response_model=list[Book])
async def get_books(sort_by : Optional[str] = Query('discount_desc', description = 
                                                          "sort_option: 'price_asc', 'price_desc','discount_asc', 'discount_des' "),
                    
                    db: Session = Depends(get_db)):
    try:
       query = db.query(BookModel).options(joinedload(BookModel.discounts))
       if sort_by:
         if sort_by == 'asc':
            query = query.order_by(BookModel.book_price.asc())
         elif sort_by == 'des':
            query = query.order_by(BookModel.book_price.desc())
         elif sort_by == 'discount_asc':
                query = query.join(BookModel.discounts).order_by(Discount.discount_price.asc())
         elif sort_by == 'final_price_asc':
                # Order by final price (original price - discount)
                query = query.join(BookModel.discounts)\
                    .order_by((BookModel.book_price - Discount.discount_price).asc())
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


   