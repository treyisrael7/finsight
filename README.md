# FinSight 💰

A personal finance app I built to track financial goals and get AI-powered financial advice. Perfect for managing your money journey with a friendly AI assistant.

## 🚀 Live Demo

[View Live Demo](https://your-app-name.vercel.app) *(Update with your Vercel URL)*

## What I Built

- **Goal Tracking** - Set and monitor short-term, medium-term, and long-term financial goals
- **AI Financial Advisor** - Chat with an AI that gives personalized financial advice
- **Progress Visualization** - See your progress with clean charts and metrics
- **User Authentication** - Secure signup/login system
- **Responsive Design** - Works great on desktop and mobile

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion  
**Backend:** Supabase (PostgreSQL, Auth, Real-time)  
**AI:** OpenAI GPT-3.5  
**Deployment:** Vercel

## Getting Started

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/finsight.git
   cd finsight
   npm install
   ```

2. **Set up environment variables**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPEN_AI_KEY=your_openai_api_key
   ```

3. **Set up the database**
   - Create a Supabase project
   - Run the migration files in `supabase/migrations/` in order

4. **Run it**
   ```bash
   npm run dev
   ```

## Key Features

- **Smart Rate Limiting** - Prevents API abuse (3 requests/min, 10/day)
- **Secure Authentication** - Row-level security with Supabase
- **Cost Protection** - Heavy token limits to keep costs minimal
- **Modern UI** - Dark/light mode, smooth animations

## Why I Built This

This started as a way to learn full-stack development with modern tools. I wanted to build something that could actually help people manage their finances while showcasing my skills with React, Next.js, and AI integration.

## What I Learned

- Full-stack development with Next.js and Supabase
- AI integration with OpenAI API
- Database design and Row Level Security
- Rate limiting and cost optimization
- Modern UI/UX with Tailwind CSS and Framer Motion

---

**Note:** This is a portfolio project with rate limits to prevent excessive API costs. The AI chat is limited to keep it affordable for demo purposes.

Built with ❤️ by [Your Name]