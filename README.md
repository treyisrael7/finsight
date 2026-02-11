# FinSight

FinSight is a full-stack personal finance app for tracking financial goals and getting quick AI-backed answers to everyday money questions.

Users can create short-, medium-, and long-term goals, log progress over time, and use an AI chat assistant that responds based on their goals and risk profile for more personalized advice.

Built as a SaaS-style project with secure authentication, database-level security rules, and usage protections to keep the OpenAI API affordable.

---

## Features

- Secure authentication (Supabase Auth)
- Create and track short-, medium-, and long-term financial goals
- Log progress and update goal status over time
- AI chat assistant personalized to your goals and risk profile
- Persistent user data storage (Supabase Postgres)
- Supabase Row Level Security (RLS) for per-user data isolation
- Rate-limited chat requests to prevent abuse and control token usage

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS  
- **Backend:** Next.js API Routes  
- **Database/Auth:** Supabase (Postgres + Auth + RLS)  
- **AI:** OpenAI API  

---

## Live Demo

https://finsight-mocha.vercel.app/

---

## Rate Limiting

Chat requests are rate-limited to keep the demo cheap to run:
- 3 requests per minute
- 10 requests per day

---

## Notes

This project is meant for educational/demo purposes and does not replace professional financial advice.
