import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { AddTransactionSheet } from "./AddTransactionSheet";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    // h-screen and overflow-hidden force the layout to the viewport height
    <div className="h-screen bg-surface-muted flex overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar onMenuClick={() => {}} onAddClick={() => setAddOpen(true)} />
        {/* Only this <main> container scrolls */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav onAddClick={() => setAddOpen(true)} />
      <AddTransactionSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
