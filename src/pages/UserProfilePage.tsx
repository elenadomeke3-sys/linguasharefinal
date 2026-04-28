import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { CreditCard, Edit, Download, Upload, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import ProfileEditor from "@/components/ProfileEditor";
import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/Input";
import { materials, updateMaterial, deleteMaterial } from "@/data/materials";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordStatus, setChangePasswordStatus] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Nie jesteś zalogowany</h2>
            <p className="text-muted-foreground mb-4">Zaloguj się, aby zobaczyć swój profil.</p>
            <Button onClick={() => navigate("/")}>Przejdź do logowania</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || "Użytkownik";
  const userAvatar = user.user_metadata?.avatar_url || "";
  const userEmail = user.email || "";
  const isPremium = user.user_metadata?.is_premium || false;
  const downloadsRemaining = 3; // Mock w wersji MVP
  const materialsUploaded = materials.filter(m => m.author.name === userName).length;
  const userCredits = 0; // Mock w wersji MVP

  const upgradeToPremium = () => alert("Integracja płatności Stripe pojawi się wkrótce!");
  const cancelPremium = () => alert("Integracja płatności Stripe pojawi się wkrótce!");

  const handleProfileSave = async (name: string, avatar: string) => {
    await supabase.auth.updateUser({
      data: { full_name: name, avatar_url: avatar }
    });
  };

  const handleChangePassword = async () => {
    setChangePasswordStatus("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setChangePasswordStatus("success");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setShowChangePassword(false), 1500);
    } else {
      setChangePasswordStatus("error");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  function formatDownloads(count: number): string {
    if (count === 1) return "1 pobranie";
    if (count >= 2 && count <= 4) return `${count} pobrania`;
    return `${count} pobrań`;
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-medium text-primary">{userName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge variant={isPremium ? "default" : "outline"}>{isPremium ? "Premium" : "Darmowy"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pobrania</span>
                    <span className="font-medium">{isPremium ? "∞" : `${downloadsRemaining} dostępne`}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditingProfile(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edytuj profil
                  </Button>
                  {!isPremium && (
                    <Button className="w-full mt-2" size="sm" onClick={upgradeToPremium}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Premium
                    </Button>
                  )}
                  {isPremium && (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                      if (confirm('Czy na pewno chcesz anulować subskrypcję Premium?')) {
                        cancelPremium();
                      }
                    }}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Anuluj subskrypcję
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Moje materiały
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowChangePassword(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Zmień hasło
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={handleLogout}>
                  Wyloguj
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Mój profil</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Informacje podstawowe</h3>
                    <div className="space-y-3">
                      <div><span className="text-muted-foreground">Imię i nazwisko:</span> <span className="font-medium">{userName}</span></div>
                      <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{userEmail}</span></div>
                      <div><span className="text-muted-foreground">Status:</span> <Badge variant={isPremium ? "default" : "outline"}>{isPremium ? "Premium" : "Darmowy"}</Badge></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Statystyki</h3>
                    <div className="space-y-3">
                      <div><span className="text-muted-foreground">Dodane materiały:</span> <span className="font-medium">{materialsUploaded}</span></div>
                      <div><span className="text-muted-foreground">Pobrania w tym miesiącu:</span> <span className="font-medium">{formatDownloads(downloadsRemaining)}</span></div>
                      <div><span className="text-muted-foreground">Zebrane bonusy:</span> <span className="font-medium">{userCredits}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ostatnie aktywności</CardTitle><CardDescription>Twoje ostatnie działania na platformie</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg"><Upload className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1"><p className="font-medium">Dodałeś nowy materiał</p><p className="text-sm text-muted-foreground">Przed chwilą</p></div>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg"><Download className="h-4 w-4 text-green-600" /></div>
                    <div className="flex-1"><p className="font-medium">Pobrałeś materiał</p><p className="text-sm text-muted-foreground">2 godziny temu</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Moje materiały</CardTitle><CardDescription>Zarządzaj swoimi dodanymi materiałami</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materials.filter(m => m.author.name === userName).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nie dodałeś jeszcze żadnych materiałów.</p>
              ) : (
                materials.filter(m => m.author.name === userName).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted flex items-center justify-center rounded"><FileText className="h-6 w-6 text-muted-foreground" /></div>
                      <div><p className="font-medium">{m.title}</p><p className="text-sm text-muted-foreground">{m.language} • {m.level}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { updateMaterial(m.id, { title: m.title + ' [EDYTOWANY]' }); }}>Edytuj</Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(confirm('Usunąć materiał?')) deleteMaterial(m.id); }}>Usuń</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <ProfileEditor isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} currentName={userName} currentAvatar={userAvatar} onSave={handleProfileSave} />

        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
              <button onClick={() => setShowChangePassword(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              <h3 className="text-lg font-medium mb-4">Zmień hasło</h3>
              <div className="space-y-4">
                <div><label className="text-sm font-medium mb-1 block">Stare hasło</label><Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Wprowadź obecne hasło" /></div>
                <div><label className="text-sm font-medium mb-1 block">Nowe hasło</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Wprowadź nowe hasło" /></div>
                {changePasswordStatus === "error" && <p className="text-sm text-red-500">Nieprawidłowe obecne hasło</p>}
                {changePasswordStatus === "success" && <p className="text-sm text-green-500">Hasło zmienione</p>}
                <div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1" onClick={() => setShowChangePassword(false)}>Anuluj</Button><Button className="flex-1" onClick={handleChangePassword} disabled={!newPassword}>Zmień</Button></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
