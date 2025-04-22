from models import Author  # Ensure this import exists
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from schemas import Book
from models import Book as BookModel, Discount, Review
from database import get_db
from typing import List
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from database import SQLALCHEMY_DATABASE_URL
from sqlalchemy import text




router = APIRouter()



@router.get("/authors/{author_id}")
async def get_author(author_id: int, db: Session = Depends(get_db)):
    try:
        sql_query = text("""
            SELECT 
                a.id,
                a.author_name,
                a.author_bio
            FROM author a
            WHERE a.id = :author_id
        """)
        result = db.execute(sql_query, {"author_id": author_id})
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Author not found")
        author = dict(row._mapping)
        return author
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/authors")
async def get_authors(db: Session = Depends(get_db)):
    try:
        sql_query = text("""
            SELECT 
                a.id,
                a.author_name,
                a.author_bio
            FROM author a
        """)
        result = db.execute(sql_query)
        rows = result.fetchall()
        authors = [dict(row._mapping) for row in rows]
        return authors
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))