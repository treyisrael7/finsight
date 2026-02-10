# FinSight

Track financial goals and chat with an AI for basic financial advice.

**Stack:** Next.js 14, TypeScript, Tailwind, Supabase, OpenAI.

## Run locally

```bash
git clone https://github.com/treyisrael7/finsight.git
cd finsight
npm install
npm run dev
```

Use a Supabase project for auth and DB; configure env vars for your Supabase URL/keys and OpenAI key. Chat is rate-limited (3/min, 10/day) to keep API costs down.
