# from datetime import datetime, timedelta
# from typing import Annotated
# from fastapi import Depends, HTTPException, APIRouter
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from starlette import status
# from database import get_db
# from models import User as UserModel 

# from sqlalchemy.orm import sessionmaker
# from routers.config import settings
# from passlib.context import CryptContext
# from sqlalchemy import create_engine
# from fastapi.security import OAuth2PasswordBearer
# from jose import JWTError, jwt

# router = APIRouter( prefix="/auth", tags=["/auth"])




# SECRET_KEY = settings.secret_key
# ALGORITHM = "HS256"
# bryct_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_bearer = OAuth2PasswordBearer(tokenUrl="token")



# class UserCreate(BaseModel):
#     email: str
#     password: str



# db_dependency = Annotated[Session, Depends(get_db)]



# @router.post("/", status_code=status.HTTP_201_CREATED)
# async def create_user(user: UserCreate, db: Session = Depends(get_db)):
#     new_user = UserModel(
#         email=user.email,
#         password=bryct_context.hash(user.password)  # Changed from hashed_password to password
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return {"message": "User created successfully"}
  
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from pydantic import BaseModel
from routers.config import settings
from fastapi import Depends, HTTPException, APIRouter, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from database import get_db
from models import User as UserModel
from sqlalchemy.orm import Session
from typing import Optional, Union, Annotated
from fastapi.responses import JSONResponse

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserOut(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    class Config:
        orm_mode = True

class UserInDB(UserOut):
    hashed_password: str

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()
security = HTTPBearer(
    scheme_name="JWT",
    description="JWT authentication. Use the /auth/token endpoint to obtain a token.",
    auto_error=True
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_user(db: Session, email: str):
    try:
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if user:
            return UserInDB(
                email=user.email,
                hashed_password=user.password,
                first_name=user.first_name,
                last_name=user.last_name
            )
        return None
    except Exception as e:
        print(f"Error in get_user: {e}")
        return None
    
def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_user(db: Session, user_data: UserCreate):
    try:
        hashed_password = get_password_hash(user_data.password)
        db_user = UserModel(
            email=user_data.email,
            password=hashed_password,
            first_name=user_data.first_name or "",
            last_name=user_data.last_name or "",
            admin=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {e}")
        return None
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except (JWTError, AttributeError):
        raise credentials_exception
    user = get_user(db, email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    created_user = create_user(db, user)
    if not created_user:
        raise HTTPException(status_code=400, detail="Failed to register user")
    return {"message": "User registered successfully"}

@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_email": user.email
    }

@router.get("/users/me", response_model=UserOut)
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Security(security)):
    # In a stateless JWT setup, the server doesn't actually need to do anything
    # The client is responsible for discarding the token
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Successfully logged out"}
    )

# Helper function to get current user from JWT token

