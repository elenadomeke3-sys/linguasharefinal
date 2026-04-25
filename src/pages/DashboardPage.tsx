import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Upload, Download, FileText, CreditCard, Plus, FolderOpen, Edit } from "lucide-react";
import { useUserStore } from "@/store";
import ProfileEditor from "@/components/ProfileEditor";
import { X } from "lucide-react";
import { Input } from "@/components/Input";

const MOCK_MATERIALS = [
  { id: "1", title: "Ćwiczenia na czas Present Perfect", language: "Angielski", level: "B1", downloads: 45, averageRating: 4.5 },
  { id: "2", title: "Fiszki - Słówka biznesowe", language: "Angielski", level: "B2", downloads: 128, averageRating: 4.8 },
];

const MOCK_COLLECTIONS = [
  { id: "1", name: "Gramatyka B1", materialsCount: 12 },
  { id: "2", name: "Biznesowy angielski", materialsCount: 8 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, getAvailableDownloads, upgradeToPremium, updateProfile } = useUserStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordStatus, setChangePasswordStatus] = useState("");

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Nie jesteś zalogowany</h2>
            <p className="text-muted-foreground mb-4">Zaloguj się, aby uzyskać dostęp do panelu.</p>
            <Button onClick={() => navigate("/")}>Przejdź do logowania</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const downloadsRemaining = getAvailableDownloads();
  const isPremium = user.isPremium;

  const handleProfileSave = (name: string, avatar: string) => {
    updateProfile({ name, avatar });
  };

  const handleChangePassword = () => {
    setChangePasswordStatus("");
    const success = updateProfile({ password: newPassword, oldPassword });
    if (success) {
      setChangePasswordStatus("success");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setShowChangePassword(false), 1500);
    } else {
      setChangePasswordStatus("error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-medium text-primary">{user.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Statystyki</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Upload className="h-4 w-4 text-primary" /></div>
                  <div><p className="text-2xl font-bold">{user.materialsUploaded}</p><p className="text-xs text-muted-foreground">Dodane materiały</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><Download className="h-4 w-4 text-green-600" /></div>
                  <div><p className="text-2xl font-bold">{user.credits + user.bonusDownloads}</p><p className="text-xs text-muted-foreground">Bonusy</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <Link to="/dashboard/upload"><Button variant="ghost" className="w-full justify-start"><Plus className="h-4 w-4 mr-2" />Dodaj materiał</Button></Link>
                <Link to="/dashboard"><Button variant="ghost" className="w-full justify-start"><FolderOpen className="h-4 w-4 mr-2" />Moje kolekcje</Button></Link>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowChangePassword(true)}><Edit className="h-4 w-4 mr-2" />Zmień hasło</Button>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={handleLogout}>Wyloguj</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">Witaj, {user.name.split(" ")[0]}!</h2>
                <p className="text-white/90 mb-4 font-medium">
                  {isPremium ? <span>Masz nieograniczony dostęp do wszystkich materiałów Premium! 🎉</span> : <span>Masz {downloadsRemaining} darmowych pobrań w tym miesiącu. Upgrade do Premium dla nieograniczonych pobrań!</span>}
                </p>
                <div className="flex gap-4">
                  <Link to="/materials"><Button variant="secondary">Przeglądaj materiały</Button></Link>
                  <Link to="/dashboard/upload"><Button variant="ghost" className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/20">Dodaj własny</Button></Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Moje materiały</CardTitle><CardDescription>Materiały które dodałeś</CardDescription></div>
                <Link to="/dashboard/upload"><Button size="sm"><Plus className="h-4 w-4 mr-2" />Dodaj</Button></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_MATERIALS.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4"><div className="w-12 h-12 bg-muted flex items-center justify-center rounded"><FileText className="h-6 w-6 text-muted-foreground" /></div>
                        <div><p className="font-medium">{m.title}</p><div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{m.language} {m.level}</span><span>⬇ {m.downloads}</span><span>⭐ {m.averageRating}</span></div></div>
                      </div>
                      <Button variant="ghost" size="sm">Edytuj</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Moje kolekcje</CardTitle><CardDescription>Twoje kolekcje materiałów</CardDescription></div>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Nowa</Button>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {MOCK_COLLECTIONS.map((c) => (
                    <div key={c.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"><p className="font-medium mb-1">{c.name}</p><p className="text-sm text-muted-foreground">{c.materialsCount} materiałów</p></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ProfileEditor isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} currentName={user.name} currentAvatar={user.avatar} onSave={handleProfileSave} />

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
