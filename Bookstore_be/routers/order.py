from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import OrderItemCreate
from models import Order
from routers.auth import get_current_user
from typing import List, Optional
router = APIRouter()

# @router.get("/orders/me", response_model=List[OrderSummary])
# async def get_my_orders(
#     db: Session = Depends(get_db),
#     current_user = Depends(get_current_user)
# ):
#     try:
#         # Query orders for the current user
#         orders = db.query(Order).filter(Order.user_id == current_user.id).all()
        
#         if not orders:
#             return []
            
#         return orders
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/orders")
async def create_new_order(
    order: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    
):
    new_order = Order(
        user_id=current_user.id,
        order_date=datetime.now(),
        order_amount=order.order_amount
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order