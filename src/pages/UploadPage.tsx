import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { materials } from "@/data/materials";

const LANGUAGES = [
  { value: "angielski", label: "Angielski" },
  { value: "niemiecki", label: "Niemiecki" },
  { value: "francuski", label: "Francuski" },
  { value: "hiszpanski", label: "Hiszpański" },
  { value: "włoski", label: "Włoski" },
  { value: "rosyjski", label: "Rosyjski" },
];

const LEVELS = [
  { value: "A1", label: "A1 - Początkujący" },
  { value: "A2", label: "A2 - Podstawowy" },
  { value: "B1", label: "B1 - Średniozaawansowany" },
  { value: "B2", label: "B2 - Średniozaawansowany+" },
  { value: "C1", label: "C1 - Zaawansowany" },
  { value: "C2", label: "C2 - Biegły" },
];

const TYPES = [
  { value: "FLASHCARDS", label: "Słówka / Fiszki" },
  { value: "WORKSHEET", label: "Ćwiczenia" },
  { value: "TEST", label: "Testy" },
  { value: "LESSON_PLAN", label: "Scenariusze lekcji" },
  { value: "EXAM", label: "Sprawdziany" },
  { value: "PRESENTATION", label: "Prezentacje" },
];

const LEVEL_PATTERNS: Record<string, string> = {
  a1: "A1", A1: "A1",
  a2: "A2", A2: "A2", 
  b1: "B1", B1: "B1",
  b2: "B2", B2: "B2",
  c1: "C1", C1: "C1",
  c2: "C2", C2: "C2",
};

const TYPE_PATTERNS: Record<string, string> = {
  worksheet: "WORKSHEET",
  "arkusz": "WORKSHEET",
  cwiczenia: "WORKSHEET",
  exercises: "WORKSHEET",
  flashcard: "FLASHCARDS",
  fiszki: "FLASHCARDS",
  "lesson plan": "LESSON_PLAN",
  scenariusz: "LESSON_PLAN",
  lekcja: "LESSON_PLAN",
  test: "TEST",
  quiz: "TEST",
  sprawdzian: "EXAM",
  egzamin: "EXAM",
  prezentacja: "PRESENTATION",
  slajdy: "PRESENTATION",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function autoDetectTags(title: string): { level: string; type: string; confidence: number } {
  const lower = title.toLowerCase();
  
  let detectedLevel = "";
  let detectedType = "";
  
  for (const [pattern, level] of Object.entries(LEVEL_PATTERNS)) {
    if (lower.includes(pattern.toLowerCase())) {
      detectedLevel = level;
      break;
    }
  }
  
  for (const [pattern, type] of Object.entries(TYPE_PATTERNS)) {
    if (lower.includes(pattern.toLowerCase())) {
      detectedType = type;
      break;
    }
  }
  
  const confidence = (detectedLevel ? 0.5 : 0) + (detectedType ? 0.3 : 0);
  
  return {
    level: detectedLevel,
    type: detectedType,
    confidence: Math.min(0.8, confidence),
  };
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    level: "",
    type: "",
    tags: "",
    isPremium: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({ name: file.name, size: file.size });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.language ||
      !formData.level ||
      !formData.type
    ) {
      alert("Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Tworzymy nowy materiał
      const now = new Date().toISOString().split('T')[0];
      const newMaterial = {
        id: generateId(),
        title: formData.title,
        description: formData.description || "Brak opisu",
        language: formData.language,
        level: formData.level,
        type: formData.type,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        isPremium: formData.isPremium,
        downloads: 0,
        createdAt: now,
        author: { name: "Użytkownik" },
        averageRating: 0,
        totalRatings: 0,
        // Zawartość materiału - domyślny tekst
        content: formData.description || "To jest przykładowa zawartość materiału. W rzeczywistej aplikacji znajdowałby się tu pełny dokument, ćwiczenia lub prezentacja do pobrania.",
      };

      // Dodajemy do bazy materiałów
      materials.push(newMaterial);

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => navigate("/materials"), 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sukces!</h2>
            <p className="text-muted-foreground">Twój materiał został dodany</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dodaj materiał</h1>
            <p className="text-muted-foreground">
              Udostępnij materiały dydaktyczne społeczności
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Plik materiału</CardTitle>
                <CardDescription>
                  Prześlij plik PDF, DOCX lub obraz (max. 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Przeciągnij plik lub kliknij aby wybrać
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <Button type="button" variant="outline">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Wybierz plik
                      </label>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Informacje o materiale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tytuł *</label>
                  <Input
                    placeholder="np. Ćwiczenia na czas Present Perfect"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Opis</label>
                  <Textarea
                    placeholder="Krótki opis materiału..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Język *</label>
                     <select
                       className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full truncate"
                       value={formData.language}
                       onChange={(e) =>
                         setFormData({ ...formData, language: e.target.value })
                       }
                       required
                     >
                       <option value="">Wybierz</option>
                       {LANGUAGES.map((l) => (
                         <option key={l.value} value={l.value}>
                           {l.label}
                         </option>
                       ))}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center justify-between mb-1">
                       <label className="text-sm font-medium truncate">Poziom *</label>
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="h-6 text-[10px] leading-tight text-muted-foreground whitespace-nowrap px-2 flex-shrink-0 ml-2"
                         onClick={() => {
                           if (!formData.title) {
                             alert("Najpierw wpisz tytuł materiału");
                             return;
                           }
                           setIsAutoTagging(true);
                           setTimeout(() => {
                             const tags = autoDetectTags(formData.title);
                             if (tags.level) {
                               setFormData((prev) => ({
                                 ...prev,
                                 level: tags.level,
                               }));
                             }
                             if (tags.type) {
                               setFormData((prev) => ({
                                 ...prev,
                                 type: tags.type,
                               }));
                             }
                             setIsAutoTagging(false);
                           }, 500);
                         }}
                         disabled={isAutoTagging}
                       >
                         {isAutoTagging ? (
                           <Loader2 className="h-3 w-3 animate-spin" />
                         ) : (
                           "Auto"
                         )}
                       </Button>
                     </div>
                     <select
                       className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full truncate"
                       value={formData.level}
                       onChange={(e) =>
                         setFormData({ ...formData, level: e.target.value })
                       }
                       required
                     >
                       <option value="">Wybierz</option>
                       {LEVELS.map((l) => (
                         <option key={l.value} value={l.value}>
                           {l.label}
                         </option>
                       ))}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-medium">Typ *</label>
                     <select
                       className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full truncate"
                       value={formData.type}
                       onChange={(e) =>
                         setFormData({ ...formData, type: e.target.value })
                       }
                       required
                     >
                       <option value="">Wybierz</option>
                       {TYPES.map((t) => (
                         <option key={t.value} value={t.value}>
                           {t.label}
                         </option>
                       ))}
                     </select>
                   </div>
                 </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tagi (oddzielone przecinkami)
                  </label>
                  <Input
                    placeholder="np. gramatyka, czasowniki, B1"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="premium"
                    checked={formData.isPremium}
                    onChange={(e) =>
                      setFormData({ ...formData, isPremium: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="premium" className="text-sm">
                    Materiał Premium (tylko dla subskrybentów)
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isLoading || !uploadedFile}>
                {isLoading ? "Publikuję..." : "Opublikuj materiał"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
