from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, date

class BookBase(BaseModel):
    book_title: Optional[str] = None
    book_summary: Optional[str] = None
    book_price: Optional[float] = None  # Make book_price optional
    book_cover_photo: Optional[str] = None 
    category_id: Optional[int] = None

class Discount(BaseModel):
    discount_price: Optional[float] = None
    discount_end_date: Optional[date] = None
    
    class Config:
        orm_mode = True
class Author(BaseModel):
    id: int
    author_name: str
    
    class Config:
        orm_mode = True

class Book(BookBase):
    id: int
    discounts: Optional[List[Discount]] = []  # Make discounts optional with default empty list
    author: Optional[Author] = None
    
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

# # Order related schemas
class OrderItemCreate(BaseModel):
    order_id : int
    book_id: int
    quantity: int
    price: float
class Reviews(BaseModel):
    id: int
    book_id: int
    user_id: Optional[int] = None
    review_title: str = Field(..., max_length=120)  # Mandatory with max length 120
    review_details: Optional[str] = None
    review_date: datetime
    rating_star: Optional[int] = None
    book_title: str
    book_cover_photo: Optional[str] = None
    
    class Config:
        orm_mode = True

# class OrderItemCreate(OrderItemBase):
#     pass

# class OrderItemUpdate(BaseModel):
#     quantity: int

# class OrderItem(OrderItemBase):
#     id: int
#     order_id: int
    
#     class Config:
#         orm_mode = True

# class OrderBase(BaseModel):
#     order_date: Optional[datetime] = None
#     order_amount: Optional[float] = None
#     status: Optional[str] = "CART"
#     shipping_address: Optional[str] = None
#     payment_method: Optional[str] = None

# class OrderCreate(OrderBase):
#     pass

# class OrderUpdate(BaseModel):
#     status: str

# class Order(OrderBase):
#     id: int
#     user_id: int
#     order_items: List[OrderItem] = []
    
#     class Config:
#         orm_mode = True

class OrderSummary(BaseModel):
    id: int
    order_date: datetime
    order_amount: float
    status: str = "CART"
    
    class Config:
        orm_mode = True

# class OrderDetail(OrderSummary):
#     shipping_address: Optional[str] = None
#     payment_method: Optional[str] = None
#     order_items: List[OrderItem] = []
    
#     class Config:
#         orm_mode = True

# class CartResponse(BaseModel):
#     id: int
#     order_items: List[OrderItem] = []
#     order_amount: float
    
#     class Config:
#         orm_mode = True

# first attemp :v 

# class OrderItemCreate(BaseModel):
#     user_id:int
#     order_date: date
#     order_amount:float

class OrderCreate(BaseModel):
    order_amount: float
    
    class Config:
        orm_mode = True

