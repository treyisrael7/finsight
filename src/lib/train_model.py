import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    get_scheduler
)
from datasets import Dataset
from torch.optim import AdamW
import os
import json
from typing import Dict, List
import math

def prepare_dataset():
    """
    Load and prepare the dataset for training
    """
    # Load the JSON dataset
    with open('training_data/financial_advice.json', 'r') as f:
        raw_data = json.load(f)
    
    # Convert to dataset format
    dataset = Dataset.from_dict({
        'messages': [item['messages'] for item in raw_data]
    })
    
    # Initialize tokenizer
    tokenizer = AutoTokenizer.from_pretrained('gpt2')
    tokenizer.pad_token = tokenizer.eos_token
    
    def format_conversation(messages: List[Dict]) -> str:
        """Format conversation into a single string"""
        conversation = ""
        for message in messages:
            role = message['role']
            content = message['content']
            conversation += f"{role}: {content}\n"
        return conversation
    
    def tokenize_function(examples: Dict) -> Dict:
        """Tokenize the conversations"""
        conversations = [format_conversation(msgs) for msgs in examples['messages']]
        return tokenizer(
            conversations,
            truncation=True,
            max_length=512,
            padding='max_length',
            return_tensors="pt"
        )
    
    # Process the dataset
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset.column_names
    )
    
    return tokenized_dataset, tokenizer

def train_model():
    """
    Fine-tune the model on our financial advice dataset with optimized parameters
    """
    # Prepare the dataset and tokenizer
    dataset, tokenizer = prepare_dataset()
    
    # Initialize the model
    model = AutoModelForCausalLM.from_pretrained('gpt2')
    
    # Optimized training arguments
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=5,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        save_steps=100,
        save_total_limit=3,
        logging_dir='./logs',
        logging_steps=50,
        learning_rate=1e-5,
        warmup_steps=100,
        weight_decay=0.01,
        fp16=True,
    )
    
    # Custom data collator with dynamic padding
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
        pad_to_multiple_of=8  # Optimize for GPU memory
    )
    
    # Initialize trainer with optimized settings
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=data_collator,
        optimizers=(
            AdamW(
                model.parameters(),
                lr=training_args.learning_rate,
                weight_decay=training_args.weight_decay,
                eps=1e-8
            ),
            get_scheduler(
                "cosine",
                optimizer=AdamW(
                    model.parameters(),
                    lr=training_args.learning_rate
                ),
                num_warmup_steps=training_args.warmup_steps,
                num_training_steps=math.ceil(len(dataset) / training_args.per_device_train_batch_size) * training_args.num_train_epochs
            )
        )
    )
    
    # Train the model
    trainer.train()
    
    # Save the fine-tuned model
    output_dir = "./fine_tuned_model"
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model saved to {output_dir}")

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("results", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    os.makedirs("fine_tuned_model", exist_ok=True)
    
    # Enable CUDA if available
    if torch.cuda.is_available():
        print("Using GPU for training")
        torch.backends.cudnn.benchmark = True
    else:
        print("Using CPU for training")
    
    # Start training
    print("Starting model fine-tuning...")
    train_model()
    print("Fine-tuning complete!") 