from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    password: str | None = None
    username: str
    
    
class LoginRequest(BaseModel):
    email: str
    password_hash: str | None = None
    
class UserRequest(BaseModel):
    email: str
    username: str