# FinSight

A small app I built to track financial goals and get quick AI-backed answers to basic money questions.

You set goals (short, medium, and long term), log progress toward them, and there’s a chat where you can ask the AI for advice. It’s aware of your goals and risk profile so answers can be a bit more relevant. Auth is handled with Supabase and everything’s stored there.

**Stack:** Next.js 14, TypeScript, Tailwind, Supabase, OpenAI.

## Run it

```bash
git clone https://github.com/treyisrael7/finsight.git
cd finsight
npm install
npm run dev
```

Chat is rate-limited (3/min, 10/day) so the demo stays cheap to run.
