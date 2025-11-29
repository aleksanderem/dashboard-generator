# Listy i tabele

Widgety do wyświetlania list, tabel i danych strukturalnych.

## SimpleTable

Responsywna tabela z nagłówkami.

**Min. kolumny:** 6 (50% szerokości)

### Props

```typescript
interface SimpleTableProps {
  title?: string;
  headers?: string[];      // Nagłówki kolumn
  rows?: (string | number)[][];  // Dane wierszy
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleTable
  title="Top Endpoints"
  headers={["Endpoint", "Requests", "Avg Time"]}
  rows={[
    ["/api/users", "12,450", "45ms"],
    ["/api/products", "8,230", "62ms"],
    ["/api/orders", "5,120", "78ms"]
  ]}
/>
```

### Cechy

- Automatyczne ukrywanie kolumn przy braku miejsca
- Automatyczne ukrywanie wierszy przy braku miejsca
- Scroll dla długich tabel
- Zebra striping (co drugi wiersz ciemniejszy)

---

## SimpleBadgeList

Lista elementów z kolorowymi badge'ami.

**Min. kolumny:** 3 (25% szerokości)

### Props

```typescript
interface SimpleBadgeListProps {
  title?: string;
  badges?: Badge[];
  skeleton?: SkeletonMode;
}

interface Badge {
  text: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';
}
```

### Przykład

```jsx
<SimpleBadgeList
  title="Status Tags"
  badges={[
    { text: "Active", color: "green" },
    { text: "Pending", color: "yellow" },
    { text: "Failed", color: "red" },
    { text: "Archived", color: "gray" }
  ]}
/>
```

### Kolory badge'ów

| Kolor | Tło | Tekst |
|-------|-----|-------|
| `green` | #D1FAE5 | #065F46 |
| `blue` | #DBEAFE | #1E40AF |
| `yellow` | #FEF3C7 | #92400E |
| `red` | #FEE2E2 | #991B1B |
| `purple` | #EDE9FE | #5B21B6 |
| `gray` | #F3F4F6 | #374151 |

---

## SimpleAgentList

Lista agentów/użytkowników ze statusem.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimpleAgentListProps {
  title?: string;
  agents?: Agent[];
  skeleton?: SkeletonMode;
}

interface Agent {
  name: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  avatar?: string;  // URL avatara
}
```

### Przykład

```jsx
<SimpleAgentList
  title="Support Team"
  agents={[
    { name: "John Doe", status: "online" },
    { name: "Jane Smith", status: "busy" },
    { name: "Bob Wilson", status: "offline" }
  ]}
/>
```

### Statusy

| Status | Kolor | Opis |
|--------|-------|------|
| `online` | Zielony | Dostępny |
| `offline` | Szary | Niedostępny |
| `busy` | Czerwony | Zajęty |
| `away` | Żółty | Nieobecny |

---

## SimpleStatusList

Lista elementów ze wskaźnikami statusu.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimpleStatusListProps {
  title?: string;
  items?: StatusItem[];
  skeleton?: SkeletonMode;
}

interface StatusItem {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  description?: string;
}
```

### Przykład

```jsx
<SimpleStatusList
  title="Service Health"
  items={[
    { label: "Web Server", status: "success", description: "Running" },
    { label: "Database", status: "warning", description: "High load" },
    { label: "Cache", status: "error", description: "Connection failed" },
    { label: "Queue", status: "pending", description: "Starting..." }
  ]}
/>
```

---

## SimplePriorityList

Lista z oznaczeniem priorytetu.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimplePriorityListProps {
  title?: string;
  items?: PriorityItem[];
  skeleton?: SkeletonMode;
}

interface PriorityItem {
  label: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
}
```

### Przykład

```jsx
<SimplePriorityList
  title="Open Tickets"
  items={[
    { label: "Server down", priority: "critical" },
    { label: "Login issues", priority: "high" },
    { label: "UI bug", priority: "medium" },
    { label: "Feature request", priority: "low" }
  ]}
/>
```

### Kolory priorytetów

| Priorytet | Kolor |
|-----------|-------|
| `critical` | Czerwony (#EF4444) |
| `high` | Pomarańczowy (#F97316) |
| `medium` | Żółty (#EAB308) |
| `low` | Szary (#6B7280) |

---

## SimpleRecentList

Lista ostatnich zdarzeń z timestampami.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimpleRecentListProps {
  title?: string;
  items?: RecentItem[];
  skeleton?: SkeletonMode;
}

interface RecentItem {
  text: string;
  time: string;  // Relatywny czas lub timestamp
  icon?: 'user' | 'system' | 'alert' | 'success';
}
```

### Przykład

```jsx
<SimpleRecentList
  title="Recent Activity"
  items={[
    { text: "User logged in", time: "2 min ago", icon: "user" },
    { text: "Backup completed", time: "15 min ago", icon: "success" },
    { text: "CPU spike detected", time: "1 hour ago", icon: "alert" }
  ]}
/>
```

---

## SimpleTimelineCard

Oś czasu z wydarzeniami.

**Min. kolumny:** 4 (33.33% szerokości)
**availableInRandom:** false (domyślnie wyłączony w generatorze)

### Props

```typescript
interface SimpleTimelineCardProps {
  title?: string;
  events?: TimelineEvent[];
  skeleton?: SkeletonMode;
}

interface TimelineEvent {
  time: string;
  text: string;
  status?: 'completed' | 'current' | 'pending';
}
```

### Przykład

```jsx
<SimpleTimelineCard
  title="Deployment Progress"
  events={[
    { time: "10:00", text: "Build started", status: "completed" },
    { time: "10:15", text: "Tests running", status: "current" },
    { time: "10:30", text: "Deploy to staging", status: "pending" },
    { time: "11:00", text: "Production release", status: "pending" }
  ]}
/>
```

### Wizualizacja

```
│ ● 10:00 - Build started
│ ○ 10:15 - Tests running (aktywne)
│ ○ 10:30 - Deploy to staging
│ ○ 11:00 - Production release
```

---

## SimpleCategoryCards

Siatka kart kategorii.

**Min. kolumny:** 6 (50% szerokości)

### Props

```typescript
interface SimpleCategoryCardsProps {
  title?: string;
  categories?: Category[];
  skeleton?: SkeletonMode;
}

interface Category {
  name: string;
  value: string | number;
  icon?: string;
  color?: string;
}
```

### Przykład

```jsx
<SimpleCategoryCards
  title="Resource Usage"
  categories={[
    { name: "CPU", value: "45%", color: "#10B981" },
    { name: "Memory", value: "72%", color: "#F59E0B" },
    { name: "Disk", value: "58%", color: "#3B82F6" },
    { name: "Network", value: "23%", color: "#8B5CF6" }
  ]}
/>
```

### Cechy

- Responsywna siatka (2-4 kolumny)
- Indywidualne kolory dla każdej kategorii
- Kompaktowe karty

---

## Wspólne cechy

### Overflow handling

Wszystkie listy obsługują przepełnienie:

```jsx
<div className="overflow-y-auto max-h-full">
  {items.map(item => <ListItem key={item.id} {...item} />)}
</div>
```

### Empty states

Gdy brak danych:

```jsx
{items.length === 0 && (
  <div className="text-gray-400 text-center py-4">
    No data available
  </div>
)}
```

### Skeleton loading

W trybie `skeleton="full"`:
- Pokazywane są placeholder wiersze
- Zachowana jest struktura listy
- Animacja shimmer
