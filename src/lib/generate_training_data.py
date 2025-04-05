import json
import os
from typing import List, Dict
import random

class FinancialDataGenerator:
    def __init__(self):
        self.topics = {
            "investing": [
                "stocks", "bonds", "ETFs", "mutual funds", "real estate", 
                "cryptocurrency", "commodities", "index funds", "penny stocks",
                "dividend stocks", "growth stocks", "value stocks", "blue-chip stocks",
                "international stocks", "emerging markets", "tech stocks"
            ],
            "amounts": [
                "$500", "$1,000", "$2,500", "$5,000", "$7,500", "$10,000", "$15,000",
                "$25,000", "$50,000", "$75,000", "$100,000", "$250,000", "$500,000", "$1,000,000"
            ],
            "timeframes": [
                "short-term", "long-term", "1 year", "2 years", "3 years", "5 years", 
                "10 years", "15 years", "20 years", "for retirement", "for a house", 
                "for college", "for emergency fund", "for passive income"
            ],
            "risk_levels": [
                "low-risk", "moderate-risk", "high-risk", "conservative",
                "aggressive", "balanced", "very conservative", "very aggressive",
                "growth-oriented", "income-focused"
            ],
            "life_events": [
                "marriage", "having a baby", "buying a house", "starting a business",
                "inheritance", "job loss", "retirement", "career change", "divorce"
            ],
            "insurance": [
                "Calculate your coverage needs based on income and dependents",
                "Consider term life insurance for cost-effective coverage",
                "Review and update beneficiaries regularly",
                "Compare quotes from multiple insurance providers",
                "Understand policy exclusions and limitations",
                "Consider bundling insurance policies for discounts",
                "Review coverage annually as circumstances change",
                "Maintain good health and safety records for better rates",
                "Consider higher deductibles for lower premiums",
                "Document valuable assets for insurance purposes",
                "Keep detailed records of policy information",
                "Understand the claims process before you need it",
                "Consider umbrella insurance for additional liability protection",
                "Review employer-provided insurance benefits"
            ],
            "estate_planning": [
                "Create a comprehensive will",
                "Consider setting up a living trust",
                "Designate power of attorney",
                "Create healthcare directives",
                "Review and update beneficiary designations",
                "Consider tax implications of asset transfers",
                "Document digital assets and passwords",
                "Work with an estate planning attorney",
                "Regular review and updates of estate documents",
                "Consider life insurance as part of estate planning",
                "Plan for business succession if applicable",
                "Discuss plans with family members",
                "Consider charitable giving strategies",
                "Keep documents in a secure, accessible location"
            ],
            "business_finance": [
                "Separate personal and business finances",
                "Maintain detailed financial records",
                "Set up proper accounting systems",
                "Consider tax implications of business structure",
                "Build business credit separately from personal",
                "Create emergency fund for business",
                "Plan for seasonal cash flow variations",
                "Consider multiple funding sources",
                "Implement proper financial controls",
                "Regular financial statement review",
                "Plan for tax obligations",
                "Consider business insurance needs",
                "Create a business succession plan",
                "Monitor key financial metrics"
            ]
        }
        
        self.templates = {
            "investing": [
                "What's the best way to invest {amount} {timeframe}?",
                "How should I invest {amount} in {investment_type}?",
                "Is it a good time to invest in {investment_type}?",
                "What {risk_level} investments would you recommend for {amount}?",
                "How can I start investing in {investment_type} with {amount}?",
                "What's your advice on investing {amount} in {investment_type} {timeframe}?",
                "Should I diversify my {amount} investment across different {investment_type}?",
                "What are the risks of investing {amount} in {investment_type}?",
                "How can I maximize returns on {amount} investment in {investment_type}?"
            ],
            "retirement": [
                "How much should I save for retirement if I'm {age} years old?",
                "What retirement accounts should I prioritize?",
                "Should I focus on {investment_type} for retirement?",
                "How can I catch up on retirement savings in my {age}s?",
                "What's the best retirement strategy for someone earning {amount} yearly?",
                "How should I adjust my retirement strategy during market volatility?",
                "What's the optimal retirement portfolio allocation at age {age}?",
                "Should I convert my traditional IRA to a Roth IRA?",
                "How do I plan for healthcare costs in retirement?"
            ],
            "budgeting": [
                "How do I create a budget for {amount} monthly income?",
                "What's the best way to save {amount} in {timeframe}?",
                "How can I reduce my monthly expenses?",
                "What's a good budget breakdown for {amount} salary?",
                "How should I allocate my {amount} budget?",
                "How can I save more from my {amount} income?",
                "What budgeting strategy works best for variable income?",
                "How should I adjust my budget after {life_event}?",
                "What's the best way to track expenses on {amount} monthly budget?"
            ],
            "debt_management": [
                "How should I prioritize paying off different types of debt?",
                "Should I consolidate my debt?",
                "What's the best strategy to pay off {amount} in credit card debt?",
                "Should I use my savings to pay off debt?",
                "How can I improve my credit score while paying off debt?",
                "Should I refinance my loans in the current market?",
                "What's the best way to manage student loan debt?",
                "How do I create a debt payoff plan for {amount}?",
                "Should I use the avalanche or snowball method for debt repayment?"
            ],
            "tax_planning": [
                "How can I reduce my tax liability on {amount} income?",
                "What tax-advantaged investments should I consider?",
                "How do I minimize taxes on my investments?",
                "What are the tax implications of {investment_type}?",
                "Should I take the standard deduction or itemize?",
                "How can I maximize my tax deductions?",
                "What tax strategies work best for self-employed individuals?",
                "How should I handle taxes after {life_event}?",
                "What's the most tax-efficient way to withdraw retirement funds?"
            ]
        }
        
        self.response_components = {
            "investing": [
                "Consider diversifying across different asset classes",
                "Start with low-cost index funds",
                "Make sure you have an emergency fund first",
                "Research the market thoroughly before investing",
                "Consider your risk tolerance",
                "Don't invest money you can't afford to lose",
                "Regular contributions are key to long-term growth",
                "Review and rebalance your portfolio periodically",
                "Consider dollar-cost averaging to reduce timing risk",
                "Look for investments with low expense ratios",
                "Understand the tax implications of your investments",
                "Keep a long-term perspective despite market volatility",
                "Consider working with a financial advisor for complex portfolios",
                "Monitor your investments but avoid emotional decisions"
            ],
            "retirement": [
                "Maximize employer 401(k) matching if available",
                "Consider opening an IRA",
                "Diversify your retirement portfolio",
                "Start saving as early as possible",
                "Take advantage of catch-up contributions if over 50",
                "Consider tax implications of different accounts",
                "Plan for healthcare costs in retirement",
                "Consider long-term care insurance",
                "Review and adjust your retirement plan annually",
                "Calculate your expected retirement expenses",
                "Consider inflation in your planning",
                "Look into Social Security optimization strategies",
                "Build multiple income streams for retirement",
                "Consider Roth conversions in low-income years"
            ],
            "budgeting": [
                "Track all expenses meticulously",
                "Use the 50/30/20 rule as a guideline",
                "Set up automatic savings",
                "Cut unnecessary expenses",
                "Build an emergency fund",
                "Pay yourself first",
                "Use cash envelopes for problem spending areas",
                "Review subscriptions and recurring charges",
                "Plan meals to reduce food expenses",
                "Use cashback credit cards responsibly",
                "Consider a zero-based budgeting approach",
                "Set specific financial goals",
                "Use technology to automate bill payments",
                "Review and adjust your budget monthly"
            ],
            "debt_management": [
                "List all debts with their interest rates",
                "Focus on high-interest debt first",
                "Consider debt consolidation for better rates",
                "Don't close credit cards after paying them off",
                "Negotiate with creditors for better terms",
                "Set up automatic payments to avoid late fees",
                "Consider balance transfer options",
                "Build an emergency fund to avoid new debt",
                "Look into income-driven repayment plans",
                "Check if refinancing makes sense",
                "Avoid taking on new debt while paying off existing debt",
                "Consider the tax implications of debt forgiveness",
                "Keep track of your credit score",
                "Understand the terms of all your loans"
            ],
            "tax_planning": [
                "Maximize retirement account contributions",
                "Consider tax-loss harvesting",
                "Keep detailed records of deductions",
                "Time your income and deductions strategically",
                "Use HSA accounts if eligible",
                "Consider municipal bonds for tax-free income",
                "Plan charitable giving strategically",
                "Review tax implications of investment decisions",
                "Consider qualified business income deductions",
                "Look into opportunity zones",
                "Use tax-advantaged college savings plans",
                "Consider timing of capital gains and losses",
                "Review state and local tax implications",
                "Consult with a tax professional for complex situations"
            ]
        }

    def generate_question(self, category: str) -> str:
        template = random.choice(self.templates[category])
        return template.format(
            amount=random.choice(self.topics["amounts"]),
            timeframe=random.choice(self.topics["timeframes"]),
            investment_type=random.choice(self.topics["investing"]),
            risk_level=random.choice(self.topics["risk_levels"]),
            age=random.randint(20, 60),
            life_event=random.choice(self.topics["life_events"])
        )

    def generate_response(self, category: str) -> str:
        # Select main components
        components = self.response_components[category]
        num_points = random.randint(4, 6)  # Vary the number of points
        selected_points = random.sample(components, min(num_points, len(components)))
        
        # Add introduction based on category
        intros = {
            "investing": [
                "Based on your investment goals, here's what I recommend: ",
                "Here's a strategic approach to your investment: ",
                "Consider these key investment principles: "
            ],
            "retirement": [
                "For optimal retirement planning, follow these steps: ",
                "Here's how to strengthen your retirement strategy: ",
                "To secure your retirement future, consider: "
            ],
            "budgeting": [
                "To optimize your budget, here are key steps: ",
                "Here's an effective budgeting strategy: ",
                "Follow these budgeting principles: "
            ],
            "debt_management": [
                "To effectively manage your debt, consider: ",
                "Here's a strategic approach to debt reduction: ",
                "Follow these steps to tackle your debt: "
            ],
            "tax_planning": [
                "To optimize your tax situation, consider: ",
                "Here's a tax-efficient strategy: ",
                "Follow these tax planning principles: "
            ]
        }
        
        # Build response
        response = random.choice(intros[category])
        for i, point in enumerate(selected_points, 1):
            response += f"{i}) {point} "
        
        # Add conclusion
        conclusions = [
            "Remember to review and adjust this strategy as your circumstances change.",
            "Consider consulting with a financial professional for personalized advice.",
            "Monitor your progress and adjust your approach as needed.",
            "Stay committed to your financial goals while remaining flexible.",
            "Regular review and rebalancing will help you stay on track."
        ]
        response += f"{random.choice(conclusions)}"
        
        return response.strip()

    def generate_dataset(self, num_examples: int) -> List[Dict]:
        dataset = []
        categories = list(self.templates.keys())
        
        for _ in range(num_examples):
            category = random.choice(categories)
            dataset.append({
                "messages": [
                    {"role": "user", "content": self.generate_question(category)},
                    {"role": "assistant", "content": self.generate_response(category)}
                ]
            })
        
        return dataset

def main():
    generator = FinancialDataGenerator()
    
    # Generate dataset with 500 examples
    num_examples = 500
    dataset = generator.generate_dataset(num_examples)
    
    # Create directory for training data
    os.makedirs("training_data", exist_ok=True)
    
    # Save as JSON
    with open("training_data/financial_advice.json", "w") as f:
        json.dump(dataset, f, indent=2)
    
    # Convert to JSONL
    with open("training_data/financial_advice.jsonl", "w") as f:
        for example in dataset:
            f.write(json.dumps(example) + "\n")
    
    print(f"Generated {num_examples} training examples")
    print("Files saved: financial_advice.json and financial_advice.jsonl")

if __name__ == "__main__":
    main() 