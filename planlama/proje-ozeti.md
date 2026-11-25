# SkiBase — Proje Özeti

## Proje Nedir?
Türkiye'nin önde gelen 4 kayak merkezini gerçek zamanlı hava durumu ve danışmanlık bilgisiyle gösteren web uygulaması.

**Canlı URL:** https://skibase.vercel.app (Vercel üzerinde)
**GitHub:** https://github.com/007Kutay/skibase

---

## Teknik Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19 + Vite 8 |
| Stil | Tailwind CSS 4 |
| Harita | MapLibre GL JS 4 |
| Deploy | Vercel (GitHub auto-deploy) |
| Hava Verisi | MGM (birincil) + Open-Meteo (yedek) |

---

## Desteklenen Kayak Merkezleri

| Merkez | Şehir | Pist (km) | MGM İst. No |
|--------|-------|-----------|-------------|
| Uludağ | Bursa | 28 km | 17676 |
| Erciyes | Kayseri | 102 km | 18149 |
| Palandöken | Erzurum | 55 km | 17777 |
| Kartalkaya | Bolu | 40 km | 18174 |

---

## Uygulama Yapısı

```
skibase/
├── planlama/           ← proje notları ve günlük
├── app/
│   ├── src/
│   │   ├── App.jsx           → giriş noktası
│   │   ├── Dashboard.jsx     → ana panel (3 kart layout)
│   │   ├── ResortMap.jsx     → MapLibre harita bileşeni
│   │   ├── weatherService.js → MGM + Open-Meteo veri servisi
│   │   ├── resorts.json      → kayak merkezi verileri
│   │   └── style.css
│   ├── api/mgm/[...path].js  → MGM CORS proxy (Vercel serverless)
│   └── vercel.json           → build config + rewrite kuralları
└── README.md
```

---

## Arayüz Mimarisi — SKIBASE PRO (Kasım 2026)

### Genel Yapı
- **Desktop:** Sol sidebar (w-64) + sağda 2×2 kart grid'i
- **Mobil:** Üst header + alt bottom tab bar (5 sekme)
- **Font:** Plus Jakarta Sans (Google Fonts)
- **Tema:** Glassmorphic koyu cam — fotoğraf arka plan (`blur 3px`), `bg-black/40` overlay, kartlar `bg-white/10 backdrop-blur-xl`

### 4 Kart Düzeni (2×2 Grid)

**Kart 1 — Canlı Koşullar**
- Anlık sıcaklık, rüzgar hızı, kar derinliği, nem
- Mekanik tesis / lift durumu
- 5 günlük hava tahmini (MGM + Open-Meteo yedek)

**Kart 2 — AI Danışman**
- Merkeze özel danışman notu (satış tüyosu)
- Giysi, ekipman ve gözlük önerileri
- Koyu gradient tema (`from-slate-950 to-[#04335E]`)

**Kart 3 — Pist Dağılımı & Harita**
- Mavi / Kırmızı / Siyah pist yüzde barı
- İnteraktif MapLibre haritası (koyu tema, marker, zoom)
- Bölge & pist bilgi rehberi + öne çıkan pistler

**Kart 4 — Ekipman Kiralama**
- Merkeze özel kiralık ekipman listesi (₺/gün)
- `resorts.json` → `rentals` dizisinden dinamik

---

## Vercel Deploy Akışı

```
Yerel değişiklik → git commit → git push → GitHub → Vercel otomatik build (~2 dk) → Canlı
```

> Vercel ayarı: Root Directory = `app`

---

## Günlük Notlar

- [günlük/2026-11-25.md](gunluk/2026-11-25.md)
- [günlük/2026-11-20.md](gunluk/2026-11-20.md)
- [günlük/2026-11-19.md](gunluk/2026-11-19.md)
