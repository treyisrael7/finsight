"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import LandingNav from "@/components/landing/LandingNav";
import FinancialGraph3D from "@/components/landing/FinancialGraph3D";
import ProductMockup from "@/components/landing/ProductMockup";
import { MessageSquare, BarChart3, Compass } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat with your finances",
    description: "Ask questions about spending, saving, and investing.",
  },
  {
    icon: BarChart3,
    title: "See the story behind your numbers",
    description: "Understand where your money goes with clear insights.",
  },
  {
    icon: Compass,
    title: "Plan with more confidence",
    description: "Explore better financial decisions with contextual AI guidance.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-finsight-bg text-finsight-primary-text finsight-grid-bg">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-finsight-border px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="max-w-[28rem] text-4xl font-semibold leading-[1.15] tracking-tight text-finsight-primary-text sm:text-5xl sm:leading-[1.12] lg:text-[2.75rem]">
                Your AI copilot for smarter financial decisions
              </h1>
              <p className="mt-6 max-w-[32rem] text-lg leading-[1.6] text-finsight-secondary-text">
                Track spending, understand your cash flow, and explore smarter saving and investing decisions through an AI-powered conversational interface.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-finsight-accent-blue px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-finsight-accent-blue/90 hover:shadow-[0_0_20px_rgba(79,140,255,0.2)]"
                >
                  Try Demo
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center rounded-lg border border-finsight-border bg-transparent px-5 py-2.5 text-sm font-medium text-finsight-primary-text transition-colors hover:border-finsight-accent-blue/40 hover:text-finsight-accent-blue"
                >
                  See Features
                </Link>
              </div>
              <p className="mt-8 text-sm text-finsight-muted-text">
                Budgeting • Savings Insights • Portfolio Awareness
              </p>
            </motion.div>

            <motion.div
              className="relative flex min-h-[440px] items-center justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* 3D graph behind mockup */}
              <FinancialGraph3D />
              <div className="relative z-10 w-full flex justify-center">
                <ProductMockup />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-b border-finsight-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-finsight-primary-text sm:text-3xl">
              Built for clarity and control
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-finsight-secondary-text">
              One place to understand your money and get actionable guidance.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group relative rounded-xl border border-finsight-border bg-finsight-surface/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-finsight-accent-blue/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2),0_0_0_1px_rgba(79,140,255,0.08)]"
              >
                <div className="relative">
                  <div
                    className="absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: "radial-gradient(120px 80px at 2rem 2rem, rgba(79,140,255,0.06), transparent 70%)",
                    }}
                    aria-hidden
                  />
                  <div
                    className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-finsight-border bg-finsight-card/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    style={{
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 24px rgba(79,140,255,0.06)",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg opacity-80"
                      style={{
                        background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(79,140,255,0.12), transparent 70%)",
                      }}
                      aria-hidden
                    />
                    <feature.icon className="relative h-5 w-5 text-finsight-accent-blue" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-finsight-primary-text">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-[1.55] text-finsight-secondary-text">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Walkthrough */}
      <section
        id="how-it-works"
        className="border-b border-finsight-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-finsight-primary-text sm:text-3xl">
              How FinSight works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-finsight-secondary-text">
              Chat with your finances and see the full picture in one place.
            </p>
          </motion.div>

          <motion.div
            className="mt-16 rounded-xl border border-finsight-border bg-finsight-card/60 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.04)] lg:p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2 rounded-xl border border-finsight-border bg-finsight-surface/90 p-5 shadow-sm">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-finsight-muted-text">
                  AI chat
                </p>
                <div className="space-y-3">
                  <div className="rounded-lg border border-finsight-border/60 bg-finsight-bg/70 px-4 py-3">
                    <p className="text-sm leading-relaxed text-finsight-secondary-text">
                      &quot;Can I afford to increase my monthly investment by $200?&quot;
                    </p>
                  </div>
                  <div className="rounded-lg border border-finsight-border bg-finsight-card/80 px-4 py-3 shadow-sm">
                    <p className="text-sm leading-[1.55] text-finsight-primary-text">
                      Based on your income and expenses, you have about $2,060 in free cash flow. Increasing investments by $200 is comfortable—you&apos;d still have $1,860 for savings and buffer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3 space-y-5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-finsight-muted-text">
                  Financial summary
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {["Income", "Expenses", "Savings rate", "Free cash flow"].map((label, i) => (
                    <div
                      key={label}
                      className="rounded-xl border border-finsight-border bg-finsight-surface/80 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-wider text-finsight-muted-text">
                        {label}
                      </p>
                      <p className="mt-1.5 text-base font-semibold tracking-tight text-finsight-primary-text">
                        {["$6,240", "$4,180", "33%", "$2,060"][i]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-finsight-border bg-finsight-surface/60 p-5">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-finsight-muted-text">
                    Spending trend
                  </p>
                  <div className="flex h-20 items-end gap-1.5">
                    {[40, 55, 48, 62, 52, 70, 58, 65, 50].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          backgroundColor: "var(--finsight-accent-blue)",
                          opacity: 0.6,
                          minHeight: 4,
                        }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04, duration: 0.35 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing anchor / placeholder */}
      <section id="pricing" className="scroll-mt-20 border-b border-finsight-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-semibold text-finsight-primary-text">Simple pricing</h2>
          <p className="mt-2 text-finsight-secondary-text">Plans and pricing coming soon. Try the demo to explore FinSight.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-finsight-primary-text sm:text-3xl lg:text-4xl">
            Make smarter money decisions with FinSight
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-finsight-accent-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-finsight-accent-blue/90"
            >
              Try Demo
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center rounded-lg border border-finsight-border bg-transparent px-6 py-3 text-sm font-medium text-finsight-primary-text transition-colors hover:border-finsight-accent-blue/40 hover:text-finsight-accent-blue"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-finsight-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-finsight-muted-text">
          © {new Date().getFullYear()} FinSight. AI-powered financial insights.
        </div>
      </footer>
    </div>
  );
}
