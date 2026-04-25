import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Search, Download, Grid, List, Loader2, BookOpen } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description?: string;
  language: string;
  level: string;
  type: string;
  isPremium: boolean;
  downloads: number;
  averageRating: number;
  totalRatings: number;
}

const LANGUAGES = [
  { value: "", label: "Wszystkie języki" },
  { value: "angielski", label: "Angielski" },
  { value: "niemiecki", label: "Niemiecki" },
  { value: "francuski", label: "Francuski" },
  { value: "hiszpanski", label: "Hiszpański" },
  { value: "włoski", label: "Włoski" },
  { value: "rosyjski", label: "Rosyjski" },
];

const LEVELS = [
  { value: "", label: "Wszystkie poziomy" },
  { value: "A1", label: "A1 - Początkujący" },
  { value: "A2", label: "A2 - Podstawowy" },
  { value: "B1", label: "B1 - Średniozaawansowany" },
  { value: "B2", label: "B2 - Średniozaawansowany+" },
  { value: "C1", label: "C1 - Zaawansowany" },
  { value: "C2", label: "C2 - Biegły" },
];

const TYPES = [
  { value: "", label: "Wszystkie typy" },
  { value: "FLASHCARDS", label: "Słówka / Fiszki" },
  { value: "WORKSHEET", label: "Ćwiczenia" },
  { value: "TEST", label: "Testy" },
  { value: "LESSON_PLAN", label: "Scenariusze lekcji" },
  { value: "EXAM", label: "Sprawdziany" },
  { value: "PRESENTATION", label: "Prezentacje" },
];

const MOCK_MATERIALS: Material[] = [
  // Angielski (4)
  {
    id: "1",
    title: "Ćwiczenia na czas Present Perfect",
    description: "50 ćwiczeń z gramatyki angielskiej z kluczem odpowiedzi",
    language: "Angielski",
    level: "B1",
    type: "TEST",
    isPremium: false,
    downloads: 156,
    averageRating: 4.5,
    totalRatings: 32,
  },
  {
    id: "2",
    title: "Fiszki - Słówka biznesowe B2",
    description: "100 fiszek do nauki języka biznesowego",
    language: "Angielski",
    level: "B2",
    type: "FLASHCARDS",
    isPremium: false,
    downloads: 228,
    averageRating: 4.8,
    totalRatings: 54,
  },
  {
    id: "3",
    title: "Test diagnostyczny A1-A2",
    description: "Test sprawdzający znajomość poziomu podstawowego",
    language: "Angielski",
    level: "A2",
    type: "TEST",
    isPremium: false,
    downloads: 89,
    averageRating: 4.2,
    totalRatings: 18,
  },
  {
    id: "4",
    title: "Scenariusz lekcji: Cinema",
    description: "Gotowy scenariusz na 90 minut z filmem",
    language: "Angielski",
    level: "B1",
    type: "LESSON_PLAN",
    isPremium: false,
    downloads: 67,
    averageRating: 4.6,
    totalRatings: 12,
  },
  // Niemiecki (2)
  {
    id: "5",
    title: "Test diagnostyczny A2 - Niemiecki",
    description: "Test sprawdzający znajomość poziomu A2",
    language: "Niemiecki",
    level: "A2",
    type: "TEST",
    isPremium: false,
    downloads: 67,
    averageRating: 4.0,
    totalRatings: 15,
  },
  {
    id: "6",
    title: "Gramatyka niemiecka - deklinacja",
    description: "Ćwiczenia z przypadków (der, die, das)",
    language: "Niemiecki",
    level: "B1",
    type: "WORKSHEET",
    isPremium: false,
    downloads: 45,
    averageRating: 4.3,
    totalRatings: 8,
  },
  // Francuski (2)
  {
    id: "7",
    title: "Gramatyka francuska - passé composé",
    description: "Ćwiczenia z czasu przeszłego",
    language: "Francuski",
    level: "B1",
    type: "WORKSHEET",
    isPremium: false,
    downloads: 34,
    averageRating: 4.7,
    totalRatings: 9,
  },
  {
    id: "8",
    title: "Fiszki francuskie - verbs",
    description: "50 najważniejszych czasowników",
    language: "Francuski",
    level: "A1",
    type: "FLASHCARDS",
    isPremium: false,
    downloads: 56,
    averageRating: 4.5,
    totalRatings: 11,
  },
  // Hiszpański (2)
  {
    id: "9",
    title: "Ćwiczenia - ser vs estar",
    description: "Różnice w użyciu czasowników być",
    language: "Hiszpański",
    level: "A2",
    type: "WORKSHEET",
    isPremium: false,
    downloads: 78,
    averageRating: 4.6,
    totalRatings: 21,
  },
  {
    id: "10",
    title: "Test poziomu A1 - Hiszpański",
    description: "Test diagnozujący poziom początkujący",
    language: "Hiszpański",
    level: "A1",
    type: "TEST",
    isPremium: false,
    downloads: 42,
    averageRating: 4.4,
    totalRatings: 7,
  },
  // Włoski (2)
  {
    id: "11",
    title: "Gramatyka włoska - artigo",
    description: "Ćwiczenia z rodzajnika",
    language: "Włoski",
    level: "A1",
    type: "WORKSHEET",
    isPremium: false,
    downloads: 29,
    averageRating: 4.2,
    totalRatings: 5,
  },
  {
    id: "12",
    title: "Fiszki włoskie - básico",
    description: "100 podstawowych słów",
    language: "Włoski",
    level: "A1",
    type: "FLASHCARDS",
    isPremium: false,
    downloads: 38,
    averageRating: 4.5,
    totalRatings: 8,
  },
  // Rosyjski (2)
  {
    id: "13",
    title: "Test poziomu A1 - Rosyjski",
    description: "Test diagnozujący",
    language: "Rosyjski",
    level: "A1",
    type: "TEST",
    isPremium: false,
    downloads: 24,
    averageRating: 4.1,
    totalRatings: 4,
  },
  {
    id: "14",
    title: "Ćwiczenia z cyrylicy",
    description: "Nauka alfabetu rosyjskiego",
    language: "Rosyjski",
    level: "A1",
    type: "WORKSHEET",
    isPremium: false,
    downloads: 31,
    averageRating: 4.3,
    totalRatings: 6,
  },
  // Polski (2)
  {
    id: "15",
    title: "Test poziomu polskiego B1",
    description: "Test diagnozujący dla obcokrajowców",
    language: "Polski",
    level: "B1",
    type: "TEST",
    isPremium: false,
    downloads: 52,
    averageRating: 4.7,
    totalRatings: 14,
  },
  {
    id: "16",
    title: "Gramatyka polska - odmiana",
    description: "Ćwiczenia z odmiany rzeczowników",
    language: "Polski",
    level: "A2",
    type: "WORKSHEET",
    isPremium: false,
    downloads: 28,
    averageRating: 4.4,
    totalRatings: 5,
  },
];

export default function MaterialsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const search = searchParams.get("search") || "";
  const language = searchParams.get("language") || "";
  const level = searchParams.get("level") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const [premiumOnly, setPremiumOnly] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_MATERIALS];

      if (search) {
        filtered = filtered.filter((m) =>
          m.title.toLowerCase().includes(search.toLowerCase()),
        );
      }
      if (language) {
        filtered = filtered.filter(
          (m) => m.language.toLowerCase() === language,
        );
      }
      if (level) {
        filtered = filtered.filter((m) => m.level === level);
      }
       if (type) {
         filtered = filtered.filter((m) => m.type === type);
       }
       if (premiumOnly) {
         filtered = filtered.filter((m) => m.isPremium);
       }

       setMaterials(filtered);
      setIsLoading(false);
    }, 500);
  }, [search, language, level, type, premiumOnly, sort, page]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj materiałów..."
              className="pl-10"
              value={search}
              onChange={(e) => updateParams("search", e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
            value={language}
            onChange={(e) => updateParams("language", e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
            value={level}
            onChange={(e) => updateParams("level", e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
            value={type}
            onChange={(e) => updateParams("type", e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
           </select>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="premium-only"
              checked={premiumOnly}
              onChange={(e) => setPremiumOnly(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="premium-only" className="text-sm">
              Tylko Premium
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Znaleziono <span className="font-medium">{materials.length}</span>{" "}
            materiałów
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Materials Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Brak materiałów</h3>
          <Button onClick={() => setSearchParams({})}>Wyczyść filtry</Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materials.map((material) => (
            <Link key={material.id} to={`/materials/${material.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-muted relative flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  {material.isPremium && (
                    <Badge className="absolute top-2 right-2">Premium</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {material.language}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {material.level}
                    </Badge>
                  </div>
                  <h3 className="font-medium line-clamp-2 mb-2">
                    {material.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {material.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span>⭐ {material.averageRating}</span>
                      <span className="text-muted-foreground">
                        ({material.totalRatings})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span>{material.downloads}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((material) => (
            <Link key={material.id} to={`/materials/${material.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-24 bg-muted flex-shrink-0 flex items-center justify-center rounded-md">
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{material.language}</Badge>
                      <Badge variant="secondary">{material.level}</Badge>
                      {material.isPremium && <Badge>Premium</Badge>}
                    </div>
                    <h3 className="font-medium mb-1">{material.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {material.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
