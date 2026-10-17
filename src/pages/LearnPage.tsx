import { PageHeader } from "@/components/ui";

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Learn"
        description="Financial literacy for your business."
      />
      <div className="rounded-xl bg-white border border-border p-10 text-center text-text-secondary text-sm">
        Lessons and quizzes will appear here.
      </div>
    </>
  );
}
