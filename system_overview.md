# Architektura Systemu - LinguaShare

## 1. Opis systemu
LinguaShare to aplikacja typu SPA (Single Page Application) zbudowana w architekturze React + Vite. Pełni rolę platformy marketplace dla nauczycieli i korepetytorów.

Docelowy model opiera się o:
- **Frontend:** React, React Router v6, Zustand (State), TailwindCSS, shadcn/ui.
- **Backend (w planach):** Supabase (PostgreSQL, Auth, Storage) / Next.js API.
- **Moduły AI (w planach):** GPT-4o / Claude 3.5 do Auto-Taggingu i Semantic Search.

## 2. Diagram powiązań (Wysoki poziom)

[ Użytkownik ] ---> [ Frontend React (Vercel) ]
                          |
                          v
             (W przyszłości: Supabase DB / Storage / AI Services)

Status MVP: Posiada logikę mockowaną w pamięci po stronie klienta (np. tablice obiektów) na potrzeby szybkiej iteracji w fazie testów.