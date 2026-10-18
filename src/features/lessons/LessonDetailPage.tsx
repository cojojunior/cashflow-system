import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { lessonService } from "./lessonService";
import { Button, Card, Skeleton } from "@/components/ui";
import { ROUTES } from "@/constants/app";

export default function LessonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      if (!slug) return;
      try {
        // Fetch lesson
        const { data: lessonData, error: lessonErr } = await supabase
          .from("financial_lessons")
          .select("*")
          .eq("slug", slug)
          .single();

        if (lessonErr) throw lessonErr;
        setLesson(lessonData);

        // Check progress
        if (user) {
          const { data: progressData } = await supabase
            .from("lesson_progress")
            .select("completed_at")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonData.id)
            .maybeSingle();

          if (progressData?.completed_at) setIsCompleted(true);
        }
      } catch (err) {
        console.error(err);
        navigate(ROUTES.learn);
      } finally {
        setIsLoading(false);
      }
    }
    loadLesson();
  }, [slug, user, navigate]);

  const handleComplete = async () => {
    if (!user || !lesson) return;
    try {
      setIsSaving(true);
      await lessonService.markAsComplete(user.id, lesson.id);
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl mx-auto" />;
  if (!lesson) return null;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button
        onClick={() => navigate(ROUTES.learn)}
        className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-navy-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Lessons
      </button>

      <Card className="p-6 sm:p-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-600 mb-3 uppercase tracking-wider">
            <span>{lesson.level}</span>
            <span>•</span>
            <span>{lesson.estimated_minutes} min read</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">
            {lesson.title}
          </h1>
          <p className="text-lg text-text-secondary">{lesson.summary}</p>
        </div>

        {/* Markdown Content */}
        <div className="prose prose-slate prose-teal max-w-none mb-10">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </div>

        {/* Ghana Cedi Example */}
        {lesson.ghs_example && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
            <h4 className="text-sm font-semibold text-amber-900 mb-1">
              Ghana Cedi Example
            </h4>
            <p className="text-amber-800 text-sm">{lesson.ghs_example}</p>
          </div>
        )}

        <div className="pt-6 border-t border-border flex justify-between items-center">
          <p className="text-sm text-text-secondary">
            {isCompleted
              ? "You have completed this lesson."
              : "Finished reading?"}
          </p>
          {isCompleted ? (
            <div className="flex items-center text-teal-600 font-medium">
              <CheckCircle2 className="h-5 w-5 mr-2" /> Completed
            </div>
          ) : (
            <Button onClick={handleComplete} isLoading={isSaving}>
              Mark as Complete <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
