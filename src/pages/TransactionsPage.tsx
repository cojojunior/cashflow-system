import { PageHeader } from "@/components/ui";

export default function TransactionsPage() {
  return (
    <>
      <PageHeader
        title="Transactions"
        description="Income and expenses — building in Phase 3."
      />
      <div className="rounded-xl bg-white border border-border p-10 text-center text-text-secondary text-sm">
        Transaction list will appear here.
      </div>
    </>
  );
}
