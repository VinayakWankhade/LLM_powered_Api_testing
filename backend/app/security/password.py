from passlib.context import CryptContext

# 1. Setup the hashing engine
# We use bcrypt - it's a "slow" hashing algorithm which is exactly 
# what we want to prevent hackers from guessing passwords quickly.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Transforms a plain password into a secure hash.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a plain password matches the hashed version stored in the DB.
    """
    return pwd_context.verify(plain_password, hashed_password)
