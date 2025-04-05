from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch
from typing import Dict, Any, Tuple
from pathlib import Path
import logging
from src.config.model_config import (
    MODEL_DIR,
    BASE_TOKENIZER,
    MAX_LENGTH,
    TEMPERATURE,
    TOP_P,
    MAX_TIME,
    DO_SAMPLE
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinancialChatbot:
    def __init__(self):
        """Initialize the Financial Chatbot with model and tokenizer"""
        try:
            logger.info("Initializing FinancialChatbot...")
            self._load_model_and_tokenizer()
            self._initialize_sentiment_analysis()
            logger.info("FinancialChatbot ready!")
        except Exception as e:
            logger.error(f"Error initializing chatbot: {str(e)}")
            raise

    def _load_model_and_tokenizer(self):
        """Load the model and tokenizer with proper error handling"""
        try:
            logger.info("Loading tokenizer...")
            self.tokenizer = GPT2Tokenizer.from_pretrained(BASE_TOKENIZER)
            
            logger.info(f"Loading model from {MODEL_DIR}")
            if not MODEL_DIR.exists():
                raise FileNotFoundError(f"Model not found at {MODEL_DIR}")
            
            # Check if CUDA is available
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self.device}")
            
            # Load model with optimizations
            self.model = GPT2LMHeadModel.from_pretrained(
                str(MODEL_DIR),
                local_files_only=True,
                low_cpu_mem_usage=True,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            ).to(self.device)
            
            # Optimize for inference
            self.model.eval()
            if self.device == "cpu":
                torch.set_grad_enabled(False)
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

    def generate_response(self, message: str) -> str:
        """Generate a response for the given message"""
        try:
            # Format input
            prompt = f"user: {message}\nassistant:"
            
            # Tokenize
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=MAX_LENGTH
            ).to(self.device)
            
            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs["input_ids"],
                    max_length=MAX_LENGTH,
                    num_return_sequences=1,
                    temperature=TEMPERATURE,
                    top_p=TOP_P,
                    do_sample=DO_SAMPLE,
                    pad_token_id=self.tokenizer.eos_token_id,
                    max_time=MAX_TIME,
                    early_stopping=True
                )
            
            # Decode and clean response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = response.split("assistant:")[-1].strip()
            
            # Analyze sentiment
            sentiment, confidence, details = self._analyze_sentiment(response)
            
            return {
                'response': response,
                'sentiment': sentiment,
                'confidence': confidence,
                'sentiment_details': details
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                'response': "I apologize, but I encountered an error. Please try again.",
                'sentiment': 'neutral',
                'confidence': 0.0,
                'error': str(e)
            }

    def _initialize_sentiment_analysis(self):
        """Initialize sentiment analysis dictionaries"""
        # Financial terms with sentiment scores (-1 to 1)
        self.financial_terms = {
            # Positive terms
            'growth': 0.8,
            'profit': 0.9,
            'gain': 0.7,
            'return': 0.6,
            'dividend': 0.6,
            'appreciation': 0.7,
            'bull': 0.6,
            'uptrend': 0.7,
            'recovery': 0.5,
            'opportunity': 0.6,
            
            # Negative terms
            'loss': -0.8,
            'debt': -0.6,
            'risk': -0.5,
            'decline': -0.7,
            'bear': -0.6,
            'downtrend': -0.7,
            'recession': -0.8,
            'default': -0.9,
            'inflation': -0.5,
            'volatility': -0.4,
        }
        
        # Action phrases
        self.action_phrases = {
            'consider': 0.2,
            'recommend': 0.4,
            'avoid': -0.6,
            'caution': -0.4,
            'suggest': 0.3,
            'warning': -0.5,
        }
        
        # Context modifiers
        self.context_modifiers = {
            'high': 1.5,
            'low': 0.5,
            'very': 2.0,
            'slightly': 0.5,
            'significant': 1.5,
            'potential': 0.8,
        }

    def _analyze_sentiment(self, text: str) -> Tuple[str, float, Dict[str, Any]]:
        """Analyze sentiment of the response"""
        # Implementation remains the same as before
        # ... (keeping existing sentiment analysis implementation) 