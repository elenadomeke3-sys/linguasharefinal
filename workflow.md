# Developer - LinguaShare

## Workflow implementacji z użyciem AI
1. Akceptacja pliku planu (w `/docs/plans/PLAN_*.md`).
2. Prompt do agenta: *Załączam plan PLAN_XYZ.md. Zaimplementuj funkcjonalność wg specyfikacji z planu. Nie wychodź poza wytyczne.*
3. Agent dostarcza kod, dev sprawdza pokrycie testowe (jeśli wymagane).
4. Aktualizacja plików `implemented_plans.md` oraz `implemented_features.md`.