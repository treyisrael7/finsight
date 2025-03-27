import MainLayout from "@/components/layout/MainLayout";
import LessonCard from "@/components/lesson/LessonCard";

type Difficulty = "beginner" | "intermediate" | "advanced";

// This would typically come from your database
const SAMPLE_LESSONS = [
  {
    id: "1",
    title: "Understanding Money Basics",
    description:
      "Learn the fundamentals of money, including what it is, how it works, and its role in society.",
    difficulty: "beginner" as Difficulty,
    duration: "10 mins",
    progress: 0,
  },
  {
    id: "2",
    title: "Budgeting Fundamentals",
    description:
      "Master the art of creating and maintaining a budget to achieve your financial goals.",
    difficulty: "beginner" as Difficulty,
    duration: "15 mins",
    progress: 0,
  },
  {
    id: "3",
    title: "Saving Strategies",
    description:
      "Discover effective saving techniques and learn how to build an emergency fund.",
    difficulty: "beginner" as Difficulty,
    duration: "12 mins",
    progress: 0,
  },
  {
    id: "4",
    title: "Introduction to Investing",
    description:
      "Learn the basics of investing, including stocks, bonds, and mutual funds.",
    difficulty: "intermediate" as Difficulty,
    duration: "20 mins",
    progress: 0,
    isLocked: true,
  },
];

export default function LearnPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Learning Path</h1>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-grow bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{ width: "25%" }}
              />
            </div>
            <span className="text-gray-600">25% Complete</span>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid gap-6">
          {SAMPLE_LESSONS.map((lesson) => (
            <LessonCard key={lesson.id} {...lesson} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
