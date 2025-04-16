from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BookBase(BaseModel):
    book_title: Optional[str] = None
    book_summary: Optional[str] = None
    book_price: Optional[float] = None  # Make book_price optional
    book_cover_photo: Optional[str] = None 
    category_id: Optional[int] = None

class Discount(BaseModel):
    discount_price: float
    expire_date: Optional[datetime]
    class Config:
        orm_mode = True
class Book(BookBase):
    id: int
    discounts: List[Discount] = []  # Use List instead of list for type hinting
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    email: str
    password: str
    first_name: Optional[str]
    last_name: Optional[str]
  