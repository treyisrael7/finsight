from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from src.models.financial_chatbot import FinancialChatbot
from src.utils.rate_limiter import RateLimiter
from src.config.model_config import (
    HOST,
    PORT,
    MAX_INPUT_LENGTH,
    SSL_VERIFY,
    SHOW_ERROR
)

app = FastAPI(
    title="Financial Advisor Chatbot API",
    description="API for the Financial Advisor Chatbot",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot and rate limiter
chatbot = FinancialChatbot()
rate_limiter = RateLimiter()

class Query(BaseModel):
    message: str

@app.post("/chat")
async def chat(query: Query, request: Request):
    # Get client IP
    client_ip = request.client.host
    
    # Check rate limit
    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    try:
        # Validate input length
        if len(query.message) > MAX_INPUT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Message too long. Maximum length is {MAX_INPUT_LENGTH} characters."
            )
        
        # Generate response
        result = chatbot.generate_response(query.message)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        ssl_keyfile=None,  # Add your SSL key in production
        ssl_certfile=None,  # Add your SSL cert in production
        ssl_verify=SSL_VERIFY,
        log_level="info"
    ) 