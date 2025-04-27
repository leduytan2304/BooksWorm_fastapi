from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Numeric, Date, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import BIGINT
from sqlalchemy.schema import Sequence
from pydantic import BaseModel, EmailStr
from database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(BIGINT, primary_key=True, index=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    email = Column(String(70), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    admin = Column(Boolean, default=False)

    orders = relationship("Order", back_populates="user")

class Category(Base):
    __tablename__ = "category"

    id = Column(BIGINT, primary_key=True, index=True)
    category_name = Column(String(120), nullable=False)
    category_desc = Column(String(255))

    books = relationship("Book", back_populates="category")

class Author(Base):
    __tablename__ = "author"

    id = Column(BIGINT, primary_key=True, index=True)
    author_name = Column(String(255), nullable=False)
    author_bio = Column(Text)

    books = relationship("Book", back_populates="author")

class Book(Base):
    __tablename__ = "book"

    id = Column(BIGINT, primary_key=True, index=True)
    category_id = Column(BIGINT, ForeignKey("category.id"), nullable=False)
    author_id = Column(BIGINT, ForeignKey("author.id"), nullable=False)
    book_title = Column(String(255), nullable=False)
    book_summary = Column(Text)
    book_price = Column(Numeric(5, 2), nullable=False)
    book_cover_photo = Column(String(200))

    category = relationship("Category", back_populates="books")
    author = relationship("Author", back_populates="books")
    reviews = relationship("Review", back_populates="book")
    discounts = relationship("Discount", back_populates="book")
    order_items = relationship("OrderItem", back_populates="book")

class Order(Base):
    __tablename__ = "order"

    id = Column(BIGINT, Sequence('order_id_seq'), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    order_date = Column(TIMESTAMP, nullable=False)
    order_amount = Column(Numeric(8, 2), nullable=False)

    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_item"

    id = Column(BIGINT, primary_key=True, index=True)
    order_id = Column(BIGINT, ForeignKey("order.id"), nullable=False)
    book_id = Column(BIGINT, ForeignKey("book.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(5, 2), nullable=False)

    order = relationship("Order", back_populates="order_items")
    book = relationship("Book", back_populates="order_items")

class Review(Base):
    __tablename__ = "review"

    id = Column(BIGINT, primary_key=True, index=True)
    book_id = Column(BIGINT, ForeignKey("book.id"), nullable=False)
    review_title = Column(String(120), nullable=False)
    review_details = Column(Text)
    review_date = Column(TIMESTAMP, nullable=False)
    rating_start = Column(String(255))  # This seems to be a typo in the schema, might be "rating_star"

    book = relationship("Book", back_populates="reviews")

class Discount(Base):
    __tablename__ = "discount"

    id = Column(BIGINT, primary_key=True, index=True)
    book_id = Column(BIGINT, ForeignKey("book.id"), nullable=False)
    discount_start_date = Column(Date, nullable=False)
    discount_end_date = Column(Date, nullable=False)
    discount_price = Column(Numeric(5, 2), nullable=False)

    book = relationship("Book", back_populates="discounts")
