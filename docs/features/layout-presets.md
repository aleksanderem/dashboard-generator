# Layout Presets

Dashboard Generator oferuje 12 predefiniowanych układów do szybkiego tworzenia dashboardów.

## Dostępne presety

### Symetryczne

#### 2+2 (4 widgety)

```
┌─────────────┬─────────────┐
│      1      │      2      │
├─────────────┼─────────────┤
│      3      │      4      │
└─────────────┴─────────────┘
```

- 2 rzędy po 2 widgety
- Każdy widget: 6 kolumn (50%)

#### 3+3 (6 widgetów)

```
┌────────┬────────┬────────┐
│   1    │   2    │   3    │
├────────┼────────┼────────┤
│   4    │   5    │   6    │
└────────┴────────┴────────┘
```

- 2 rzędy po 3 widgety
- Każdy widget: 4 kolumny (33.33%)

#### 4+4 (8 widgetów)

```
┌──────┬──────┬──────┬──────┐
│  1   │  2   │  3   │  4   │
├──────┼──────┼──────┼──────┤
│  5   │  6   │  7   │  8   │
└──────┴──────┴──────┴──────┘
```

- 2 rzędy po 4 widgety
- Każdy widget: 3 kolumny (25%)

### Asymetryczne

#### 3+1 (4 widgety)

```
┌────────┬────────┬────────┐
│   1    │   2    │   3    │
├────────┴────────┴────────┤
│            4             │
└──────────────────────────┘
```

- Górny rząd: 3 małe (4 kolumny każdy)
- Dolny rząd: 1 duży (12 kolumn)

#### 1+3 (4 widgety)

```
┌──────────────────────────┐
│            1             │
├────────┬────────┬────────┤
│   2    │   3    │   4    │
└────────┴────────┴────────┘
```

- Górny rząd: 1 duży (12 kolumn)
- Dolny rząd: 3 małe (4 kolumny każdy)

#### 4+2 (6 widgetów)

```
┌──────┬──────┬──────┬──────┐
│  1   │  2   │  3   │  4   │
├──────┴──────┼──────┴──────┤
│      5      │      6      │
└─────────────┴─────────────┘
```

- Górny rząd: 4 małe (3 kolumny)
- Dolny rząd: 2 średnie (6 kolumn)

#### 2+4 (6 widgetów)

```
┌─────────────┬─────────────┐
│      1      │      2      │
├──────┬──────┼──────┬──────┤
│  3   │  4   │  5   │  6   │
└──────┴──────┴──────┴──────┘
```

- Górny rząd: 2 średnie (6 kolumn)
- Dolny rząd: 4 małe (3 kolumny)

### Wielorzędowe

#### 2+3+2 (7 widgetów)

```
┌─────────────┬─────────────┐
│      1      │      2      │
├────────┬────┴────┬────────┤
│   3    │    4    │   5    │
├────────┴─────────┴────────┤
│      6      │      7      │
└─────────────┴─────────────┘
```

#### 1+2+1 (4 widgety)

```
┌──────────────────────────┐
│            1             │
├─────────────┬────────────┤
│      2      │      3     │
├─────────────┴────────────┤
│            4             │
└──────────────────────────┘
```

### Jednorzędowe

#### 3 (3 widgety)

```
┌────────┬────────┬────────┐
│   1    │   2    │   3    │
└────────┴────────┴────────┘
```

#### 4 (4 widgety)

```
┌──────┬──────┬──────┬──────┐
│  1   │  2   │  3   │  4   │
└──────┴──────┴──────┴──────┘
```

#### 6 (6 widgetów)

```
┌────┬────┬────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │
└────┴────┴────┴────┴────┴────┘
```

## Siatka 12-kolumnowa

Wszystkie layouty używają siatki 12-kolumnowej:

| Kolumny | Szerokość | Użycie |
|---------|-----------|--------|
| 2 | 16.67% | Bardzo małe widgety |
| 3 | 25% | Małe widgety (KPI) |
| 4 | 33.33% | Średnie widgety |
| 6 | 50% | Duże widgety (wykresy) |
| 12 | 100% | Pełna szerokość |

## Wysokość widgetów

Domyślna wysokość to 4 jednostki (rowHeight = 30px, więc 120px).

Może być modyfikowana przez:
- `minHeightSettings` w preferencjach
- Ręczną zmianę w trybie edycji

## Użycie presetów

### Przez interfejs

1. Przejdź do zakładki "Create"
2. Kliknij na wybrany preset
3. Dashboard zostanie wygenerowany

### Przez API

```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({
    preset: '3+3',
    minWidthCols: 2
  })
});

const { dashboard } = await response.json();
```

## Min Width Constraint

Parametr `minWidthCols` ogranicza minimalną szerokość widgetów:

| Wartość | Min. szerokość | Efekt |
|---------|----------------|-------|
| 1 | 1 kolumna | Brak ograniczenia |
| 2 | 6 kolumn (50%) | Max 2 widgety w rzędzie |
| 3 | 4 kolumny (33%) | Max 3 widgety w rzędzie |

Przykład z `minWidthCols: 2`:
- Preset "4+4" zostanie zmodyfikowany do "2+2+2+2"
- Każdy widget będzie miał min. 6 kolumn

## Bin-packing (alternatywa)

Zamiast presetów można użyć algorytmu bin-packing:

```javascript
const response = await fetch('/api/generate/packed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({
    widgetCount: 8
  })
});
```

Algorytm automatycznie:
- Dobiera szerokość widgetów
- Minimalizuje puste przestrzenie
- Respektuje `minColumns` z konfiguracji widgetów

## Dostosowywanie po wygenerowaniu

Po wygenerowaniu dashboardu można:

1. Włączyć **Edit Mode**
2. Przeciągać widgety na nowe pozycje
3. Zmieniać rozmiar ciągnąc za rogi
4. Zapisać zmodyfikowany layout
