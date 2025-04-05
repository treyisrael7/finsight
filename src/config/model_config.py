import os
from pathlib import Path

# Model paths
MODEL_DIR = Path("./fine_tuned_model/results/checkpoint-186")
BASE_TOKENIZER = "gpt2"

# Model generation settings
MAX_LENGTH = int(os.getenv("MAX_TOKEN_LENGTH", "128"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
TOP_P = float(os.getenv("TOP_P", "0.9"))
MAX_TIME = 10.0  # Maximum generation time in seconds
DO_SAMPLE = True

# Server settings
HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "3001"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT", "60"))
MAX_INPUT_LENGTH = 500

# Security settings
SSL_VERIFY = False  # Set to True in production
SHOW_ERROR = False  # Set to True for development 