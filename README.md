# SkiBase | Kayak Danışmanlık ve Canlı Koşul Paneli

SkiBase, kayak ve kış sporları ekipmanı satan mağazalarda çalışan satış danışmanlarının, müşterilerine saniyeler içinde nokta atışı ve hava koşullarına uygun doğru ekipman tavsiyesi (kayak flex sertliği, snowboard profili, gözlük camı filtresi, termal katman vb.) vermesini sağlayan profesyonel bir canlı danışmanlık gösterge panelidir (dashboard).

---

## 1. Proje Amacı ve Vizyon
* **Hızlı ve İsabetli Satış Danışmanlığı:** Mağaza içi müşteri etkileşimlerinde 30 saniye içinde nokta atışı kayak/snowboard ekipmanı önermek.
* **Tek Ekranda 360° Bilgi:** Türkiye'nin önde gelen kayak merkezlerinin (**Uludağ**, **Erciyes**, **Palandöken**, **Kartalkaya**) anlık hava durumu, rüzgar hızı, kar kalınlığı, 5 günlük tahmin ve pist zorluk dağılımlarını tek bakışta sunmak.
* **Kullanıcı Deneyimi Odaklı Tasarım:** Mağaza ekranlarında kesintisiz ve şık görünüm sunan dikey kaydırmasız (no-scroll), ultra-modern buzlu cam (frosted glass) estetiği.

---

## 2. Temel Özellikler

* **Canlı Koşullar & MGM Entegrasyonu:**
  * Meteoroloji Genel Müdürlüğü (MGM) resmi istasyon ölçümleri (`/api-mgm` proxy rotası üzerinden sıcaklık, hadise, kar kalınlığı ve rüzgar hızı).
  * Olası servis kesintilerine karşı otomatik **Open-Meteo API** yedekleme (fallback) mimarisi.
* **Otomatik Veri Yenileme:**
  * Panel açık kaldığı sürece hava durumu verileri her **10 dakikada** bir otomatik olarak güncellenir; manuel yenileme gerekmez.
* **Rüzgar & Lift Güvenlik Göstergesi:**
  * 40 km/sa üzerindeki rüzgar hızlarında otomatik tetiklenen kırmızı animasyonlu **LİFT UYARISI** mekanizması.
* **5 Günlük MGM Tahmin Şeridi:**
  * İlgili kayak merkezi için gün bazında beklenen min/max sıcaklıklar ve meteorolojik hadise ikonları.
* **Pist Dağılımı & Kuşbakışı Harita:**
  * Mavi (Başlangıç), Kırmızı (Orta) ve Siyah (İleri) pist yüzdelerini gösteren dinamik oran çubuğu.
  * Tıklanabilir ve Lightbox modal ile tam ekran açılabilen pist haritası görünümü.
* **Bölge & Pist Danışmanlık Rehberi:**
  * Karmaşık ve ağır 3D harita motorları yerine, danışmanın doğrudan müşteriye aktarabileceği teknik bölge bilgileri.
* **Dinamik Satış Notu:**
  * Zemin sertliği, sis sıklığı, irtifa ve kar yapısına göre mağaza çalışanına özel hazır ekipman ve katmanlama tavsiyesi.
* **Tasarım & UI (Glassmorphism & Monochrome):**
  * Seçili merkeze göre pürüzsüz değişen yüksek kaliteli dağ arkaplanı.
  * Yarı saydam buzlu cam (`bg-white/10 backdrop-blur-xl border border-white/20`) kartlar ve yüksek kontrastlı monokrom tipografi.

---

## 3. Teknoloji Yığını (Tech Stack)

| Alan | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend Çatısı** | React 19 + Vite 6/8 | Hızlı derleme ve Native ESM tabanlı geliştirme deneyimi |
| **Stil & Arayüz** | Tailwind CSS v4 | `@tailwindcss/vite` eklentisi, Glassmorphism & Custom Responsive Layout |
| **Veri Servisleri** | MGM API + Open-Meteo API | Vite Reverse Proxy (dev) ve Vercel Serverless Function (prod) ile CORS güvenli istasyon sorgulamaları |
| **Veri Tabanı** | JSON (`resorts.json`) | Merkez koordinatları, MGM istasyon ID'leri, pist metrikleri ve satış tavsiyeleri |

---

## 4. Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# 1. Proje klasörüne geçiş yapın
cd app

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirici sunucusunu başlatın
npm run dev
```

Sunucu başladığında tarayıcınızdan **`http://localhost:5173`** adresine giderek paneli kullanabilirsiniz.

---

## 5. Proje Dizin Yapısı

```text
skibase/
├── app/
│   ├── api/
│   │   └── mgm/
│   │       └── [...path].js    # Vercel Serverless Proxy — prod ortamında MGM API köprüsü
│   ├── public/                 # Statik varlıklar ve ikonlar
│   ├── src/
│   │   ├── Dashboard.jsx       # Ana panel ve frosted glass bileşenleri
│   │   ├── resorts.json        # Kayak merkezleri, istasyon kodları ve danışmanlık verisi
│   │   ├── weatherService.js   # MGM ve Open-Meteo hibrit veri servisi
│   │   ├── style.css           # Tailwind CSS v4 direktifleri ve özel animasyonlar
│   │   ├── main.jsx            # React root mount noktası
│   │   └── App.jsx             # Kök uygulama bileşeni
│   ├── index.html              # HTML şablonu
│   ├── vite.config.js          # Vite eklentileri ve MGM Proxy konfigürasyonu (dev)
│   ├── vercel.json             # Vercel build konfigürasyonu ve API rewrites (prod)
│   └── package.json            # Bağımlılıklar ve npm scriptleri
└── README.md                   # Proje dokümantasyonu
```

---

## 6. Deployment (Vercel)

Proje hem geliştirme hem de üretim ortamında MGM API CORS sorununu aşacak şekilde yapılandırılmıştır:

| Ortam | MGM Proxy Mekanizması |
| :--- | :--- |
| **Dev** (`npm run dev`) | Vite `server.proxy` ayarı — `/api-mgm/*` isteklerini `servis.mgm.gov.tr`'ye tüneller |
| **Prod** (Vercel) | `vercel.json` rewrites → `app/api/mgm/[...path].js` serverless function → MGM API |

Vercel deploy için Vercel projesinin **Root Directory** ayarının `app/` olarak yapılandırıldığından emin olun.

---

## 7. Lisans ve Katkı
Bu proje açık kaynaklı ve mağaza içi profesyonel kullanım için optimize edilmiştir.
