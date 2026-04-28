# Architekt Techniczny - LinguaShare

## Najważniejsze założenia
- **Single Source of Truth**: Wszystkie zmiany podążają za metodyką SDD (plany decydują o kodzie).
- **Integracje AI**: Budowane asynchronicznie (tzn. auto-tagging nie może blokować głównego interfejsu).

## ADR
- ADR-001: Użycie Zustand zamiast Reduxa do uproszczenia zarządzania stanem globalnym.
- ADR-002: Zastosowanie modelu "Give-to-Get" wymusza śledzenie operacji I/O każdego użytkownika.