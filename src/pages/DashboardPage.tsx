import { PageHeader } from "@/components/ui";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your business at a glance — building in Phase 4."
      />
      <div className="rounded-xl bg-white border border-border p-10 text-center text-text-secondary text-sm">
        Dashboard widgets will appear here.
      </div>
    </>
  );
}
