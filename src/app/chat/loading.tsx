"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>

        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`h-12 rounded-lg animate-pulse ${
                  i % 2 === 0 ? "bg-gray-100 w-64" : "bg-teal-100 w-48"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-20 h-10 bg-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
