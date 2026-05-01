import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Upload, Download, FileText, CreditCard, Plus, FolderOpen, Edit } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import ProfileEditor from "@/components/ProfileEditor";
import { X } from "lucide-react";
import { Input } from "@/components/Input";
import { Material } from "@/data/materials";
import { useCollectionStore } from "@/store/collectionStore";
import { Collection } from "@/data/materials";

function formatDownloads(count: number): string {
  if (count === 1) return "1 pobranie";
  if (count >= 2 && count <= 4) return `${count} pobrania`;
  return `${count} pobrań`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { collections, fetchCollections } = useCollectionStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordStatus, setChangePasswordStatus] = useState("");
  const [myMaterials, setMyMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchMaterials = async () => {
        const { data } = await supabase.from('materials').select('*').eq('author_id', user.id).order('created_at', { ascending: false });
        if (data) setMyMaterials(data);
        setIsLoadingMaterials(false);
      };
      fetchMaterials();
      fetchCollections(user.id);
    }
  }, [user, fetchCollections]);

  if (!user) {
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

  const userName = user.user_metadata?.full_name || "Użytkownik";
  const userAvatar = user.user_metadata?.avatar_url || "";
  const userEmail = user.email || "";
  const isPremium = user.user_metadata?.is_premium || false;
  const downloadsRemaining = 3; // MVP limit mock
  const materialsUploaded = myMaterials.length;
  const userCredits = 0; // MVP mock

  const upgradeToPremium = () => alert("Integracja Stripe wkrótce!");

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

  return (
    <div className="bg-muted/20 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Link to="/profile">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-medium text-primary">{userName[0]}</span>
                      )}
                    </div>
                  </Link>
                   <div>
                     <p className="font-medium break-words">{userName}</p>
                     <p className="text-sm text-muted-foreground break-words">{userEmail}</p>
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
                  <div><p className="text-2xl font-bold">{materialsUploaded}</p><p className="text-xs text-muted-foreground">Dodane materiały</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><Download className="h-4 w-4 text-green-600" /></div>
                  <div><p className="text-2xl font-bold">{userCredits}</p><p className="text-xs text-muted-foreground">Bonusy</p></div>
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
                <h2 className="text-2xl font-bold mb-2">Witaj, {userName.split(" ")[0]}!</h2>
                <p className="text-white/90 mb-4 font-medium">
                  {isPremium ? <span>Masz nieograniczony dostęp do wszystkich materiałów Premium! 🎉</span> : <span>Masz {formatDownloads(downloadsRemaining)} w tym miesiącu. Zaktualizuj do Premium dla nieograniczonych pobrań!</span>}
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
                   {isLoadingMaterials ? (
                     <p className="text-sm text-muted-foreground">Ładowanie materiałów...</p>
                   ) : myMaterials.length === 0 ? (
                     <p className="text-sm text-muted-foreground">Nie dodałeś jeszcze żadnych materiałów.</p>
                   ) : myMaterials.map((m) => (
                     <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <Link to={`/materials/${m.id}`} className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-muted flex items-center justify-center rounded"><FileText className="h-6 w-6 text-muted-foreground" /></div>
                        <div><p className="font-medium">{m.title}</p><div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{m.language} {m.level}</span><span>⬇ {m.downloads}</span><span>⭐ {m.average_rating}</span></div></div>
                      </Link>
                      <Button variant="ghost" size="sm">Edytuj</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Moje kolekcje</CardTitle><CardDescription>Zbiory materiałów</CardDescription></div>
                <Button size="sm" onClick={() => navigate("/collections")}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Zarządzaj
                </Button>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <div className="text-center py-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">Brak kolekcji</p>
                    <Button size="sm" onClick={() => navigate("/collections")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Stwórz kolekcję
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {collections.slice(0, 4).map((c: Collection) => (
                      <div key={c.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate("/collections")}>
                        <p className="font-medium mb-1">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.material_count} materiałów</p>
                      </div>
                    ))}
                    {collections.length > 4 && (
                      <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer flex items-center justify-center" onClick={() => navigate("/collections")}>
                        <p className="text-sm text-muted-foreground">Zobacz wszystkie...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
