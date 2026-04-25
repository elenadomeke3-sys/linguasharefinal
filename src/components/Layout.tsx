import { Outlet, Link, useNavigate } from "react-router-dom";
import { BookOpen, User, LogOut, Plus } from "lucide-react";
import { Button } from "./Button";
import { useUserStore } from "@/store";

export default function Layout() {
  const { user, isAuthenticated, logout, getAvailableDownloads } = useUserStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">LinguaShare</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/materials"
              className="text-sm font-medium hover:text-primary"
            >
              Katalog
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium hover:text-primary"
            >
              Cennik
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium hover:text-primary"
            >
              O mnie
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
              <Link to="/profile">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-full hover:bg-muted/70 transition-colors cursor-pointer">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.isPremium ? "Premium" : `${getAvailableDownloads()} pobrań`}
                    </p>
                  </div>
                </div>
              </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Dodaj
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Zaloguj / Zarejestruj się</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold">LinguaShare</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Platforma dla korepetytorów językowych.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/materials" className="hover:text-primary">
                    Katalog
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-primary">
                    Cennik
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Wsparcie</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/faq" className="hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Kontakt</h4>
              <p className="text-sm text-muted-foreground">
                kontakt@linguashare.pl
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 LinguaShare. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}
