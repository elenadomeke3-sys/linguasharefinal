import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
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
  MessageSquare,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store";
import { useReviewStore } from "@/store";
import { Material } from "@/data/materials";
import { supabase } from "@/lib/supabase";

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

const typeLabels: Record<string, string> = {
  WORKSHEET: "Arkusz ćwiczeń",
  FLASHCARDS: "Fiszki",
  LESSON_PLAN: "Scenariusz lekcji",
  TEST: "Test",
};

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getAvailableDownloads } = useUserStore();
  const { reviews, fetchReviews, submitReview, updateReview, deleteReview, error: reviewError } = useReviewStore();
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isEditingMaterial, setIsEditingMaterial] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    language: "",
    level: "",
    type: "",
    tags: "",
    isPremium: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  function formatDownloads(count: number): string {
    if (count === 1) return "1 pobranie";
    if (count >= 2 && count <= 4) return `${count} pobrania`;
    return `${count} pobrań`;
  }

  useEffect(() => {
    const fetchMaterial = async () => {
      setIsLoading(true);
      if (!id) {
        setMaterial(null);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        const normalizedMaterial: Material = {
          id: data.id,
          title: data.title,
          description: data.description || "",
          language: data.language,
          level: data.level,
          type: data.type,
          tags: data.tags || [],
          content: data.content,
          author_name: data.author_name || "Nieznany",
          downloads: data.downloads || 0,
          average_rating: data.average_rating || 0,
          total_ratings: data.total_ratings || 0,
          is_premium: data.is_premium || false,
          file_url: data.file_url || null,
          created_at: data.created_at,
        };
        setMaterial(normalizedMaterial);
      } else {
        setMaterial(null);
      }
      setIsLoading(false);
    };

    fetchMaterial();
  }, [id]);

  // Fetch reviews when material loads
  useEffect(() => {
    if (material?.id) {
      fetchReviews(material.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material?.id]);

  const handleDownload = () => {
    if (!user) {
      setDownloadError("Zaloguj się, aby pobierać materiały");
      return;
    }

    const isPremiumUser = user?.user_metadata?.is_premium || false;
    if (!material) return;

    if (material.is_premium && !isPremiumUser) {
      setDownloadError("Ten materiał jest dostępny tylko dla subskrybentów Premium");
      return;
    }

    if (!material.file_url) {
      setDownloadError("Plik jest niedostępny.");
      return;
    }

    window.open(material.file_url, '_blank');
    setDownloadError(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !material) return;

    await submitReview(material.id, userRating, comment);
    setUserRating(0);
    setComment("");
  };

  const handleEditReview = (reviewId: string, rating: number, commentText: string) => {
    setEditingReview(reviewId);
    setEditRating(rating);
    setEditComment(commentText || "");
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!material) return;
    await updateReview(reviewId, editRating, editComment);
    setEditingReview(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!material) return;
    if (confirm("Czy na pewno chcesz usunąć tę recenzję?")) {
      await deleteReview(reviewId, material.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleOpenEdit = () => {
    if (!material) return;
    setEditForm({
      title: material.title,
      description: material.description || "",
      language: material.language,
      level: material.level,
      type: material.type,
      tags: material.tags?.join(", ") || "",
      isPremium: material.is_premium,
    });
    setIsEditingMaterial(true);
  };

  const handleCloseEdit = () => {
    setIsEditingMaterial(false);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material || !user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('materials')
        .update({
          title: editForm.title,
          description: editForm.description,
          language: editForm.language,
          level: editForm.level,
          type: editForm.type,
          tags: editForm.tags ? editForm.tags.split(",").map((t) => t.trim()) : [],
          is_premium: editForm.isPremium,
        })
        .eq('id', material.id);

      if (error) throw error;

      // Refresh material data
      const { data } = await supabase
        .from('materials')
        .select('*')
        .eq('id', material.id)
        .single();

      if (data) {
        setMaterial({
          ...material,
          ...data,
        });
      }

      setIsEditingMaterial(false);
    } catch (error: any) {
      console.error('Update error:', error);
      alert("Błąd aktualizacji: " + error.message);
    } finally {
      setIsUpdating(false);
    }
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

  const displayAuthorName = material.author_name || "Nieznany";
  const displayAverageRating = material.average_rating ?? 0;
  const displayTotalRatings = material.total_ratings ?? 0;
  const displayDownloads = material.downloads ?? 0;
  const displayCreatedAt = material.created_at ? new Date(material.created_at).toLocaleDateString() : "-";
  const isPremium = material.is_premium;

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
                    {isPremium && (
                      <Badge className="bg-gradient-to-r from-primary to-purple-600">
                        Premium
                      </Badge>
                    )}
                    {user?.id === material.author_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={handleOpenEdit}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edytuj
                      </Button>
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
                  <div className="overflow-y-auto h-full text-sm text-muted-foreground break-words overflow-wrap:break-word">
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
                    <span className="font-medium">{displayAverageRating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {displayTotalRatings} ocen
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-medium">{displayDownloads}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">pobrań</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{displayCreatedAt}</span>
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
                  {displayAuthorName ? displayAuthorName[0] : "?"}
                </div>
                <div>
                  <p className="font-medium">{displayAuthorName}</p>
                  <p className="text-sm text-muted-foreground">
                    Twórca materiału
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recenzje ({material.total_ratings || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviewError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                  {reviewError}
                </div>
              )}

              {/* User's existing review (if any) */}
              {user && reviews[material.id]?.some(r => r.user_id === user.id) && (() => {
                const myReview = reviews[material.id]?.find(r => r.user_id === user.id);
                if (!myReview) return null;
                if (editingReview === myReview.id) {
                  return (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <h4 className="text-sm font-medium mb-3">Edytuj recenzję</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Nowa ocena</label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${star <= editRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {editRating}/5
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Komentarz</label>
                          <Textarea
                            placeholder="Edytuj komentarz..."
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => handleUpdateReview(myReview.id)}>
                            Zapisz zmiany
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCancelEdit}>
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Twoja recenzja</p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReview(myReview.id, myReview.rating, myReview.comment || "")}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edytuj
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(myReview.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Usuń
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= myReview.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    {myReview.comment && (
                      <p className="text-sm text-muted-foreground break-words">{myReview.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(myReview.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })()}

              {/* Review Form */}
              {user && (!reviews[material.id] || !reviews[material.id].find(r => r.user_id === user.id)) && (
                <form onSubmit={handleSubmitReview} className="space-y-4 border rounded-lg p-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Twoja ocena</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {userRating > 0 ? `${userRating}/5` : "Wybierz ocenę"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Komentarz (opcjonalnie)</label>
                    <Textarea
                      placeholder="Dodaj komentarz..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={userRating === 0 || !user}>
                    {userRating === 0 ? "Wybierz ocenę" : "Dodaj recenzję"}
                  </Button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Wszystkie recenzje</h4>
                {!reviews[material.id] || reviews[material.id].length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Brak recenzji. Bądź pierwszy!
                  </p>
                ) : (
                  reviews[material.id]?.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {review.user_name?.[0] || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.user_name || "Anonim"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                              {review.updated_at !== review.created_at && " (edytowano)"}
                            </p>
                          </div>
                        </div>
                        {review.user_id === user?.id && editingReview !== review.id && (
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditReview(review.id, review.rating, review.comment || "")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground break-words">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
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
              {user && !(user.user_metadata?.is_premium) && (
                <div className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded">
                  Pozostało {formatDownloads(getAvailableDownloads())} w tym miesiącu
                </div>
              )}

              {downloadError && (
                <div className="text-sm text-red-500 text-center py-2 bg-red-50 rounded">
                  {downloadError}
                </div>
              )}

              {isPremium && !(user?.user_metadata?.is_premium) ? (
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

      {/* Edit Material Modal */}
      {isEditingMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edytuj materiał</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCloseEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <form onSubmit={handleUpdateMaterial} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tytuł *</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opis</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Język *</label>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                      value={editForm.language}
                      onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                      required
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Poziom *</label>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                      required
                    >
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
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full"
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      required
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tagi (oddzielone przecinkami)</label>
                  <Input
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-premium"
                    checked={editForm.isPremium}
                    onChange={(e) => setEditForm({ ...editForm, isPremium: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="edit-premium" className="text-sm">
                    Materiał Premium (tylko dla subskrybentów)
                  </label>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Zapisywanie..." : "Zapisz zmiany"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseEdit}>
                    Anuluj
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}