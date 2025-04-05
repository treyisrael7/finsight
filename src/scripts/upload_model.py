from huggingface_hub import HfApi
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import os
import shutil
from pathlib import Path

def prepare_model_for_upload():
    print("Preparing model for upload...")
    
    # Source directories
    source_dir = Path("./fine_tuned_model/results/checkpoint-186")
    if not source_dir.exists():
        raise FileNotFoundError(f"Model directory not found at {source_dir}")
    
    # Create temporary directory for upload
    upload_dir = Path("./upload_model")
    upload_dir.mkdir(exist_ok=True)
    
    # Copy model files
    print("Copying model files...")
    for file in source_dir.glob("*"):
        shutil.copy2(file, upload_dir)
    
    # Copy README
    shutil.copy2("./fine_tuned_model/README.md", upload_dir)
    
    return upload_dir

def upload_to_hub(model_dir: Path, repo_name: str = "fin-gpt2-chatbot"):
    """Upload model to Hugging Face Hub"""
    try:
        print(f"Uploading model to huggingface.co/treyisrael/{repo_name}")
        api = HfApi()
        
        # Create repository if it doesn't exist
        try:
            api.create_repo(
                repo_id=f"treyisrael/{repo_name}",
                exist_ok=True,
                private=False
            )
        except Exception as e:
            print(f"Note: Repository may already exist: {e}")
        
        # Upload all files
        api.upload_folder(
            folder_path=str(model_dir),
            repo_id=f"treyisrael/{repo_name}",
            repo_type="model"
        )
        
        print("Upload completed successfully!")
        print(f"Your model is now available at: https://huggingface.co/treyisrael/{repo_name}")
        
    except Exception as e:
        print(f"Error uploading model: {e}")
        raise
    finally:
        # Cleanup
        if model_dir.exists():
            shutil.rmtree(model_dir)

if __name__ == "__main__":
    try:
        upload_dir = prepare_model_for_upload()
        upload_to_hub(upload_dir)
    except Exception as e:
        print(f"Error: {e}") 