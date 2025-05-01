from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from typing import List
from pydantic import BaseModel

router = APIRouter()

class Category(BaseModel):
    id: int
    category_name: str
    category_desc: str = None

@router.get("/category", response_model=List[Category])
async def get_categories(db: Session = Depends(get_db)):
    try:
        sql_query = text("""
            SELECT 
                c.id,
                c.category_name,
                c.category_desc
            FROM category c
            ORDER BY c.category_name
        """)
        result = db.execute(sql_query)
        rows = result.fetchall()
        categories = [dict(row._mapping) for row in rows]
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/category/{category_id}", response_model=Category)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    try:
        sql_query = text("""
            SELECT 
                c.id,
                c.category_name,
                c.category_desc
            FROM category c
            WHERE c.id = :category_id
        """)
        result = db.execute(sql_query, {"category_id": category_id})
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Category not found")
        category = dict(row._mapping)
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


























