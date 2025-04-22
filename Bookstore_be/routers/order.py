from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import OrderSummary, OrderDetail, List
from models import Order
from routers.auth import get_current_user

router = APIRouter()

@router.get("/orders/me", response_model=List[OrderSummary])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Query orders for the current user
        orders = db.query(Order).filter(Order.user_id == current_user.id).all()
        
        if not orders:
            return []
            
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
