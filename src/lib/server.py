from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import FinancialChatbot
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware to allow requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot
logger.info("Initializing chatbot...")
chatbot = FinancialChatbot()
logger.info("Chatbot initialized successfully")

class Query(BaseModel):
    message: str

@app.post("/chat")
async def chat(query: Query):
    try:
        # Input validation
        if not query.message or not isinstance(query.message, str):
            raise HTTPException(status_code=400, detail="Invalid message format")
            
        if len(query.message) > 500:
            raise HTTPException(status_code=400, detail="Message too long")
            
        # Process query and get response
        result = chatbot.process_query(query.message)
        return result
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001) 