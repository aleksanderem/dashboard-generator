# Szybki start

## 1. Logowanie

Aplikacja używa logowania opartego na emailu. Nie wymaga hasła - sesja jest powiązana z adresem email.

1. Wpisz swój adres email
2. Kliknij "Login"
3. Sesja zostanie zapisana w przeglądarce

## 2. Nawigacja

Główne widoki aplikacji:

| Zakładka | Opis |
|----------|------|
| **Create** | Tworzenie nowych dashboardów |
| **Saved** | Przeglądanie zapisanych dashboardów |
| **Upload** | Upload zrzutu ekranu do analizy |

Menu (hamburger po prawej):
- Dokumentacja
- Ustawienia globalne
- Wylogowanie

## 3. Tworzenie dashboardu

### Metoda 1: Layout Presets

1. Przejdź do zakładki "Create"
2. Wybierz layout z siatki presetów (np. "2+2", "3+3")
3. Dashboard zostanie wygenerowany automatycznie

### Metoda 2: Generate Random

1. Kliknij "Generate Random"
2. Wybierz liczbę widgetów
3. System użyje bin-packing do optymalnego rozmieszczenia

### Metoda 3: Upload Screenshot

1. Przejdź do zakładki "Upload"
2. Przeciągnij zrzut ekranu dashboardu lub kliknij aby wybrać plik
3. Claude Vision przeanalizuje obraz i wygeneruje uproszczoną wersję

## 4. Edycja dashboardu

### Zmiana motywu

1. Kliknij ikonę palety kolorów
2. Wybierz jeden z 7 motywów:
   - Teal (domyślny)
   - Blue, Purple, Orange, Green, Red, Gray

### Tryb edycji

1. Włącz "Edit Mode"
2. Przeciągaj widgety aby zmienić ich pozycję
3. Zmień rozmiar widgetów ciągnąc za róg

### Skeleton mode

1. Otwórz ustawienia Display
2. Wybierz tryb skeleton:
   - **Off** - normalne wyświetlanie
   - **Titles Only** - skeleton tylko na tytułach
   - **Full** - pełny skeleton

## 5. Zapisywanie

1. Kliknij "Save"
2. Podaj nazwę dashboardu
3. Opcjonalnie ustaw kategorię aplikacji
4. Dashboard zostanie zapisany z miniaturą

## 6. Eksport PNG

1. Otwórz dashboard
2. Kliknij ikonę eksportu (strzałka w dół)
3. Obraz PNG zostanie pobrany

## Przykładowy workflow

```
1. Login: jan@firma.pl
2. Create → Layout "3+3"
3. Zmień motyw na "Blue"
4. Włącz skeleton "Titles Only"
5. Save jako "Security Dashboard"
6. Export PNG
```

## Skróty i wskazówki

- **Double-click** na widget - edycja danych
- **Drag & drop** - zmiana pozycji (w Edit Mode)
- **Resize handle** - prawy dolny róg widgeta
- **Theme** - zmienia kolory wszystkich widgetów
- **Min Width** - ogranicza minimalną szerokość widgetów
