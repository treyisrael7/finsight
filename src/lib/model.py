from transformers import AutoModelForCausalLM, AutoTokenizer, GPT2LMHeadModel, GPT2Tokenizer
import torch
from typing import Dict, Any, List, Tuple
import json
import re
import sys
import os
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinancialChatbot:
    def __init__(self):
        try:
            logger.info("Initializing FinancialChatbot...")
            logger.info("Loading tokenizer...")
            # Use the local fine-tuned model
            self.model_path = "./fine_tuned_model/results/checkpoint-186"
            if not Path(self.model_path).exists():
                raise FileNotFoundError(f"Model not found at {self.model_path}")
                
            self.tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
            logger.info("Loading model...")
            
            # Check if CUDA is available
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self.device}")
            
            # Load model with optimizations
            self.model = GPT2LMHeadModel.from_pretrained(
                self.model_path,
                local_files_only=True,
                low_cpu_mem_usage=True,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            ).to(self.device)
            
            # Optimize for inference
            self.model.eval()
            if self.device == "cpu":
                torch.set_grad_enabled(False)
            
            self.max_length = 128
            logger.info("Initializing sentiment analysis...")
            self._initialize_sentiment_analysis()
            logger.info("FinancialChatbot ready!")
        except Exception as e:
            logger.error(f"Error initializing chatbot: {str(e)}")
            raise
        
    def _initialize_sentiment_analysis(self):
        """Initialize comprehensive sentiment analysis dictionaries"""
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
            
            # Neutral/Context-dependent terms
            'market': 0,
            'investment': 0.1,
            'trading': 0,
            'portfolio': 0.1,
            'diversification': 0.3,
            'balance': 0.2
        }
        
        # Action-oriented phrases
        self.action_phrases = {
            'consider': 0.2,
            'recommend': 0.4,
            'avoid': -0.6,
            'caution': -0.4,
            'suggest': 0.3,
            'warning': -0.5,
            'opportunity': 0.6,
            'risk': -0.4
        }
        
        # Context modifiers
        self.context_modifiers = {
            'high': 1.5,
            'low': 0.5,
            'very': 2.0,
            'slightly': 0.5,
            'significant': 1.5,
            'potential': 0.8,
            'careful': 0.7,
            'stable': 1.2
        }
        
    def _analyze_sentiment(self, text: str) -> Tuple[str, float, Dict[str, Any]]:
        """
        Enhanced sentiment analysis for financial text
        Returns: (sentiment_label, confidence, details)
        """
        text = text.lower()
        words = re.findall(r'\b\w+\b', text)
        
        # Initialize sentiment metrics
        sentiment_score = 0
        term_matches = []
        modifier_multiplier = 1.0
        
        # Analyze text in chunks of 3 words for context
        for i in range(len(words)):
            current_word = words[i]
            prev_word = words[i-1] if i > 0 else ""
            next_word = words[i+1] if i < len(words)-1 else ""
            
            # Check for financial terms
            if current_word in self.financial_terms:
                base_score = self.financial_terms[current_word]
                
                # Apply context modifiers
                if prev_word in self.context_modifiers:
                    base_score *= self.context_modifiers[prev_word]
                
                sentiment_score += base_score
                term_matches.append({
                    'term': current_word,
                    'score': base_score,
                    'context': f"{prev_word} {current_word} {next_word}".strip()
                })
        
        # Analyze action phrases
        for phrase in self.action_phrases:
            if phrase in text:
                sentiment_score += self.action_phrases[phrase]
                term_matches.append({
                    'term': phrase,
                    'score': self.action_phrases[phrase],
                    'type': 'action_phrase'
                })
        
        # Normalize sentiment score to [-1, 1] range
        if term_matches:
            sentiment_score = sentiment_score / len(term_matches)
        
        # Convert to sentiment label and confidence
        if sentiment_score > 0.2:
            sentiment = 'positive'
            confidence = min(abs(sentiment_score), 1.0)
        elif sentiment_score < -0.2:
            sentiment = 'negative'
            confidence = min(abs(sentiment_score), 1.0)
        else:
            sentiment = 'neutral'
            confidence = 1 - min(abs(sentiment_score) * 2, 0.8)  # Higher confidence for truly neutral statements
        
        details = {
            'raw_score': sentiment_score,
            'term_matches': term_matches,
            'analyzed_words': len(words),
            'significant_terms': len(term_matches)
        }
        
        return sentiment, confidence, details
        
    def process_query(self, query: str) -> Dict[str, Any]:
        try:
            # Input validation
            if not query or not isinstance(query, str):
                raise ValueError("Invalid query format")
                
            if len(query) > 500:
                raise ValueError("Query too long")
            
            # Format the input
            prompt = f"user: {query}\nassistant:"
            
            # Tokenize input
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=self.max_length
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs["input_ids"],
                    max_length=self.max_length,
                    num_return_sequences=1,
                    temperature=0.7,
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    max_time=10.0,  # 10 second timeout
                    early_stopping=True
                )
                
            # Decode the response
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
            logger.error(f"Error processing query: {str(e)}")
            return {
                'response': "I apologize, but I encountered an error. Please try again.",
                'sentiment': 'neutral',
                'confidence': 0.0,
                'error': str(e)
            }

if __name__ == "__main__":
    # Test the chatbot
    chatbot = FinancialChatbot()
    test_query = "I'm thinking about investing in tech stocks during this market downturn"
    result = chatbot.process_query(test_query)
    print(json.dumps(result, indent=2)) 