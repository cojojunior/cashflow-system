import { PageHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your business and preferences."
      />
      <div className="rounded-xl bg-white border border-border p-10 text-center text-text-secondary text-sm">
        Settings sections will appear here.
      </div>
    </>
  );
}
