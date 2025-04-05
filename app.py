import gradio as gr
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

# Load model and tokenizer
print("Loading model and tokenizer...")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")

# Set device
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
model.eval()
print(f"Using device: {device}")

def generate_response(message):
    """Generate a response from the model"""
    try:
        # Format input
        prompt = f"user: {message}\nassistant:"
        
        # Tokenize
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=128
        ).to(device)
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                inputs["input_ids"],
                max_length=128,
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode and clean response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.split("assistant:")[-1].strip()
        
        return response
        
    except Exception as e:
        return f"Error: {str(e)}"

# Create Gradio interface
iface = gr.Interface(
    fn=generate_response,
    inputs=gr.Textbox(
        label="Your Message",
        placeholder="Ask me about financial advice...",
        lines=3
    ),
    outputs=gr.Textbox(label="Response"),
    title="FinSight Financial Advisor",
    description="Ask me anything about personal finance, investments, or financial planning!",
    examples=[
        ["What are some good investment strategies for beginners?"],
        ["How should I start saving for retirement?"],
        ["What's the difference between stocks and bonds?"],
        ["How do I create a budget?"],
        ["Should I invest in cryptocurrency?"]
    ]
)

# Launch the app
if __name__ == "__main__":
    iface.launch(server_name="0.0.0.0", server_port=7860) 