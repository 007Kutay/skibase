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
    <svg className={`${className} text-cyan-200`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
    </svg>
  );
  if (STORM_CODES.has(c)) return (
    <svg className={`${className} text-amber-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
  if (RAIN_CODES.has(c)) return (
    <svg className={`${className} text-sky-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M8 19v2m4-2v2m4-2v2" />
    </svg>
  );
  if (FOG_CODES.has(c)) return (
    <svg className={`${className} text-white/70`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18M3 9h18M6 12h12M8 18h8" />
    </svg>
  );
  if (OVERCAST_CODES.has(c)) return (
    <svg className={`${className} text-white/80`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
  if (PARTLY_CODES.has(c)) return (
    <svg className={`${className} text-amber-200`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  return (
    <svg className={`${className} text-amber-300`} viewBox="0 0 20 20" fill="currentColor">
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
  { id: 'panel',    label: 'Panel',       filled: true,
    icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> },
  { id: 'pistler',  label: 'Pistler',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /> },
  { id: 'danisman', label: 'Danışman AI', dot: true,
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> },
  { id: 'kiralama', label: 'Kiralama',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { id: 'profil',   label: 'Profil',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

// Glass card base
const GLASS = 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]';
// Glass metric box
const METRIC_BOX = 'bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl';

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
    if (spd > 50) return { text: 'Kuvvetli', cls: 'text-rose-300 bg-rose-500/20' };
    if (spd > 25) return { text: 'Orta',     cls: 'text-amber-300 bg-amber-500/20' };
    return               { text: 'Hafif',    cls: 'text-emerald-300 bg-emerald-500/20' };
  };

  function SidebarItem({ item }) {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => setActiveTab(item.id)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none ${
          isActive
            ? 'bg-white/15 text-white font-bold border border-white/20'
            : 'text-white/55 hover:bg-white/10 hover:text-white/90'
        }`}
      >
        <div className="relative shrink-0">
          {item.filled ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">{item.icon}</svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{item.icon}</svg>
          )}
          {item.dot && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black/30"></span>}
        </div>
        <span>{item.label}</span>
        {isActive && <span className="ml-auto w-1.5 h-5 rounded-full bg-sky-400"></span>}
      </button>
    );
  }

  return (
    <div className="font-sans min-h-screen lg:h-screen lg:overflow-hidden lg:flex text-white">

      {/* ── BLURRED RESORT BACKGROUND (az blur, foto net) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url(${selectedResort.bg_image})`,
            filter: 'blur(3px)',
            transform: 'scale(1.04)',
          }}
        />
        {/* Hafif koyu overlay — glass kartlar için */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LEFT SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 relative z-10"
             style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Logo */}
        <div className="p-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow shadow-sky-500/40 text-white shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white drop-shadow">SKIBASE</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-sm">PRO</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">AKILLI DANIŞMANLIK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 py-2">Navigasyon</div>
          {NAV_ITEMS.map(item => <SidebarItem key={item.id} item={item} />)}
        </nav>

        {/* Live status widget */}
        <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className={`${METRIC_BOX} p-3.5`}>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Aktif İstasyon</div>
            <div className="text-sm font-extrabold text-white truncate">{shortName}</div>
            <div className="text-xs text-white/50 mt-0.5">
              {weatherData ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  {weatherData.temperature}°C · {weatherData.dataSource}
                </span>
              ) : (
                <span>Veri yükleniyor…</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          CONTENT AREA
      ══════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 lg:overflow-hidden relative z-10">

        {/* ── STICKY HEADER ── */}
        <div className="sticky top-0 z-30 backdrop-blur-md border-b border-white/10"
             style={{ background: 'rgba(0,0,0,0.30)' }}>
          <div className="px-4 lg:px-6 pt-3 pb-2">

            {/* Mobile logo + action buttons */}
            <header className="lg:hidden flex justify-between items-center mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-white drop-shadow">SKIBASE</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-sky-500 to-cyan-400 text-white">PRO</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 pl-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">AKILLI DANIŞMANLIK & VERİ</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors" aria-label="Arama">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="relative w-8 h-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors" aria-label="Bildirimler">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-black/30"></span>
                </button>
              </div>
            </header>

            {/* Desktop page title + action buttons */}
            <div className="hidden lg:flex justify-between items-center mb-3">
              <div>
                <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Kayak Paneli</div>
                <div className="text-2xl font-extrabold text-white tracking-tight drop-shadow">{selectedResort.name}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors" aria-label="Arama">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button className="relative w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors" aria-label="Bildirimler">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-black/30"></span>
                </button>
              </div>
            </div>

            {/* Resort selector chips */}
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
                        ? 'bg-white text-slate-900 shadow-lg shadow-black/20'
                        : 'bg-white/10 text-white/80 border border-white/20 backdrop-blur-sm hover:bg-white/20'
                    }`}
                  >
                    <span>{name}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'text-slate-500 bg-slate-100' : 'text-white/50'
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

            {/* ── CARD 1: CANLI KOŞULLAR ── */}
            <section className={`${GLASS} p-4 lg:p-5 relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold tracking-wider text-white/80 uppercase drop-shadow-sm">CANLI DAĞ KOŞULLARI</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    {weatherData
                      ? `${weatherData.dataSource} • ${weatherData.liftWarning ? 'Lift Uyarısı' : 'Liftler Açık'}`
                      : 'Yükleniyor…'}
                  </span>
                </span>
              </div>

              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-14 bg-white/10 rounded-xl w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/10 rounded-2xl"></div>)}
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-900/40 border border-red-500/40 text-red-200 px-4 py-3 rounded-2xl backdrop-blur-md text-sm">{error}</div>
              ) : weatherData ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">{weatherData.temperature}°C</span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-lg text-white/90 font-medium tracking-tight drop-shadow-sm">{weatherData.weatherDescription}</span>
                      </div>
                      {lastUpdatedTime && (
                        <span className="text-[11px] text-white/40 mt-0.5 block">Son ölçüm: {lastUpdatedTime}</span>
                      )}
                    </div>
                    <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                      <WeatherMiniIcon code={weatherData.forecast?.[0]?.hadiseCode || ''} className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Metric grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                    <div className={`${METRIC_BOX} p-3`}>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">RÜZGAR</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-white">{weatherData.windSpeed}</span>
                        <span className="text-xs text-white/50">km/sa</span>
                        <span className={`text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded ${windLabel(weatherData.windSpeed).cls}`}>
                          {windLabel(weatherData.windSpeed).text}
                        </span>
                      </div>
                    </div>

                    <div className={`${METRIC_BOX} p-3`}>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">KAR</span>
                      <span className="text-base font-bold text-white">{weatherData.snowDepthText}</span>
                    </div>

                    <div className={`${METRIC_BOX} p-3`}>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">NEM</span>
                      {weatherData.humidity != null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-white">{weatherData.humidity}</span>
                          <span className="text-xs text-white/50">%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-white/30 font-semibold">—</span>
                      )}
                    </div>

                    <div className={`${METRIC_BOX} p-3`}>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">VERİ KAYNAĞI</span>
                      <span className="text-sm font-bold text-sky-300">{weatherData.dataSource || 'MGM'}</span>
                    </div>
                  </div>

                  {/* Lift bar */}
                  <div className={`${METRIC_BOX} px-3.5 py-2.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        weatherData.liftWarning ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white/90 block">Mekanik Tesis Durumu</span>
                        <span className="text-[10px] text-white/40">{shortName}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                      weatherData.liftWarning
                        ? 'text-rose-300 bg-rose-950/60 border-rose-500/40'
                        : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                    }`}>
                      {weatherData.liftWarning ? '⚠ LİFT UYARISI' : '● LİFTLER AÇIK'}
                    </span>
                  </div>

                  {/* 5-day forecast */}
                  <div className="mt-4 pt-4 border-t border-white/15">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">5 Günlük Tahmin</span>
                      <span className="text-[9px] text-white/40 font-medium uppercase">Min / Max °C</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {weatherData.forecast?.length > 0 ? (
                        weatherData.forecast.slice(0, 5).map((f, idx) => (
                          <div key={idx} className="bg-black/20 hover:bg-white/15 border border-white/15 backdrop-blur-md rounded-xl p-1.5 transition-colors">
                            <div className="text-[11px] font-bold text-white/90">{f.dayName}</div>
                            <div className="my-1 flex justify-center">
                              <WeatherMiniIcon code={f.hadiseCode} />
                            </div>
                            <div className="text-[10px] font-bold text-white">
                              {f.minTemp}° <span className="text-white/40 font-normal">/ {f.maxTemp}°</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-5 text-center text-xs text-white/40 py-2">Tahmin yükleniyor…</div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </section>

            {/* ── CARD 2: AI DANIŞMAN ── */}
            <section className={`${GLASS} p-4 lg:p-5 relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 flex items-center justify-center font-extrabold text-xs shadow-md shrink-0">AI</div>
                  <div>
                    <span className="text-xs font-bold tracking-wide uppercase text-white block">GÜNÜN DANIŞMAN REÇETESİ</span>
                    <span className="text-[10px] text-sky-300 font-medium">{shortName} • Koşul Analizi</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full shrink-0">★ Uzman</span>
              </div>

              <blockquote className="bg-white/10 rounded-2xl p-3.5 lg:p-4 border border-white/15 mb-4 text-xs lg:text-sm leading-relaxed font-medium text-slate-100 backdrop-blur-sm">
                "{selectedResort.sales_tip}"
              </blockquote>

              <div className="space-y-2">
                {selectedResort.recommendations?.map((rec, i) => {
                  const palette = [
                    { ring: 'bg-sky-500/20 text-sky-300 border-sky-400/20',      label: 'text-sky-300' },
                    { ring: 'bg-amber-500/20 text-amber-300 border-amber-400/20', label: 'text-amber-300' },
                    { ring: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/20',    label: 'text-cyan-300' },
                  ];
                  const p = palette[i] || palette[0];
                  return (
                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5 lg:p-3 backdrop-blur-sm">
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
            <section className={`${GLASS} p-4 lg:p-5`}>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <h2 className="text-xs font-extrabold text-white/80 uppercase tracking-wider drop-shadow-sm">PİST DAĞILIMI & DURUM</h2>
                  <p className="text-[10px] text-white/40 font-medium">Toplam {selectedResort.slopes.total_km} km pist hattı</p>
                </div>
                <span className="text-xs font-bold text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {selectedResort.slopes.total_km} km
                </span>
              </div>

              <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden flex my-2.5 shadow-inner border border-white/10">
                <div className="bg-sky-400 h-full transition-all duration-700" style={{ width: `${selectedResort.slopes.green_blue_percent}%` }}></div>
                <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${selectedResort.slopes.red_percent}%` }}></div>
                <div className="bg-zinc-800 border-l border-white/10 h-full transition-all duration-700" style={{ width: `${selectedResort.slopes.black_percent}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-white/70 px-1 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]"></span>
                  <span>Mavi %{selectedResort.slopes.green_blue_percent}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
                  <span>Kırmızı %{selectedResort.slopes.red_percent}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/20"></span>
                  <span>Siyah %{selectedResort.slopes.black_percent}</span>
                </div>
              </div>

              <div className="h-[190px] lg:h-[260px]">
                <ResortMap lat={selectedResort.lat} lon={selectedResort.lon} name={selectedResort.name} height="100%" />
              </div>

              {slopeGuide && (
                <div className="space-y-2.5 mt-3.5 pt-3.5 border-t border-white/15">
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-[11px] font-extrabold text-white/70 uppercase tracking-wider">BÖLGE & PİST DETAY REHBERİ</span>
                  </div>

                  <div className={`${METRIC_BOX} p-3 hover:bg-white/10 transition-colors`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-sky-400/30 shrink-0"></span>
                        <span className="text-xs font-semibold text-white drop-shadow-sm truncate">{slopeGuide.zone1_title}</span>
                      </div>
                      <span className="text-[9px] font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full shrink-0 ml-2">Başlangıç & Aile</span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{slopeGuide.zone1_desc}</p>
                  </div>

                  <div className={`${METRIC_BOX} p-3 hover:bg-white/10 transition-colors`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30 shrink-0"></span>
                        <span className="text-xs font-semibold text-white drop-shadow-sm truncate">{slopeGuide.zone2_title}</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full shrink-0 ml-2">Orta / İleri</span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{slopeGuide.zone2_desc}</p>
                  </div>

                  <div className="bg-black/25 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-white/80 font-medium backdrop-blur-md">
                    <svg className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="truncate">{slopeGuide.popular_runs}</span>
                  </div>
                </div>
              )}
            </section>

            {/* ── CARD 4: EKİPMAN KİRALAMA ── */}
            <section className={`${GLASS} p-4 lg:p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 border border-white/20 p-1 rounded-md">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-xs font-extrabold text-white/80 uppercase tracking-wider drop-shadow-sm">EKİPMAN KİRALAMA</h2>
                    <p className="text-[10px] text-white/40 font-medium">{shortName} Kiralık Ekipman</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {selectedResort.rentals?.map((rental, i) => (
                  <div key={i} className={`${METRIC_BOX} px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors`}>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-white/95 block leading-tight">{rental.item}</span>
                      <span className="text-[11px] text-white/40 font-medium">{rental.desc}</span>
                    </div>
                    <div className="flex-shrink-0 ml-3 text-right">
                      {rental.price_day != null ? (
                        <>
                          <span className="text-base font-black text-white">{rental.price_day.toLocaleString('tr-TR')} ₺</span>
                          <span className="text-[10px] text-white/40 block font-medium">/ gün</span>
                        </>
                      ) : (
                        <span className="text-xs text-white/30 font-medium italic">yakında</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-white/40 font-semibold uppercase tracking-widest pt-4 border-t border-white/15 mt-4">
                {selectedResort.name} için Optimize Edildi
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM TAB BAR
      ══════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t border-white/10 px-4 pt-2 flex justify-around items-center z-40"
        style={{ background: 'rgba(0,0,0,0.45)', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center transition-transform active:scale-95 focus:outline-none ${
              activeTab === item.id ? 'text-sky-400' : 'text-white/40 hover:text-white/70'
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
