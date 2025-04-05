import time
from typing import List, Dict
from src.config.model_config import MAX_REQUESTS_PER_MINUTE

class RateLimiter:
    def __init__(self, max_requests: int = MAX_REQUESTS_PER_MINUTE, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = {}  # IP -> list of timestamps
    
    def is_allowed(self, ip: str) -> bool:
        """Check if request is allowed for given IP"""
        current_time = time.time()
        
        # Initialize if IP not seen before
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Clean old requests
        self.requests[ip] = [
            ts for ts in self.requests[ip]
            if current_time - ts < self.window_seconds
        ]
        
        # Check if under limit
        if len(self.requests[ip]) >= self.max_requests:
            return False
        
        # Add new request
        self.requests[ip].append(current_time)
        return True
    
    def clean_old_entries(self):
        """Remove entries older than window"""
        current_time = time.time()
        for ip in list(self.requests.keys()):
            self.requests[ip] = [
                ts for ts in self.requests[ip]
                if current_time - ts < self.window_seconds
            ]
            if not self.requests[ip]:
                del self.requests[ip] 