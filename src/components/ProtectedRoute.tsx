import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  // Pokazujemy ekran ładowania, dopóki Supabase nie zweryfikuje sesji
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jeśli użytkownik nie jest zalogowany, odsyłamy go do formularza
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Jeśli wszystko jest OK, przepuszczamy go dalej
  return <Outlet />;
}