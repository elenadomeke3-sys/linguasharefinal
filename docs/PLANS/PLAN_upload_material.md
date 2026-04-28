# Upload materiału z podstawowym Auto-Taggingiem

## 1. Cel
Umożliwienie użytkownikom (nauczycielom) dodawania materiałów dydaktycznych do bazy LinguaShare za pomocą przyjaznego formularza, skracając czas przez automatyczne sugestie kategorii.

## 2. Zakres
Wchodzi w zakres: Strona z formularzem, upload plików na poziomie przeglądarki (odczyt metadanych pliku), wsparcie dla lokalnej symulacji tagowania na podstawie tytułu. 
Nie wchodzi w zakres: Połączenie z właściwym API AI OpenAI oraz wysyłanie binariów do bucketów storage'owych (wersja MVP).

## 3. Wymagania funkcjonalne
- Pole na upload pliku (max 10MB, obsługiwane formaty: pdf, doc, docx, img).
- Wymagane pola tekstowe: Tytuł, Język, Poziom, Typ materiału.
- Przycisk "Auto", który na podstawie tytułu analizuje (mock) i proponuje Poziom oraz Typ materiału.
- Checkbox oznaczający zasób jako Premium.
- Wyświetlenie ekranu sukcesu i przekierowanie po zapisie.

## 4. Wymagania niefunkcjonalne
- **Wydajność:** Analiza "Auto" powinna trwać krótko i w czytelny sposób komunikować ładowanie (spinner).
- **UX:** Responsywny design spójny z resztą platformy. Walidacja w locie i blokowanie przycisku "Opublikuj", jeśli brak pliku/pól.

## 5. Kontekst techniczny
- **Komponenty:** shadcn/ui (Button, Card, Input, Textarea), ikony z `lucide-react`.
- **Dane:** Zapis do lokalnej tablicy `materials` (z `src/data/materials.ts`).

## 6. Kroki implementacji
1. Stworzenie layoutu formularza w `UploadPage.tsx`.
2. Implementacja funkcji `handleFileChange` czytającej atrybuty pliku.
3. Budowa funkcji `autoDetectTags` do naiwnego parsowania tytułu po słowach kluczowych.
4. Opięcie formularza stanem `useState`.
5. Przygotowanie finalnego przycisku zapisu z symulacją opóźnienia sieciowego.

## 7. Kryteria akceptacji
- Dodanie tytułu "Test z gramatyki B2" i wciśnięcie "Auto" poprawnie dobiera pole Typ -> "Testy" oraz Poziom -> "B2".
- Użytkownik widzi wizualne potwiedzenie przesłania po kliknięciu wyślij.