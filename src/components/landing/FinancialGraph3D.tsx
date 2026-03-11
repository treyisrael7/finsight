"use client";

import { motion } from "framer-motion";

const POINTS = [
  { x: 12, y: 72 },
  { x: 28, y: 68 },
  { x: 44, y: 58 },
  { x: 60, y: 48 },
  { x: 76, y: 38 },
  { x: 92, y: 28 },
];
const LINE_PATH = `M 12 72 Q 20 70 28 68 T 44 58 T 60 48 T 76 38 T 92 28`;

export default function FinancialGraph3D() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ perspective: "800px" }}
    >
      <motion.div
        className="relative h-[200px] w-[320px] opacity-[0.65]"
        animate={{
          y: [0, -5, 0],
          rotateX: [5, 7, 5],
          rotateY: [-3, 0, -3],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: "perspective(800px) rotateX(6deg) rotateY(-2deg)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          style={{ filter: "drop-shadow(0 0 24px rgba(79, 140, 255, 0.12))" }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#4F8CFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feFlood floodColor="#4F8CFF" floodOpacity="0.25" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint grid plane */}
          <g opacity="0.12" stroke="rgba(255,255,255,0.18)" strokeWidth="0.25" fill="none">
            {[20, 40, 60, 80].map((x) => (
              <line key={`v${x}`} x1={x} y1="10" x2={x} y2="90" />
            ))}
            {[20, 40, 60, 80].map((y) => (
              <line key={`h${y}`} x1="10" y1={y} x2="90" y2={y} />
            ))}
          </g>

          {/* Semi-transparent bars under selected points */}
          {[2, 4, 5].map((i) => (
            <rect
              key={i}
              x={POINTS[i].x - 4}
              y={POINTS[i].y}
              width="8"
              height={100 - POINTS[i].y}
              rx="1"
              fill="rgba(79, 140, 255, 0.06)"
              stroke="rgba(79, 140, 255, 0.1)"
              strokeWidth="0.35"
            />
          ))}

          {/* Thin glowing line */}
          <motion.path
            d={LINE_PATH}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
            initial={{ pathLength: 0, opacity: 0.7 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Node points with subtle pulse */}
          {POINTS.map((p, i) => (
            <g key={i} filter="url(#glow)">
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="2"
                fill="#4F8CFF"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.3 }}
              />
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="3.2"
                fill="none"
                stroke="rgba(79, 140, 255, 0.35)"
                strokeWidth="0.45"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            </g>
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}
