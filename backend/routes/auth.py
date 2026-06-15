from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pymongo.database import Database
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
from negotiationai.backend.database import get_db
from negotiationai.backend.models import schemas
from negotiationai.backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Database = Depends(get_db)):
    db_user = db.users.find_one({"username": user.username})
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.users.find_one({"email": user.email})
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "username": user.username,
        "hashed_password": hashed_password
    }
    db.users.insert_one(new_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Database = Depends(get_db)):
    user = db.users.find_one({"username": form_data.username})
    
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme), db: Database = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = db.users.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    return user

@router.get("/profile", response_model=schemas.UserProfileSchema)
def get_profile(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    user_id_str = str(current_user["_id"])
    cursor = db.negotiation_history.find({"user_id": user_id_str}).sort("timestamp", -1)
    negotiations = list(cursor)
    
    formatted_negotiations = []
    avg_value = 0
    if negotiations:
        avg_value = sum(n.get("value_claimed_pct", 0) for n in negotiations) / len(negotiations)
        for neg in negotiations:
            formatted_negotiations.append({
                "id": str(neg["_id"]),
                "mode": neg.get("mode", ""),
                "persona": neg.get("persona", ""),
                "final_price": neg.get("final_price"),
                "agreement_reached": neg.get("agreement_reached", "false"),
                "value_claimed_pct": neg.get("value_claimed_pct", 0.0),
                "timestamp": neg.get("timestamp"),
                "feedback": neg.get("feedback", "")
            })
        
    return {
        "id": user_id_str,
        "username": current_user["username"],
        "email": current_user["email"],
        "negotiation_count": len(negotiations),
        "avg_value_claimed": round(avg_value, 2),
        "recent_history": formatted_negotiations
    }
