from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import OrderCreate, OrderItemCreate
from models import Order, OrderItem
from routers.auth import get_current_user
from typing import List, Optional
router = APIRouter()

@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_new_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Create new order without specifying ID
        new_order = Order(
            user_id=current_user.id,
            order_date=datetime.now(),
            order_amount=order.order_amount
        )
        
        # Add to database and commit
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        return {
            "order_id": new_order.id,
            "message": "Order created successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.post("/order-items", status_code=status.HTTP_201_CREATED)
async def create_order_item(
    order_item: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Verify the order belongs to the current user
        order = db.query(Order).filter(
            Order.id == order_item.order_id,
            Order.user_id == current_user.id
        ).first()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found or does not belong to current user"
            )
        
        # Create new order item without specifying ID
        new_order_item = OrderItem(
            order_id=order_item.order_id,
            book_id=order_item.book_id,
            quantity=order_item.quantity,
            price=order_item.price
        )
        
        # Add to database and commit
        db.add(new_order_item)
        db.commit()
        db.refresh(new_order_item)
        
        return {
            "order_item_id": new_order_item.id,
            "message": "Order item added successfully"
        }
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order item: {str(e)}")
