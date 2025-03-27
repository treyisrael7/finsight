import React from "react";
import Link from "next/link";

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  progress?: number;
  isLocked?: boolean;
}

export default function LessonCard({
  id,
  title,
  description,
  difficulty,
  duration,
  progress = 0,
  isLocked = false,
}: LessonCardProps) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <span
            className={`px-2 py-1 rounded-full text-sm ${difficultyColors[difficulty]}`}
          >
            {difficulty}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{duration}</span>
          {!isLocked && (
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <div className="mt-4">
          {isLocked ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
            >
              🔒 Locked
            </button>
          ) : (
            <Link
              href={`/learn/${id}`}
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-700 transition-colors"
            >
              Start Lesson
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
