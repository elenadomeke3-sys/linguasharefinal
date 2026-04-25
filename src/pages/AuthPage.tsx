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
import { Loader2, User, Camera } from "lucide-react";
import { useUserStore } from "@/store";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login: storeLogin, isAuthenticated } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) return;
    setIsLoading(true);
    storeLogin(loginData.email, loginData.email.split("@")[0]);
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
     e.preventDefault();
     if (!registerData.name || !registerData.email || !registerData.password) return;
     setIsLoading(true);
     storeLogin(registerData.email, registerData.name, registerData.avatar);
     setTimeout(() => navigate("/dashboard"), 1000);
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
            <CardTitle>{isLogin ? "Logowanie" : "Rejestracja"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Wprowadź dane aby się zalogować"
                : "Utwórz konto aby dodawać i pobierać materiały"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLogin ? (
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
      </div>
    </div>
  );
}
