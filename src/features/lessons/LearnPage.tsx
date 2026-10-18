import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { lessonService } from "./lessonService";
import { PageHeader, Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function LearnPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [lessonsData, progressData] = await Promise.all([
          lessonService.getLessons(),
          user ? lessonService.getUserProgress(user.id) : Promise.resolve([]),
        ]);
        setLessons(lessonsData || []);
        setCompletedIds(
          progressData.filter((p) => p.completed_at).map((p) => p.lesson_id),
        );
      } catch (err) {
        console.error("Failed to load lessons", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learn"
        description="Master your business finances with bite-sized lessons."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => {
          const isCompleted = completedIds.includes(lesson.id);
          return (
            <Link key={lesson.id} to={`/learn/${lesson.slug}`}>
              <Card
                className={cn(
                  "h-full hover:border-teal-300 transition-colors",
                  isCompleted && "border-teal-100 bg-teal-50/30",
                )}>
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isCompleted
                          ? "bg-teal-100 text-teal-600"
                          : "bg-surface-subtle text-text-secondary",
                      )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-text-muted bg-surface-subtle px-2 py-1 rounded-full">
                      {lesson.estimated_minutes} min
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-navy-900 mb-1">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4 flex-1">
                    {lesson.summary}
                  </p>

                  <div className="flex items-center text-sm font-medium text-teal-600 mt-auto">
                    <PlayCircle className="h-4 w-4 mr-1.5" />
                    {isCompleted ? "Review lesson" : "Start lesson"}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
