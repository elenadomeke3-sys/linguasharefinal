import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Textarea } from "@/components/Textarea";
import {
  ArrowLeft,
  Download,
  Star,
  Clock,
  Globe,
  FileText,
  Loader2,
  Lock,
} from "lucide-react";
import { useUserStore } from "@/store";

interface Material {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  type: string;
  tags: string[];
  isPremium: boolean;
  downloads: number;
  createdAt: string;
  author: { name: string };
  averageRating: number;
  totalRatings: number;
}

const MOCK_MATERIAL: Material = {
  id: "1",
  title: "Ćwiczenia na czas Present Perfect",
  description:
    "Zestaw ćwiczeń z gramatyki angielskiej dla średniozaawansowanych. Materiał zawiera 50 ćwiczeń z kluczem odpowiedzi, idealny do pracy w domu lub na lekcji.",
  language: "Angielski",
  level: "B1",
  type: "WORKSHEET",
  tags: ["gramatyka", "czasowniki", "present-perfect"],
  isPremium: false,
  downloads: 45,
  createdAt: "2026-04-10",
  author: { name: "Marta Kowalska" },
  averageRating: 4.5,
  totalRatings: 12,
};

const typeLabels: Record<string, string> = {
  WORKSHEET: "Arkusz ćwiczeń",
  FLASHCARDS: "Fiszki",
  LESSON_PLAN: "Scenariusz lekcji",
  TEST: "Test",
};

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, recordDownload, getAvailableDownloads } = useUserStore();
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setMaterial(MOCK_MATERIAL);
      setIsLoading(false);
    }, 300);
  }, [id]);

  const handleDownload = () => {
    if (!isAuthenticated) {
      setDownloadError("Zaloguj się, aby pobierać materiały");
      return;
    }
    
    if (material?.isPremium && !user?.isPremium) {
      setDownloadError("Ten materiał jest dostępny tylko dla subskrybentów Premium");
      return;
    }
    
    const canDownloadResult = recordDownload(id || "");
    if (!canDownloadResult) {
      const available = getAvailableDownloads();
      setDownloadError(`Osiągnąłeś limit pobrań. Dostępne pobrania: ${available}. Zaktualizuj do Premium!`);
      return;
    }
    
    setDownloadError(null);
    alert("Pobieranie materiału...");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">
              Materiał nie znaleziony
            </h3>
            <Button onClick={() => navigate("/materials")}>
              Wróć do katalogu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Wróć
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-muted flex-shrink-0 flex items-center justify-center rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{material.language}</Badge>
                    <Badge variant="secondary">{material.level}</Badge>
                    <Badge variant="outline">{typeLabels[material.type]}</Badge>
                    {material.isPremium && (
                      <Badge className="bg-gradient-to-r from-primary to-purple-600">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold">{material.title}</h1>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {material.description}
              </p>

              {/* Preview */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Podgląd materiału</p>
                <div className="relative h-64 bg-muted rounded-lg overflow-hidden border">
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground/70 font-medium">
                        Podgląd dostępny po pobraniu
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        Pobierz materiał aby zobaczyć pełną wersję
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="blur-[2px] opacity-40 select-none pointer-events-none">
                      <div className="text-xs space-y-2 text-muted-foreground">
                        <div className="h-2 w-full bg-gray-300 rounded" />
                        <div className="h-2 w-4/5 bg-gray-300 rounded" />
                        <div className="h-2 w-3/5 bg-gray-300 rounded" />
                        <div className="h-2 w-full bg-gray-300 rounded" />
                        <div className="h-2 w-2/3 bg-gray-300 rounded" />
                        <div className="h-2 w-4/5 bg-gray-300 rounded" />
                        <div className="h-2 w-full bg-gray-300 rounded" />
                        <div className="h-2 w-3/4 bg-gray-300 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {material.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {material.averageRating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {material.totalRatings} ocen
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-medium">{material.downloads}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">pobrań</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{material.createdAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">dodano</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">{material.language}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">język</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Autor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium">{material.author.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{material.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Twórca materiału
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Oceń materiał</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Komentarz (opcjonalnie)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button disabled={userRating === 0}>Wyślij ocenę</Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Pobierz materiał</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated && !user?.isPremium && (
                <div className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded">
                  Pozostało {getAvailableDownloads()} pobrań w tym miesiącu
                </div>
              )}
              
              {downloadError && (
                <div className="text-sm text-red-500 text-center py-2 bg-red-50 rounded">
                  {downloadError}
                </div>
              )}
              
              {material?.isPremium && !user?.isPremium ? (
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => navigate("/pricing")}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Premium
                </Button>
              ) : (
                <Button className="w-full" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Pobierz materiał
                </Button>
              )}
              
              <p className="text-xs text-center text-muted-foreground">
                Format: PDF, DOCX
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
