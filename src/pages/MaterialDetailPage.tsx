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
import { materials, getMaterialById } from "@/data/materials";

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
  const [material, setMaterial] = useState(materials[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function formatDownloads(count: number): string {
    if (count === 1) return "1 pobranie";
    if (count >= 2 && count <= 4) return `${count} pobrania`;
    return `${count} pobrań`;
  }

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundMaterial = getMaterialById(id || "");
      setMaterial(foundMaterial || materials[0]);
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
      setDownloadError(`Osiągnąłeś limit pobrań. Dostępne ${formatDownloads(available)}. Zaktualizuj do Premium!`);
      return;
    }
    
    // Generowanie i pobieranie pliku
    const content = material?.content || material?.description || "Brak treści";
    const fileName = `${material?.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    const fileContent = `# ${material?.title}\n\n**Autor:** ${material?.author.name}\n**Język:** ${material?.language}\n**Poziom:** ${material?.level}\n**Typ:** ${material?.type}\n**Data:** ${material?.createdAt}\n\n--\n\n${content}\n\n--\n\n*Pobrano z LinguaShare*`;
    
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadError(null);
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

              {/* Podgląd zawartości */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Treść materiału</p>
                <div className="relative h-64 bg-muted rounded-lg overflow-hidden border p-4">
                  <div className="overflow-y-auto h-full text-sm text-muted-foreground">
                    {material.content || material.description}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-muted/80 via-muted/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Przycisk pobierania */}
              <Button className="w-full mb-4" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Pobierz jako PDF/TXT
              </Button>

              <div className="flex flex-wrap gap-2 mb-6">
                {material.tags.map((tag: string) => (
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
                  Pozostało {formatDownloads(getAvailableDownloads())} w tym miesiącu
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
