from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from schemas import Reviews
from sqlalchemy import text
from typing import List, Optional
from enum import Enum
from database import get_db
from datetime import datetime
from models import Review
from routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class SortOption(str, Enum):
    newest_to_oldest = "newest_to_oldest"
    oldest_to_newest = "oldest_to_newest"
    

class ReviewCreate(BaseModel):
    book_id: int
    title: str
    content: str
    rating: int

@router.post("/reviews", status_code=status.HTTP_201_CREATED)
async def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Create new review without specifying ID (will use sequence)
        new_review = Review(
            book_id=review.book_id,
            user_id=current_user.id,
            review_title=review.title,
            review_details=review.content,
            review_date=datetime.now(),
            rating_star=str(review.rating)
        )
        
        # Add to database and commit
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        
        return {
            "id": new_review.id,
            "message": "Review submitted successfully"
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error creating review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit review: {str(e)}")

@router.get("/reviews/{book_id}", response_model=list[Reviews])
async def get_review(
    book_id: int,
    sort_by: SortOption = Query(
        SortOption.newest_to_oldest, 
        description="Sort option for reviews"
    ),
    rating_star: Optional[int] = Query(
        None, 
        ge=1, 
        le=5, 
        description="Filter reviews by rating star (1-5)"
    ),
    limit: int = Query(10, ge=1, description="Number of reviews to return"),
    offset: int = Query(0, ge=0, description="Number of reviews to skip"),
    db: Session = Depends(get_db)
):
    try:
        # Determine the sort order based on the sort_by parameter
        sort_order = "DESC" if sort_by.value == "newest to oldest" else "ASC"
        
        # Base query
        base_query = """
            SELECT 
                r.id,
                r.book_id,
                r.user_id,
                r.review_title,
                r.review_details,
                r.review_date,
                r.rating_star as rating_star,
                b.book_title,
                b.book_cover_photo
            FROM review r
            JOIN book b ON r.book_id = b.id
            WHERE b.id = :book_id
        """
        
        # Add rating filter if provided
        params = {"book_id": book_id, "limit": limit, "offset": offset}
        if rating_star is not None:
            # Cast the string column to integer for comparison
            base_query += " AND CAST(r.rating_star AS INTEGER) = :rating_star"
            params["rating_star"] = rating_star
            
        # Add sorting
        base_query += f" ORDER BY r.review_date {sort_order}"
        
        # Add pagination
        base_query += " LIMIT :limit OFFSET :offset"
        
        # Execute query
        sql_query = text(base_query)
        result = db.execute(sql_query, params)
        reviews = [dict(row._mapping) for row in result.fetchall()]
        
        return reviews if reviews else []
    except Exception as e:
        # Print the error for debugging
        print(f"Error in get_review: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
