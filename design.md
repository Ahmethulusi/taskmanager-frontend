# TaskManager Frontend — Design System

Bu belge mevcut arayüzün görsel dilini tarif eder. Yeni sayfa veya bileşen eklerken buradaki token’lara, tipografi kurallarına ve TasksPage örüntülerine sadık kalın. Yeni renk/font uydurmayın.

Kaynak dosyalar: `src/index.css`, `src/components/layout/*`, `src/modules/tasks/**`, `src/components/ui/button.tsx`

---

## 1. Stack & UI kütüphanesi

| Katman | Seçim |
|--------|--------|
| Framework | React + TypeScript |
| Stil | Tailwind CSS v4 + CSS variables |
| Bileşenler | shadcn/ui (`style=base-vega`, Base UI) |
| İkonlar | lucide-react |
| Animasyon | `tw-animate-css` (`animate-in`, `fade-in-0`, …) |

Tema token’ları `src/index.css` içinde `:root` + `@theme inline` ile tanımlı. Tailwind sınıfları bu token’lara map edilir (`bg-primary`, `font-heading`, `bg-status-pending-bg`, …).

---

## 2. Tipografi

### Fontlar (Google Fonts — `index.html`)

| Token | Aile | Ağırlıklar | Tailwind |
|-------|------|------------|----------|
| `--font-display` | Roboto Slab | 500, 700 | `font-heading` |
| `--font-body` | Roboto | 400, 500 | `font-sans` (varsayılan gövde) |

```css
--font-display: "Roboto Slab", serif;
--font-body: "Roboto", sans-serif;
```

`@theme inline` eşlemesi:

- `--font-heading` → `--font-display`
- `--font-sans` → `--font-body`

### Nerede hangisi?

**`font-heading` (Roboto Slab):**

- Logo (“TaskManager”)
- Sidebar nav linkleri
- Sayfa başlığı (`PageHeader` h1)
- Buton metinleri (buttonVariants temeli)
- Görev kartı başlığı
- Sütun başlıkları (Bekliyor / Devam Ediyor / Tamamlandı)
- Dialog / Card başlıkları (`DialogTitle`, `CardTitle`, …)

**`font-body` / varsayılan (Roboto):**

- Filtre Select metinleri ve Label’lar
- Badge’ler
- Tarihler, e-posta, açıklama
- Form input’ları
- Avatar harfleri dışında kalan yardımcı metinler

### Tipografi ölçeği (güncel UI)

| Öğre | Sınıf |
|------|--------|
| PageHeader başlık | `text-2xl font-bold` |
| Logo | `text-lg font-bold` |
| Sidebar nav | `text-base` |
| Filtre label / Select | `text-base` |
| Sütun başlığı | `text-base font-medium` |
| Kart başlığı | `text-base font-medium` |
| Atanan kişi | `text-sm` |
| Badge | `text-sm` (kartlarda `h-6`) |
| Boş sütun / e-posta | `text-sm` / `text-xs` |

---

## 3. Renk token’ları

### Marka / primary

| Token | Değer | Kullanım |
|-------|--------|----------|
| `--primary` | `#C2410C` | Ana CTA, logo, aktif vurgu |
| `--primary-foreground` | `#FFFFFF` | Primary üzerindeki metin |
| `--ring` | `var(--primary)` | Focus ring (turuncu) |

### Durum (görev sütunları)

| Durum | Arka plan | Nokta / koyu ton |
|-------|-----------|------------------|
| Bekliyor (`pending`) | `--status-pending-bg: #FEFCE8` | `--status-pending-dot: #CA8A04` |
| Devam Ediyor (`in-progress`) | `--status-progress-bg: #FFF1E6` | `--status-progress-dot: #C2410C` |
| Tamamlandı (`done`) | `--status-done-bg: #F0FDF4` | `--status-done-dot: #16A34A` |

Tailwind: `bg-status-pending-bg`, `border-status-progress-dot/45`, `bg-status-done-dot`, …

### Sidebar

| Token | Değer | Anlam |
|-------|--------|--------|
| `--sidebar` | açık gri (`oklch(0.985…)`) | Sidebar zemini |
| `--sidebar-accent` | `var(--status-progress-bg)` | Aktif menü arka planı (açık turuncu) |
| `--sidebar-accent-foreground` | `var(--primary)` | Aktif menü metin/ikon |
| `--sidebar-primary` | `var(--primary)` | Marka vurgusu |

Aktif `SidebarMenuButton` bu accent token’larını kullanır — ekstra class gerekmez.

### Nötr yüzeyler

- `--background` / `--foreground` — sayfa
- `--card` — görev kartı zemini (beyaz)
- `--muted` / `--muted-foreground` — ikincil metin
- `--border` / `--input` — genel kenarlık
- `--destructive` — hata / sil

**Kural:** Bu paletin dışına çıkmayın. Yeni ekranlarda da primary + status token’larını kullanın.

---

## 4. Butonlar

Kaynak: `src/components/ui/button.tsx`

### Ortak

- Font: `font-heading`
- Köşe: `rounded-md`
- Focus: `ring` = primary

### Variant’lar

| Variant | Görünüm | Tipik kullanım |
|---------|---------|----------------|
| `default` | Turuncu zemin, beyaz metin | Birincil CTA (“Yeni Görev”, form submit) |
| `outline` | Kenarlıklı, açık zemin | İkincil (“Çıkış Yap”) |
| `ghost` | Zemin yok, hover muted | İkon menü (kart kebab) |
| `secondary` | Gri yüzey | Nadir |
| `destructive` | Soft kırmızı | Sil / zararlı aksiyon |
| `link` | Primary metin + underline | Auth footer linkleri |

### Size’lar

| Size | Yükseklik | Not |
|------|-----------|-----|
| `xs` | `h-6` | Çok kompakt |
| `sm` | `h-8` | Küçük |
| `default` | `h-9` | Standart |
| `lg` | `h-10` | Tabbar CTA, auth submit |
| `icon` / `icon-sm` / `icon-xs` / `icon-lg` | Kare | Sadece ikon |

**Örnek — Yeni Görev:** `variant="default"` (varsayılan) + `size="lg"` + başta `Plus` ikonu.

---

## 5. Sidebar

Kaynak: `src/components/layout/AppSidebar.tsx`  
Davranış: shadcn `Sidebar` + `collapsible="icon"`

### Genişlikler (`sidebar.tsx` sabitleri)

| Durum | Genişlik |
|-------|----------|
| Açık | `14rem` |
| Daraltılmış (ikon rayı) | `4rem` |

### Yapı

1. **Header:** `SquareKanban` ikonu + “TaskManager” (`font-heading`, `text-primary`)
2. **Nav:** Lucide ikon + etiket; `h-11`, `text-base`, `gap-3`, menü öğeleri arası `gap-2`
3. **Footer:** `UserAvatar` + ad/e-posta; `outline` “Çıkış Yap” (`LogOut` ikonu)

### Nav ikonları

| Sayfa | İkon |
|-------|------|
| Görevler | `ListChecks` |
| Kullanıcılar | `Users` |
| Departmanlar | `Building2` |
| Logo | `SquareKanban` |
| Çıkış | `LogOut` |

### Daraltılmış (icon) mod

- Etiketler: `group-data-[collapsible=icon]:hidden` (ilk harf sızıntısı olmasın)
- İkonlar ortalanır; nav butonu `size-10`
- Logo yazısı gizlenir, ikon kalır
- Kullanıcı adı/e-posta gizlenir, avatar kalır
- Hover’da `tooltip={label}` (AppLayout’ta `TooltipProvider` şart)

### Aktif durum

- Arka plan: `--sidebar-accent` (açık turuncu)
- Metin/ikon: `--sidebar-accent-foreground` (primary)

---

## 6. PageHeader (tabbar)

Kaynak: `src/components/layout/PageHeader.tsx`

```
[ SidebarTrigger ] | [ Sayfa başlığı ] ………… [ actions? ]
```

| Özellik | Değer |
|---------|--------|
| Yükseklik | `h-16` |
| Sticky | `sticky top-0 z-20` |
| Kenar | `border-b` |
| Sol padding | `pl-2` (trigger sola yakın) |
| Trigger | `size-10`, SVG `size-5` |
| Başlık | `font-heading text-2xl font-bold` |
| Actions | `ml-auto` |

TasksPage actions: “Yeni Görev” butonu (`size="lg"`, `Plus`).

---

## 7. TasksPage görsel örüntüsü

Kaynak: `TasksPage.tsx` + `TaskBoardView` + `TaskColumn` + `TaskCard`

### Sayfa iskeleti

1. `PageHeader` (başlık + Yeni Görev)
2. Filtre satırı (`flex flex-wrap gap-4`)
3. Kanban board (`TaskBoardView` → 3 sütun)

İçerik alanı: `p-4`, dikey `gap-4`.

### Filtreler

Üç `Select` (shadcn Base UI Select):

| Kontrol | Label | Trigger |
|---------|-------|---------|
| Öncelik | `text-base` | `h-10 w-44 text-base` |
| Tarih | `text-base` | `h-10 w-44 text-base` |
| Sırala | `text-base` | `h-10 w-64 text-base` |

Label–kontrol arası `gap-1.5`. Değerler ve `filterAndSortTasks` imzası tasarım dışı — davranış değişmez.

### Kanban sütunları (`TaskColumn`)

| Özellik | Kural |
|---------|--------|
| Yerleşim | `flex-1`, sütunlar arası `gap-4` |
| Zemin | Status pastel bg (tam sütun) |
| Kenar | `border border-dashed` + ilgili `*-dot/40` |
| Köşe | `rounded-lg` |
| Gölge | Sadece alt: `shadow-[0_12px_20px_-14px_rgb(0_0_0/0.45)]` |
| Padding | `p-4` |
| Başlık | Nokta (`size-2.5` + `*-dot`) + `font-heading text-base` |
| Kart listesi | `space-y-3`, `maxHeight: 65vh`, `overflow-y-auto` |
| Drop hedefi | `ring-2 ring-primary/40` |

Kartlar beyaz kaldığı için pastel sütunla kontrast oluşur.

### Görev kartları (`TaskCard`)

| Özellik | Kural |
|---------|--------|
| Zemin | `bg-card` (beyaz), **kartta gölge yok** |
| Kenar | `border-2` + status dot rengi **%45 opaklık** |
| Padding | `p-3` |
| Başlık | `font-heading text-base font-medium` |
| Menü | `MoreVertical` `size-5`, trigger `icon-sm` |
| Öncelik badge | Soft renkler (nötr / turuncu / kırmızı) |
| Atanan | `UserAvatar` (`sm`) + isim `text-sm` |

Status kenarlık sınıfları:

- pending → `border-status-pending-dot/45`
- in-progress → `border-status-progress-dot/45`
- done → `border-status-done-dot/45`

### Avatar

`UserAvatar`: zemin `bg-status-progress-bg`, harfler `text-primary`, `getInitials()` ile baş harfler.

### Sürükle-bırak

- `DragOverlay` ile sürüklenen kart üst katmanda (sütun `overflow` kırpmaz)
- Kaynak kart sürüklerken `opacity-40`
- Overlay’de hafif `shadow-lg` (yerindeki kartlarda gölge yok)

---

## 8. Auth sayfaları (Login / Register)

Görsel dil TasksPage ile aynı token’ları kullanır:

- Arka plan: `bg-gradient-to-br from-status-progress-bg via-background to-status-pending-bg`
- Marka bloğu: primary kutu + `SquareKanban` + “TaskManager”
- Kart: `shadow-xl`, `CardTitle` `font-heading`
- Form: `gap-5`, input `h-10`, submit `size="lg"` tam genişlik
- Giriş animasyonu: `animate-in fade-in-0 slide-in-from-bottom-4 duration-500`
- Hata: soft destructive kutu

---

## 9. Hareket / animasyon

| Yer | Efekt |
|-----|--------|
| Auth sayfa girişi | fade + slide-from-bottom |
| Form / API hataları | fade + hafif slide-from-top |
| Submit loading | `Loader2` + `animate-spin` |
| Link hover | `transition-colors` + underline |
| DnD overlay | portal + opacity kaydırma |

Abartılı glow, çok katmanlı gölge veya rastgele renk animasyonları kullanmayın.

---

## 10. Uygulama kontrol listesi

Yeni UI eklerken:

- [ ] Renkler yalnızca mevcut CSS token’larından
- [ ] Başlık / CTA / nav → `font-heading`; gövde → varsayılan
- [ ] Birincil aksiyon → `Button` `default` (+ gerekirse `lg`)
- [ ] Sidebar yeni menü → ikon + `font-heading` + daraltmada `hidden` etiket + `tooltip`
- [ ] Sayfa başlığı → `PageHeader` (trigger + title + actions)
- [ ] Durum yüzeyi → pastel bg + dashed border + soft card border (`*-dot/45`)
- [ ] Kart gölgesi yok; sütun gölgesi yalnızca altta
- [ ] Sürüklenen öğe → `DragOverlay` (overflow kırpmasın)

---

## 11. Dosya haritası

| Konu | Dosya |
|------|--------|
| Token’lar | `src/index.css` |
| Font yükleme | `index.html` |
| Sidebar | `src/components/layout/AppSidebar.tsx` |
| Tabbar | `src/components/layout/PageHeader.tsx` |
| Layout | `src/components/layout/AppLayout.tsx` |
| Buton | `src/components/ui/button.tsx` |
| Avatar | `src/components/UserAvatar.tsx` |
| Görevler sayfası | `src/modules/tasks/pages/TasksPage.tsx` |
| Sütun / kart | `…/TaskColumn.tsx`, `…/TaskCard.tsx` |
| Board + DnD | `…/views/TaskBoardView.tsx` |
