import React, { useState, useEffect } from 'react';
import { getWeatherData } from './weatherService';
import resortsData from './resorts.json';
import ResortMap from './ResortMap';

const SNOW_CODES     = new Set(['K','HKY','YKY','KKY','71','73','75','77','85','86']);
const STORM_CODES    = new Set(['GSY','KGY','DY','MSY','KSY','95','96','99']);
const RAIN_CODES     = new Set(['Y','HY','SY','KY','HHY','51','53','55','56','57','61','63','65','66','67','80','81','82']);
const FOG_CODES      = new Set(['S','SIS','P','PUS','D','45','48']);
const OVERCAST_CODES = new Set(['CB','3']);
const PARTLY_CODES   = new Set(['PB','AB','R','GKR','KKR','KF','SGK','SCK','1','2']);

const ELEVATION_LABELS = {
  uludag:     '1,870m – 2,543m',
  erciyes:    '2,200m – 3,917m',
  palandoken: '2,200m – 3,176m',
  kartalkaya: '2,052m – 2,200m',
};

function WeatherMiniIcon({ code, className = 'w-4 h-4' }) {
  const c = String(code || '').trim().toUpperCase();
  if (SNOW_CODES.has(c)) return (
    <svg className={`${className} text-sky-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
    </svg>
  );
  if (STORM_CODES.has(c)) return (
    <svg className={`${className} text-amber-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
  if (RAIN_CODES.has(c)) return (
    <svg className={`${className} text-sky-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M8 19v2m4-2v2m4-2v2" />
    </svg>
  );
  if (FOG_CODES.has(c)) return (
    <svg className={`${className} text-slate-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18M3 9h18M6 12h12M8 18h8" />
    </svg>
  );
  if (OVERCAST_CODES.has(c)) return (
    <svg className={`${className} text-slate-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
  if (PARTLY_CODES.has(c)) return (
    <svg className={`${className} text-amber-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  return (
    <svg className={`${className} text-amber-500`} viewBox="0 0 20 20" fill="currentColor">
      <path clipRule="evenodd" fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
    </svg>
  );
}

function RecommendationIcon({ category }) {
  if (category === 'giysi') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
  if (category === 'ekipman') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    id: 'panel', label: 'Panel', filled: true,
    icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />,
  },
  {
    id: 'pistler', label: 'Pistler',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
  },
  {
    id: 'danisman', label: 'Danışman AI', dot: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  },
  {
    id: 'kiralama', label: 'Kiralama',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
  },
  {
    id: 'profil', label: 'Profil',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  },
];

export default function Dashboard() {
  const [selectedResort, setSelectedResort] = useState(resortsData[0]);
  const [weatherData, setWeatherData]       = useState(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const [activeTab, setActiveTab]           = useState('panel');

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      const { lat, lon, elevation, mgm_ist_no } = selectedResort;
      const result = await getWeatherData(lat, lon, elevation, mgm_ist_no);
      if (isMounted) {
        if (result.success) setWeatherData(result.data);
        else setError(result.error);
        setIsLoading(false);
      }
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => { isMounted = false; clearInterval(id); };
  }, [selectedResort]);

  const slopeGuide = selectedResort.slope_guide;
  const shortName  = selectedResort.name.replace(' Kayak Merkezi', '');

  const lastUpdatedTime = (() => {
    if (!weatherData?.lastUpdated) return null;
    try {
      const d = new Date(weatherData.lastUpdated);
      return isNaN(d.getTime()) ? null : d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch { return null; }
  })();

  const windLabel = (spd) => {
    if (spd > 50) return { text: 'Kuvvetli', cls: 'text-rose-700 bg-rose-50' };
    if (spd > 25) return { text: 'Orta',     cls: 'text-amber-700 bg-amber-50' };
    return               { text: 'Hafif',    cls: 'text-emerald-600 bg-emerald-50' };
  };

  /* ─────────────────────────────────────────────────
     SIDEBAR NAV ITEM (desktop)
  ───────────────────────────────────────────────── */
  function SidebarItem({ item }) {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => setActiveTab(item.id)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none ${
          isActive
            ? 'bg-sky-50 text-sky-700 font-bold shadow-sm border border-sky-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
      >
        <div className="relative shrink-0">
          {item.filled ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">{item.icon}</svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{item.icon}</svg>
          )}
          {item.dot && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white"></span>
          )}
        </div>
        <span>{item.label}</span>
        {isActive && <span className="ml-auto w-1.5 h-5 rounded-full bg-sky-500"></span>}
      </button>
    );
  }

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <div className="font-sans min-h-screen lg:h-screen lg:overflow-hidden lg:flex">

      {/* ── BLURRED RESORT BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${selectedResort.bg_image})`,
            filter: 'blur(14px)',
            transform: 'scale(1.1)',
          }}
        />
        <div className="absolute inset-0 bg-white/52" />
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LEFT SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white/90 border-r border-sky-100 shrink-0 h-screen sticky top-0 relative z-10">

        {/* Logo */}
        <div className="p-5 border-b border-sky-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow shadow-sky-500/30 text-white shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">SKIBASE</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-sky-500 to-cyan-500 text-white">PRO</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AKILLI DANIŞMANLIK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Navigasyon</div>
          {NAV_ITEMS.map(item => <SidebarItem key={item.id} item={item} />)}
        </nav>

        {/* Live status widget */}
        <div className="p-4 border-t border-sky-100 shrink-0">
          <div className="bg-sky-50 rounded-2xl p-3.5 border border-sky-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aktif İstasyon</div>
            <div className="text-sm font-extrabold text-slate-900 truncate">{selectedResort.name.replace(' Kayak Merkezi', '')}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {weatherData ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  {weatherData.temperature}°C · {weatherData.dataSource}
                </span>
              ) : (
                <span className="text-slate-400">Veri yükleniyor…</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          CONTENT AREA (mobile: full; desktop: flex-1)
      ══════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 lg:overflow-hidden relative z-10">

        {/* ── STICKY HEADER ── */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-sky-100/60">
          <div className="px-4 lg:px-6 pt-3 pb-2">

            {/* Mobile logo + action buttons */}
            <header className="lg:hidden flex justify-between items-center mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow shadow-sky-500/30 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">SKIBASE</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-sky-500 to-cyan-500 text-white">PRO</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 pl-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AKILLI DANIŞMANLIK & VERİ</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white shadow-sm border border-sky-100 flex items-center justify-center text-slate-600" aria-label="Arama">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="relative w-8 h-8 rounded-full bg-white shadow-sm border border-sky-100 flex items-center justify-center text-slate-600" aria-label="Bildirimler">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                </button>
              </div>
            </header>

            {/* Desktop page title + action buttons */}
            <div className="hidden lg:flex justify-between items-center mb-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kayak Paneli</div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedResort.name}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="w-9 h-9 rounded-full bg-white shadow-sm border border-sky-100 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-colors" aria-label="Arama">
                  <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="relative w-9 h-9 rounded-full bg-white shadow-sm border border-sky-100 flex items-center justify-center text-slate-600 hover:text-sky-600 transition-colors" aria-label="Bildirimler">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                </button>
              </div>
            </div>

            {/* Resort selector chips (her iki boyut) */}
            <nav className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Kayak Merkezleri">
              {resortsData.map((resort) => {
                const isActive = selectedResort.id === resort.id;
                const name = resort.name.replace(' Kayak Merkezi', '');
                const elev = ELEVATION_LABELS[resort.id] || '';
                return (
                  <button
                    key={resort.id}
                    onClick={() => setSelectedResort(resort)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md border border-slate-900'
                        : 'bg-white text-slate-600 border border-sky-100 shadow-sm hover:bg-slate-50'
                    }`}
                  >
                    <span>{name}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'text-sky-300 bg-slate-800/80' : 'text-slate-400'
                    }`}>{elev}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── SCROLLABLE CARDS ── */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-6 pt-4 pb-28 lg:pb-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5 items-start">

            {/* ── CARD 1: HERO LIVE CONDITIONS ── */}
            <section className="bg-white rounded-3xl p-4 lg:p-5 shadow-lg shadow-slate-200/60 border border-sky-100/90 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-100/40 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase">CANLI DAĞ KOŞULLARI</span>
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                  <span>
                    {weatherData
                      ? `${weatherData.dataSource} • ${weatherData.liftWarning ? 'Lift Uyarısı' : 'Liftler Açık'}`
                      : 'Yükleniyor…'}
                  </span>
                </span>
              </div>

              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-14 bg-slate-100 rounded-xl w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-2xl"></div>)}
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
              ) : weatherData ? (
                <>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">{weatherData.temperature}°C</span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center text-xs font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                          {weatherData.weatherDescription}
                        </span>
                      </div>
                      {lastUpdatedTime && (
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Güncelleme {lastUpdatedTime}</span>
                      )}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-50 to-blue-100 border border-sky-200/60 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                      <WeatherMiniIcon code={weatherData.forecast?.[0]?.hadiseCode || ''} className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3.5 relative z-10">
                    <div className="bg-sky-50/70 rounded-2xl p-2.5 lg:p-3 border border-sky-100">
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider">RÜZGAR</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-base lg:text-lg font-extrabold text-slate-800">{weatherData.windSpeed}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">km/sa</span>
                        <span className={`text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded ${windLabel(weatherData.windSpeed).cls}`}>
                          {windLabel(weatherData.windSpeed).text}
                        </span>
                      </div>
                    </div>

                    <div className="bg-sky-50/70 rounded-2xl p-2.5 lg:p-3 border border-sky-100">
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider">KAR KALINLIĞI</div>
                      <div className="mt-1">
                        <span className="text-base lg:text-lg font-extrabold text-slate-800">{weatherData.snowDepthText}</span>
                      </div>
                    </div>

                    <div className="bg-sky-50/70 rounded-2xl p-2.5 lg:p-3 border border-sky-100">
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider">NEM</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        {weatherData.humidity != null ? (
                          <>
                            <span className="text-base lg:text-lg font-extrabold text-slate-800">{weatherData.humidity}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">%</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400 font-semibold">—</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-sky-50/70 rounded-2xl p-2.5 lg:p-3 border border-sky-100">
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider">VERİ KAYNAĞI</div>
                      <div className="mt-1">
                        <span className="text-sm font-extrabold text-sky-700">{weatherData.dataSource || 'MGM'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl px-3.5 py-2.5 flex items-center justify-between shadow-sm ${
                    weatherData.liftWarning ? 'bg-rose-900' : 'bg-slate-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        weatherData.liftWarning ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">Mekanik Tesis Durumu</span>
                        <span className="text-[10px] text-slate-400">{shortName}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                      weatherData.liftWarning
                        ? 'text-rose-300 bg-rose-950/80 border-rose-500/30'
                        : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
                    }`}>
                      {weatherData.liftWarning ? '⚠ LİFT UYARISI' : '● LİFTLER AÇIK'}
                    </span>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-sky-100">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      5 Günlük Hava Tahmini
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {weatherData.forecast?.length > 0 ? (
                        weatherData.forecast.slice(0, 5).map((f, idx) => {
                          const isSnow = SNOW_CODES.has(String(f.hadiseCode || '').trim().toUpperCase());
                          return (
                            <div key={idx} className={`rounded-xl p-1.5 border ${isSnow ? 'bg-sky-50 border-sky-200' : 'bg-sky-50/80 border-sky-100'}`}>
                              <div className={`text-[11px] font-bold ${isSnow ? 'text-sky-900' : 'text-slate-700'}`}>{f.dayName}</div>
                              <div className="my-1 flex justify-center">
                                <WeatherMiniIcon code={f.hadiseCode} />
                              </div>
                              <div className={`text-[10px] font-bold ${isSnow ? 'text-sky-900' : 'text-slate-800'}`}>
                                {f.minTemp}°{' '}
                                <span className={`font-normal ${isSnow ? 'text-sky-600' : 'text-slate-400'}`}>/ {f.maxTemp}°</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-5 text-center text-xs text-slate-400 py-2">Tahmin yükleniyor…</div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </section>

            {/* ── CARD 2: AI ADVISOR (DARK) ── */}
            <section className="bg-gradient-to-br from-slate-950 via-[#0B1E38] to-[#04335E] text-white rounded-3xl p-4 lg:p-5 shadow-xl border border-sky-500/20 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 flex items-center justify-center font-extrabold text-xs shadow-md shrink-0">AI</div>
                  <div>
                    <span className="text-xs font-bold tracking-wide uppercase text-white block">GÜNÜN DANIŞMAN REÇETESİ</span>
                    <span className="text-[10px] text-sky-300 font-medium">{shortName} • Koşul Analizi</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full shrink-0">★ Uzman</span>
              </div>

              <blockquote className="bg-white/10 rounded-2xl p-3.5 lg:p-4 border border-white/15 mb-4 text-xs lg:text-sm leading-relaxed font-medium text-slate-100 relative z-10">
                "{selectedResort.sales_tip}"
              </blockquote>

              <div className="space-y-2 relative z-10">
                {selectedResort.recommendations?.map((rec, i) => {
                  const palette = [
                    { ring: 'bg-sky-500/20 text-sky-300 border-sky-400/20',      label: 'text-sky-300' },
                    { ring: 'bg-amber-500/20 text-amber-300 border-amber-400/20', label: 'text-amber-300' },
                    { ring: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/20',    label: 'text-cyan-300' },
                  ];
                  const p = palette[i] || palette[0];
                  return (
                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5 lg:p-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${p.ring}`}>
                        <RecommendationIcon category={rec.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold ${p.label} uppercase tracking-wider block mb-0.5`}>{rec.label}</span>
                        <p className="text-xs lg:text-sm font-medium text-slate-200 leading-snug">{rec.item}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── CARD 3: PİST DAĞILIMI + HARİTA + BÖLGE ── */}
            <section className="bg-white rounded-3xl p-4 lg:p-5 shadow-lg shadow-slate-200/60 border border-sky-100">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">PİST DAĞILIMI & DURUM</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Toplam {selectedResort.slopes.total_km} km pist hattı</p>
                </div>
                <span className="text-xs font-extrabold text-slate-900 bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 rounded-full">
                  {selectedResort.slopes.total_km} km
                </span>
              </div>

              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex my-2.5 shadow-inner">
                <div className="bg-sky-500 h-full transition-all duration-700" style={{ width: `${selectedResort.slopes.green_blue_percent}%` }}></div>
                <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${selectedResort.slopes.red_percent}%` }}></div>
                <div className="bg-slate-900 h-full transition-all duration-700" style={{ width: `${selectedResort.slopes.black_percent}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 px-1 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Mavi %{selectedResort.slopes.green_blue_percent}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Kırmızı %{selectedResort.slopes.red_percent}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  <span>Siyah %{selectedResort.slopes.black_percent}</span>
                </div>
              </div>

              {/* Map — taller on desktop */}
              <div className="h-[190px] lg:h-[260px]">
                <ResortMap lat={selectedResort.lat} lon={selectedResort.lon} name={selectedResort.name} height="100%" />
              </div>

              {slopeGuide && (
                <div className="space-y-2.5 mt-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">BÖLGE & PİST DETAY REHBERİ</span>
                  </div>

                  <div className="bg-sky-50/70 hover:bg-sky-50 rounded-2xl p-3 border border-sky-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200 shrink-0"></span>
                        <span className="text-xs font-bold text-slate-900 truncate">{slopeGuide.zone1_title}</span>
                      </div>
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-100/90 px-2 py-0.5 rounded-full shrink-0 ml-2">Başlangıç & Aile</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{slopeGuide.zone1_desc}</p>
                  </div>

                  <div className="bg-slate-50 hover:bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200 shrink-0"></span>
                        <span className="text-xs font-bold text-slate-900 truncate">{slopeGuide.zone2_title}</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full shrink-0 ml-2">Orta / İleri</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{slopeGuide.zone2_desc}</p>
                  </div>

                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-center gap-1.5 text-[11px] text-amber-900 font-medium">
                    <span className="text-amber-500 text-sm shrink-0">★</span>
                    <span><strong>Popüler Rotalar:</strong> {slopeGuide.popular_runs.replace('Öne Çıkanlar: ', '')}</span>
                  </div>
                </div>
              )}
            </section>

            {/* ── CARD 4: EKİPMAN KİRALAMA ── */}
            <section className="bg-white rounded-3xl p-4 lg:p-5 shadow-lg shadow-slate-200/60 border border-sky-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">EKİPMAN KİRALAMA</h2>
                    <p className="text-[10px] text-slate-400 font-medium">{shortName} Pist Teslim Noktası</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">Aktif Sezon</span>
              </div>

              <div className="space-y-2.5">
                {selectedResort.rentals?.map((rental, i) => (
                  <div key={i} className="p-3 bg-gradient-to-r from-sky-50/90 to-white border border-sky-100/90 rounded-2xl flex items-center justify-between hover:border-sky-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{rental.item}</h3>
                        <p className="text-[10px] text-slate-500">{rental.desc}</p>
                        {rental.price_day != null ? (
                          <span className="text-xs font-extrabold text-slate-900">
                            ₺{rental.price_day.toLocaleString('tr-TR')}
                            <span className="text-[10px] font-normal text-slate-400"> /gün</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 italic">Fiyat bilgisi yakında</span>
                        )}
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-[11px] font-bold transition-colors shadow-sm shrink-0">
                      Rezerve Et
                    </button>
                  </div>
                ))}
              </div>

              <button className="w-full mt-3 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5">
                <span>Tüm Ekipman Kataloğunu İncele</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </section>

          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM TAB BAR (desktop'ta gizli)
      ══════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sky-100/80 px-4 pt-2 flex justify-around items-center z-40 shadow-lg"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center transition-transform active:scale-95 focus:outline-none ${
              activeTab === item.id ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              {item.filled ? (
                <svg className="w-5 h-5 mb-0.5" fill="currentColor" viewBox="0 0 20 20">{item.icon}</svg>
              ) : (
                <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{item.icon}</svg>
              )}
              {item.dot && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"></span>}
            </div>
            <span className={`text-[10px] ${activeTab === item.id ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
