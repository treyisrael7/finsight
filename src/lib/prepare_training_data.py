import json
import os

def create_training_data():
    """
    Create training data in the format required for fine-tuning.
    Each example should be a conversation with a user query and expert response.
    """
    training_data = [
        {
            "messages": [
                {"role": "user", "content": "What's the best way to start investing with $1000?"},
                {"role": "assistant", "content": "For beginning investors with $1000, I recommend: 1) Start with a low-cost index fund that tracks the S&P 500 2) Consider using a robo-advisor platform for automatic diversification 3) Make sure you have an emergency fund first 4) Look into tax-advantaged accounts like a Roth IRA 5) Avoid individual stocks until you have more experience and capital."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "How do I create a monthly budget?"},
                {"role": "assistant", "content": "To create an effective monthly budget: 1) Calculate your total monthly income 2) List all fixed expenses (rent, utilities, etc.) 3) Track variable expenses (food, entertainment) 4) Use the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings 5) Consider using budgeting apps to automate tracking 6) Review and adjust your budget monthly."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "Should I pay off debt or invest?"},
                {"role": "assistant", "content": "The decision between paying off debt and investing depends on several factors: 1) Compare interest rates - if debt interest is higher than potential investment returns, prioritize debt 2) Always pay at least minimum debt payments 3) Consider employer 401(k) match - this is often worth prioritizing 4) Build an emergency fund first 5) High-interest debt (like credit cards) should be paid off before investing 6) Consider a balanced approach if debt interest rates are low."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "How can I improve my credit score?"},
                {"role": "assistant", "content": "To improve your credit score effectively: 1) Always pay bills on time - set up automatic payments 2) Keep credit utilization below 30% of your limit 3) Don't close old credit cards as length of credit history matters 4) Minimize new credit applications 5) Check your credit report regularly for errors 6) Consider a secured credit card if you're building credit from scratch 7) Pay down existing debt systematically 8) Keep a mix of credit types (credit cards, installment loans) but only if needed."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "What's the difference between a traditional IRA and a Roth IRA?"},
                {"role": "assistant", "content": "The key differences between Traditional and Roth IRAs are: 1) Tax treatment - Traditional IRA contributions are tax-deductible now but withdrawals are taxed; Roth IRA contributions are taxed now but withdrawals are tax-free 2) Income limits - Roth IRAs have income eligibility limits while Traditional IRAs don't 3) Required Minimum Distributions (RMDs) - Traditional IRAs require RMDs at age 72; Roth IRAs don't 4) Early withdrawals - Roth IRA contributions can be withdrawn penalty-free anytime; Traditional IRA withdrawals before 59½ typically incur penalties 5) Best choice depends on whether you expect higher taxes now or in retirement."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "How should I prepare financially for a recession?"},
                {"role": "assistant", "content": "To prepare for a recession: 1) Build an emergency fund covering 6-12 months of expenses 2) Pay down high-interest debt aggressively 3) Diversify your investment portfolio across different asset classes 4) Consider defensive stocks and bonds 5) Update your resume and invest in skills development 6) Review and cut unnecessary expenses 7) Consider additional income streams 8) Maintain good relationships with your professional network 9) Review your insurance coverage 10) Don't make panic-driven investment decisions."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "What's the best way to save for a house down payment?"},
                {"role": "assistant", "content": "To save for a house down payment effectively: 1) Set a specific target based on home prices in your area (typically 20% for best terms) 2) Open a high-yield savings account dedicated to your down payment 3) Automate your savings with direct deposit from your paycheck 4) Cut unnecessary expenses and redirect the savings 5) Consider temporary lifestyle changes like getting a roommate 6) Look into first-time homebuyer programs and FHA loans 7) Avoid risky investments with your down payment savings 8) Calculate additional costs like closing costs, insurance, and moving expenses 9) Set a realistic timeline and track your progress monthly."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "How do I start planning for retirement in my 20s?"},
                {"role": "assistant", "content": "Starting retirement planning in your 20s is excellent! Here's how: 1) Take full advantage of employer 401(k) matching - it's free money 2) Open a Roth IRA while in a lower tax bracket 3) Invest aggressively in diversified index funds - you have time to weather market volatility 4) Understand compound interest - starting early is your biggest advantage 5) Set up automatic contributions to retirement accounts 6) Build financial literacy through books and courses 7) Live below your means and avoid lifestyle inflation 8) Consider health savings accounts (HSAs) for tax advantages 9) Stay consistent with contributions even during market downturns."}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "What are some passive income strategies?"},
                {"role": "assistant", "content": "Here are effective passive income strategies: 1) Dividend-paying stocks and ETFs - focus on dividend aristocrats 2) Real Estate Investment Trusts (REITs) for real estate exposure without direct property management 3) Create and sell digital products like courses or ebooks 4) Rental properties with property management services 5) Peer-to-peer lending through established platforms 6) Build a blog or YouTube channel with ad revenue 7) License intellectual property or creative works 8) Invest in bonds for steady income 9) Consider franchise investments with operational partners 10) Remember that most 'passive' income requires significant upfront work or capital."}
            ]
        }
    ]

    # Create directory for training data if it doesn't exist
    os.makedirs("training_data", exist_ok=True)

    # Save the training data
    with open("training_data/financial_advice.json", "w") as f:
        json.dump(training_data, f, indent=2)

    print("Created training data with", len(training_data), "examples")

def convert_to_fine_tuning_format():
    """
    Convert the training data into the format required for fine-tuning.
    Different models might require different formats.
    """
    with open("training_data/financial_advice.json", "r") as f:
        data = json.load(f)

    # Convert to JSONL format for fine-tuning
    with open("training_data/financial_advice.jsonl", "w") as f:
        for example in data:
            f.write(json.dumps(example) + "\n")

    print("Converted training data to fine-tuning format")

if __name__ == "__main__":
    create_training_data()
    convert_to_fine_tuning_format() 