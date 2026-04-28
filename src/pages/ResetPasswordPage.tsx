import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import { Loader2, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Czekamy na sprawdzenie sesji
  useEffect(() => {
    if (!authLoading && !user) {
      // Brak sesji — użytkownik nie zweryfikował emaila lub link wygasł
      setError("Link resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie.");
    }
  }, [authLoading, user]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setIsLoading(false);

    if (error) {
      setError("Błąd resetowania hasła: " + error.message);
    } else {
      setIsSuccess(true);
      // Wyloguj i przekieruj do logowania po 3 sekundach
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/auth");
      }, 3000);
    }
  };

  // Loading — czekamy na sprawdzenie sesji
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Weryfikacja linku...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Brak sesji → nieprawidłowy link
  if (!user && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nieprawidłowy lub wygasły link</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/auth")}>Wróć do logowania</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sukces
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Hasło zmienione!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Twoje hasło zostało pomyślnie zaktualizowane. Zostaniesz wylogowany i przekierowany do logowania.
            </p>
            <Button onClick={() => navigate("/auth")}>Przejdź do logowania</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formularz resetowania hasła (użytkownik zalogowany po weryfikacji tokena)
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Lock className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">LinguaShare</span>
          </Link>
          <p className="text-muted-foreground">Ustaw nowe hasło</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nowe hasło</CardTitle>
            <CardDescription>
              Wprowadź nowe hasło dla swojego konta.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nowe hasło</label>
                <Input
                  type="password"
                  placeholder="Min. 6 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Potwierdź hasło</label>
                <Input
                  type="password"
                  placeholder="Powtórz hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz nowe hasło"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Pamiętasz hasło?{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
