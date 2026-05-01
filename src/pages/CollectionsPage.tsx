import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { 
  FolderPlus, 
  Folder, 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  Lock,
  BookOpen,
  Loader2,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCollectionStore } from "@/store/collectionStore";
import { Collection } from "@/data/materials";

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    collections,
    collectionMaterials,
    isLoading,
    error,
    fetchCollections,
    fetchCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    fetchCollectionMaterials,
    removeMaterialFromCollection,
    clearError
  } = useCollectionStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: false
  });

  useEffect(() => {
    if (user) {
      fetchCollections(user.id);
    }
  }, [user, fetchCollections]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    const newCollection = await createCollection({
      name: formData.name,
      description: formData.description || null,
      user_id: user.id,
      is_public: formData.is_public
    });

    if (newCollection) {
      setShowCreateModal(false);
      setFormData({ name: "", description: "", is_public: false });
    }
  };

  const handleEditCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollection || !formData.name) return;

    await updateCollection(selectedCollection.id, {
      name: formData.name,
      description: formData.description || null,
      is_public: formData.is_public
    });

    setShowEditModal(false);
    setSelectedCollection(null);
    setFormData({ name: "", description: "", is_public: false });
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (confirm(`Czy na pewno chcesz usunąć kolekcję "${collection.name}"?`)) {
      await deleteCollection(collection.id);
    }
  };

  const openEditModal = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      is_public: collection.is_public
    });
    setShowEditModal(true);
  };

  const openCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    fetchCollection(collection.id);
    fetchCollectionMaterials(collection.id);
  };

  const closeCollection = () => {
    setSelectedCollection(null);
    // collectionMaterials will be cleared by the store when needed
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Nie jesteś zalogowany</h2>
            <p className="text-muted-foreground mb-4">Zaloguj się, aby zarządzać kolekcjami.</p>
            <Button onClick={() => navigate("/auth")}>Przejdź do logowania</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCollection) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={closeCollection}>
                  <X className="h-4 w-4 mr-2" />
                  Wróć
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">{selectedCollection.name}</h1>
                  <p className="text-muted-foreground">
                    {selectedCollection.description || "Brak opisu"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedCollection.is_public ? (
                  <Badge variant="secondary">
                    <Globe className="h-3 w-3 mr-1" />
                    Publiczna
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Prywatna
                  </Badge>
                )}
                <Badge>{selectedCollection.material_count} materiałów</Badge>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : collectionMaterials.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Pusta kolekcja</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj materiały do tej kolekcji, aby zacząć ją organizować.
                  </p>
                  <Button onClick={() => navigate("/materials")}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Przeglądaj materiały
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {collectionMaterials.map((cm) => (
                  <Card key={cm.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{cm.material?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cm.material?.language} • {cm.material?.level} • {cm.material?.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dodano: {new Date(cm.added_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/materials/${cm.material_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterialFromCollection(selectedCollection.id, cm.material_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Moje Kolekcje</h1>
              <p className="text-muted-foreground">
                Organizuj materiały w tematyczne zbiory
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Nowa kolekcja
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : collections.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Brak kolekcji</h3>
                <p className="text-muted-foreground mb-4">
                  Stwórz swoją pierwszą kolekcję, aby zacząć organizować materiały.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Stwórz kolekcję
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Card key={collection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {collection.is_public ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {collection.description && (
                      <CardDescription>{collection.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{collection.material_count} materiałów</Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCollection(collection)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(collection)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCollection(collection)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create Collection Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>Nowa kolekcja</CardTitle>
                  <CardDescription>Stwórz kolekcję do organizacji materiałów</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCollection} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nazwa *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="np. Gramatyka angielska - B1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opis</label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Krótki opis kolekcji..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="public"
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="public" className="text-sm">
                        Kolekcja publiczna (widoczna dla innych)
                      </label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Tworzenie..." : "Stwórz kolekcję"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateModal(false);
                          setFormData({ name: "", description: "", is_public: false });
                        }}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Collection Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <CardTitle>Edytuj kolekcję</CardTitle>
                  <CardDescription>Zmień ustawienia kolekcji</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEditCollection} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nazwa *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="np. Gramatyka angielska - B1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opis</label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Krótki opis kolekcji..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="public-edit"
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="public-edit" className="text-sm">
                        Kolekcja publiczna (widoczna dla innych)
                      </label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedCollection(null);
                          setFormData({ name: "", description: "", is_public: false });
                        }}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
