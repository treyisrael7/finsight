import subprocess
import os
import sys
import json
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return its output"""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            check=True,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print(f"✅ {command}")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running {command}:")
        print(e.stderr)
        sys.exit(1)

def setup_python_environment():
    """Set up Python environment and install dependencies"""
    print("\n📦 Setting up Python environment...")
    
    # Create virtual environment
    run_command("python -m venv venv")
    
    # Activate virtual environment
    if sys.platform == "win32":
        activate_cmd = ".\\venv\\Scripts\\activate"
    else:
        activate_cmd = "source venv/bin/activate"
    
    # Install Python dependencies
    requirements = [
        "torch",
        "transformers",
        "datasets",
        "fastapi",
        "uvicorn",
        "pydantic",
        "python-dotenv"
    ]
    
    for req in requirements:
        run_command(f"{activate_cmd} && pip install {req}")

def setup_node_environment():
    """Set up Node.js environment and install dependencies"""
    print("\n📦 Setting up Node.js environment...")
    
    # Install Node.js dependencies
    run_command("npm install")

def generate_training_data():
    """Generate and prepare training data"""
    print("\n📚 Generating training data...")
    run_command("python src/lib/generate_training_data.py")

def train_model():
    """Train the model"""
    print("\n🧠 Training the model...")
    run_command("python src/lib/train_model.py")

def create_env_file():
    """Create .env.local file with template values"""
    print("\n📝 Creating .env.local file...")
    
    env_content = """NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
MODEL_SERVER_URL=http://localhost:3001"""

    with open(".env.local", "w") as f:
        f.write(env_content)
    
    print("✅ Created .env.local file (please update with your Supabase credentials)")

def setup_directory_structure():
    """Create necessary directories"""
    print("\n📁 Setting up directory structure...")
    
    directories = [
        "src/lib",
        "training_data",
        "fine_tuned_model",
        "logs",
        "results"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Created directory structure")

def main():
    print("🚀 Starting FinSight setup...")
    
    # Create directory structure
    setup_directory_structure()
    
    # Set up Python environment
    setup_python_environment()
    
    # Set up Node.js environment
    setup_node_environment()
    
    # Create .env file
    create_env_file()
    
    # Generate training data
    generate_training_data()
    
    # Train model
    train_model()
    
    print("\n✨ Setup complete! Next steps:")
    print("1. Update .env.local with your Supabase credentials")
    print("2. Run the model server: python src/lib/server.py")
    print("3. In another terminal, run the app: npm run dev")

if __name__ == "__main__":
    main() 