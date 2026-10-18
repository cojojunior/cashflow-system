import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast"; // <-- Import
import { router } from "@/routes";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        {" "}
        {/* <-- Wrap */}
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
