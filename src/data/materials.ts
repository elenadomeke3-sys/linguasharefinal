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
  content?: string;
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
    content: `# Ćwiczenia: Present Perfect vs Past Simple

## Cel
Porownanie i roznicowanie uzycia Present Perfect oraz Past Simple.

## Zasady
Past Simple: dla czynności zakończonych w przeszłości.
Present Perfect: dla czynności zwiazanych z teraźniejszoscia.

## Przyklady

### Past Simple
- I finished my homework yesterday.
- She went to London last year.

### Present Perfect
- I have finished my homework.
- She has been to London.

## Klucz odpowiedzi
1. saw / has just finished
2. I went to the shop yesterday. / I do not have lunch yet.`,
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
    content: `# Fiszki: 100 najważniejszych czasowników nieregularnych

## Spis treści
1. be - was/were - been - być
2. have - had - had - mieć
3. do - did - done - robić
4. say - said - said - mówić
5. go - went - gone - iść
6. get - got - got - dostać
7. make - made - made - zrobić
8. know - knew - known - wiedzieć
9. think - thought - thought - myśleć
10. take - took - taken - brać

... i tak dalej do 100!

## Przykłady użycia
- I have been to London. (Byłem w Londynie.)
- She went home early. (Poszła wcześniej do domu.)
- They have made dinner. (Zróbili kolację.)`,
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
    content: `# Quiz: Czasowniki Phrasal (część 1)

## Pytanie 1
Znaczenie "look up" to:
A) Patrzeć w dół
B) Szukać (w słowniku)
C) Podnieść

## Pytanie 2
Znaczenie "give up" to:
A) Dać w górę / Poddać się
B) Dać pocisk
C) Wysłać list

## Pytanie 3
Znaczenie "turn on" to:
A) Obrócić na... 
B) Włączyć
C) Zakończyć

## Odpowiedzi
1-B, 2-A, 3-B

## Więcej informacji
Czasowniki phrasal składają się z czasownika i przysłowka. Znaczenie często nie jest dosłowne!`,
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
    content: `# Słownictwo: Podstawowe zwroty codzienności

## Powitania i pożegnania
- Hello / Hi - Cześć
- Good morning - Dzień dobry (rano)
- Good evening - Dobry wieczór
- Goodbye / Bye - Do widzenia
- See you later - Do zobaczenia później

## Podstawowe zwroty
- How are you? - Jak się masz?
- I'm fine, thanks - Jestem dobrze, dziękuję
- Please - Proszę
- Thank you / Thanks - Dziękuję
- You're welcome - Nie ma za co
- Excuse me - Przepraszam
- I'm sorry - Przepraszam

## Pytania pomocnicze
- Can you help me? - Czy możesz mi pomóc?
- Where is...? - Gdzie jest...?
- How much is it? - Ile to kosztuje?
- What time is it? - Która jest godzina?

## Restauracja
- I'd like... - Poproszę...
- Check, please - Rachunek, proszę
- The bill, please - Rachunek, proszę`,
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
