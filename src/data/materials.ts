export interface Material {
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

export const materials: Material[] = [
  {
    id: "1",
    title: "Ćwiczenia: Present Perfect vs Past Simple",
    description:
      "Zestaw ćwiczeń z gramatyki angielskiej dla średniozaawansowanych. Materiał zawiera 50 ćwiczeń z kluczem odpowiedzi, idealny do pracy w domu lub na lekcji.",
    language: "angielski",
    level: "B1",
    type: "WORKSHEET",
    tags: ["gramatyka", "czasowniki", "present-perfect"],
    isPremium: false,
    downloads: 45,
    createdAt: "2026-04-10",
    author: { name: "Marta Kowalska" },
    averageRating: 4.5,
    totalRatings: 12,
  },
  {
    id: "2",
    title: "Fiszki: 100 najważniejszych czasowników nieregularnych",
    description:
      "Pakiet fiszek z najważniejszymi czasownikami nieregularnymi w języku angielskim. Idealny do powtórek przed egzaminem lub na co dzień.",
    language: "angielski",
    level: "A2",
    type: "FLASHCARDS",
    tags: ["fiszki", "czasowniki", "nieregularne", "podstawy"],
    isPremium: true,
    downloads: 128,
    createdAt: "2026-04-05",
    author: { name: "Jan Nowak" },
    averageRating: 4.8,
    totalRatings: 24,
  },
  {
    id: "3",
    title: "Quiz: Czasowniki Phrasal (część 1)",
    description:
      "Interaktywny quiz sprawdzający znajomość czasowników phrasal. 20 pytań z automatycznym sprawdzaniem.",
    language: "angielski",
    level: "B2",
    type: "TEST",
    tags: ["quiz", "czasowniki phrasal", "test", "interaktywny"],
    isPremium: false,
    downloads: 67,
    createdAt: "2026-04-15",
    author: { name: "Anna Wiśniewska" },
    averageRating: 4.3,
    totalRatings: 15,
  },
  {
    id: "4",
    title: "Słownictwo: Podstawowe zwroty codzienności",
    description:
      "Kompletny zestaw najważniejszych zwrotów i wyrażeń używanych w codziennej komunikacji po angielsku.",
    language: "angielski",
    level: "A1",
    type: "LESSON_PLAN",
    tags: ["słownictwo", "zwroty", "codzienność", "podstawy"],
    isPremium: false,
    downloads: 234,
    createdAt: "2026-03-20",
    author: { name: "Piotr Kowalczyk" },
    averageRating: 4.7,
    totalRatings: 42,
  },
];

export function getMaterialById(id: string): Material | undefined {
  return materials.find((m) => m.id === id);
}

export function updateMaterial(id: string, updates: Partial<Material>): boolean {
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return false;
  materials[index] = { ...materials[index], ...updates };
  return true;
}

export function deleteMaterial(id: string): boolean {
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return false;
  materials.splice(index, 1);
  return true;
}