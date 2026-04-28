import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import { Loader2, User, Camera, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginData.email || !loginData.password) return;
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    setIsLoading(false);

    if (error) {
      setError("Błąd logowania: Nieprawidłowy e-mail lub hasło.");
    } else {
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!registerData.name || !registerData.email || !registerData.password) return;
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          full_name: registerData.name,
          avatar_url: registerData.avatar,
        }
      }
    });

    setIsLoading(false);

    if (error) {
      setError("Błąd rejestracji: " + error.message);
    } else {
      // Automatyczne logowanie po rejestracji - Supabase powinien auto-login
      navigate("/dashboard");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegisterData({ ...registerData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginData.email) {
      setError("Proszę podać adres e-mail.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
    setIsLoading(false);

    if (error) {
      setError("Błąd: " + error.message);
    } else {
      setResetEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold">LinguaShare</span>
          </Link>
          <p className="text-muted-foreground">Zaloguj się lub utwórz konto</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isForgotPassword ? "Reset hasła" : isLogin ? "Logowanie" : "Rejestracja"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Podaj swój e-mail, aby otrzymać link do zresetowania hasła."
                : isLogin
                ? "Wprowadź dane aby się zalogować"
                : "Utwórz konto aby dodawać i pobierać materiały"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {isForgotPassword ? (
              resetEmailSent ? (
                <div className="text-center space-y-4 py-4">
                  <p className="text-green-600 font-medium">Link został wysłany!</p>
                  <p className="text-sm text-muted-foreground">Sprawdź swoją skrzynkę odbiorczą (oraz folder SPAM) i kliknij w link, aby zalogować się i ustawić nowe hasło.</p>
                  <Button variant="outline" className="w-full mt-4" onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); }}>
                    Wróć do logowania
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wysyłanie...</> : "Wyślij link resetujący"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>
                    Wróć do logowania
                  </Button>
                </form>
              )
            ) : isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Hasło"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Logowanie...
                    </>
                  ) : (
                    "Zaloguj się"
                  )}
                </Button>
                
                <div className="text-center mt-2">
                  <button type="button" className="text-sm text-primary hover:underline" onClick={() => setIsForgotPassword(true)}>
                    Zapomniałeś hasła?
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {registerData.avatar ? (
                        <img 
                          src={registerData.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Imię i nazwisko"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Hasło"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Rejestracja...
                    </>
                  ) : (
                    "Utwórz konto"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {!isForgotPassword && (
          <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <>
              <span className="text-muted-foreground">Nie masz konta? </span>
              <button
                className="text-primary hover:underline"
                onClick={() => setIsLogin(false)}
              >
                Zarejestruj się
              </button>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Masz już konto? </span>
              <button
                className="text-primary hover:underline"
                onClick={() => setIsLogin(true)}
              >
                Zaloguj się
              </button>
            </>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
