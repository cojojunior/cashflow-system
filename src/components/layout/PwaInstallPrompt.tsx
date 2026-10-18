import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-navy-900 text-white p-3 flex items-center justify-between sm:hidden animate-in slide-in-from-top">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Download className="h-4 w-4 text-teal-400" />
        Install CashFlow App
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handleInstall}>
          Install
        </Button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-navy-300 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
