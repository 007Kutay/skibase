import React, { useState, useEffect } from 'react';
import { getWeatherData } from './weatherService';
import resortsData from './resorts.json';

const SNOW_CODES   = new Set(['K','HKY','YKY','KKY','71','73','75','77','85','86']);
const STORM_CODES  = new Set(['GSY','KGY','DY','MSY','KSY','95','96','99']);
const RAIN_CODES   = new Set(['Y','HY','SY','KY','HHY','51','53','55','56','57','61','63','65','66','67','80','81','82']);
const FOG_CODES    = new Set(['S','SIS','P','PUS','D','45','48']);
const OVERCAST_CODES = new Set(['CB','3']);
const PARTLY_CODES = new Set(['PB','AB','R','GKR','KKR','KF','SGK','SCK','1','2']);

function WeatherMiniIcon({ code }) {
  const c = String(code || '').trim().toUpperCase();

  if (SNOW_CODES.has(c)) {
    return (
      <svg className="w-4 h-4 text-cyan-200 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
      </svg>
    );
  }
  if (STORM_CODES.has(c)) {
    return (
      <svg className="w-4 h-4 text-amber-300 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (RAIN_CODES.has(c)) {
    return (
      <svg className="w-4 h-4 text-sky-300 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M8 19v2m4-2v2m4-2v2" />
      </svg>
    );
  }
  if (FOG_CODES.has(c)) {
    return (
      <svg className="w-4 h-4 text-white/70 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18M3 9h18M6 12h12M8 18h8" />
      </svg>
    );
  }
  if (OVERCAST_CODES.has(c)) {
    return (
      <svg className="w-4 h-4 text-white/80 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  }
  if (PARTLY_CODES.has(c)) {
    return (
      <svg className="w-4 h-4 text-amber-100 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-amber-300 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
    </svg>
  );
}

function RecommendationIcon({ category }) {
  if (category === 'giysi') {
    return (
      <svg className="w-4 h-4 text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }
  if (category === 'ekipman') {
    return (
      <svg className="w-4 h-4 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-violet-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function Dashboard() {
  const [selectedResort, setSelectedResort] = useState(resortsData[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      
      const { lat, lon, elevation, mgm_ist_no } = selectedResort;
      const result = await getWeatherData(lat, lon, elevation, mgm_ist_no);
      
      if (isMounted) {
        if (result.success) {
          setWeatherData(result.data);
        } else {
          setError(result.error);
        }
        setIsLoading(false);
      }
    };

    fetchWeather();
    const intervalId = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedResort]);

  // Modal ESC tuşu dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMapModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slopeGuide = selectedResort.slope_guide;

  const lastUpdatedTime = (() => {
    if (!weatherData?.lastUpdated) return null;
    try {
      const d = new Date(weatherData.lastUpdated);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch { return null; }
  })();

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col p-4 md:p-8 overflow-x-hidden text-white bg-cover bg-center transition-all duration-700 font-sans"
      style={{ backgroundImage: `url(${selectedResort.bg_image})` }}
    >
      {/* Dynamic Background Dark Tint Filter */}
      <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-0 pointer-events-none transition-all duration-700"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto flex-grow">
        
        {/* Header & Title */}
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-[0.2em] text-white drop-shadow-md">
              SKIBASE
            </h1>
            <p className="text-xs md:text-sm text-white/70 uppercase tracking-[0.3em] mt-1.5 font-medium drop-shadow-sm">
              Pro Danışmanlık Paneli
            </p>
          </div>
          
          {/* Resort Selector Buttons (Glassmorphic Pills) */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/15 w-fit shadow-lg">
            {resortsData.map((resort) => (
              <button
                key={resort.id}
                onClick={() => setSelectedResort(resort)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-out ${
                  selectedResort.id === resort.id
                    ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 hover:border-white/25 backdrop-blur-sm'
                }`}
              >
                {resort.name.replace(' Kayak Merkezi', '')}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content Area - 3 Frosted Glass Cards Layout */}
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4 items-stretch">
          
          {/* Card 1: Canlı Koşullar & 5 Günlük Tahmin */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-7 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:border-white/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] drop-shadow-sm">Canlı Koşullar</h2>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-400/40 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {weatherData?.dataSource || 'MGM Canlı İstasyon'}
                </span>
              </div>
              
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-white/10 rounded-xl w-1/2"></div>
                  <div className="h-5 bg-white/10 rounded-md w-3/4"></div>
                  <div className="h-20 bg-white/10 rounded-xl w-full mt-4"></div>
                </div>
              ) : error ? (
                <div className="bg-red-900/40 border border-red-500/40 text-red-200 px-4 py-3 rounded-2xl backdrop-blur-md flex items-center">
                  <span className="text-sm font-medium">{error}</span>
                </div>
              ) : weatherData ? (
                <>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">
                      {weatherData.temperature}°C
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="text-xl text-white/90 font-medium tracking-tight drop-shadow-sm mb-1">
                      {weatherData.weatherDescription}
                    </div>
                    {lastUpdatedTime && (
                      <span className="text-[11px] text-white/40 font-medium">Son ölçüm: {lastUpdatedTime}</span>
                    )}
                  </div>

                  {/* Detailed Metric Boxes */}
                  <div className="space-y-2.5 mb-5">
                    <div className={`grid gap-2.5 ${weatherData.humidity != null ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {/* Wind Speed (Rüzgar Hızı) */}
                      <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
                        <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">Rüzgar</span>
                        <span className="text-base font-bold text-white drop-shadow-sm">
                          {weatherData.windSpeed} <span className="text-xs text-white/60 font-normal">km/sa</span>
                        </span>
                      </div>

                      {/* Snow Depth (Kar Kalınlığı) */}
                      <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
                        <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">Kar</span>
                        <span className="text-base font-bold text-white drop-shadow-sm">{weatherData.snowDepthText}</span>
                      </div>

                      {/* Humidity (Nem) - only when available from MGM */}
                      {weatherData.humidity != null && (
                        <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
                          <span className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-1">Nem</span>
                          <span className="text-base font-bold text-white drop-shadow-sm">
                            {weatherData.humidity} <span className="text-xs text-white/60 font-normal">%</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lift Status Bar */}
                    <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center justify-between shadow-inner">
                      <span className="text-xs text-white/80 font-medium">Mekanik Tesis</span>
                      {weatherData.liftWarning ? (
                        <div className="bg-red-500/20 text-red-200 px-3 py-1 rounded-xl text-xs font-bold border border-red-500/40 backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          LİFT UYARISI
                        </div>
                      ) : (
                        <div className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-500/40 backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                          LİFTLER AÇIK
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5 Günlük MGM Tahmin Şeridi */}
                  <div className="pt-4 border-t border-white/15">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider drop-shadow-sm">5 Günlük Tahmin</span>
                      <span className="text-[9px] text-white/50 font-medium uppercase">Min / Max °C</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {weatherData.forecast && weatherData.forecast.length > 0 ? (
                        weatherData.forecast.slice(0, 5).map((f, idx) => (
                          <div 
                            key={idx}
                            className="bg-black/20 hover:bg-white/15 border border-white/15 hover:border-white/30 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-between text-center transition-all shadow-sm"
                            title={`${f.dayName} - ${f.description}: ${f.minTemp}° / ${f.maxTemp}°`}
                          >
                            <span className="text-[11px] font-bold text-white/90 mb-1 drop-shadow-sm">{f.dayName}</span>
                            <div className="my-1">
                              <WeatherMiniIcon code={f.hadiseCode} />
                            </div>
                            <span className="text-[10px] font-semibold text-white mt-1 drop-shadow-sm">
                              {f.minTemp}° <span className="text-white/40 font-normal">/</span> {f.maxTemp}°
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-5 text-center text-xs text-white/50 py-2">
                          Tahmin verisi yükleniyor...
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Card 2: Pist Dağılımı & Bölge / Pist Bilgi Rehberi */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-7 flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:border-white/30">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] drop-shadow-sm">Pist Dağılımı</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight drop-shadow-sm">
                  {selectedResort.slopes.total_km} <span className="text-xs text-white/60 font-normal">km Pist</span>
                </span>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-[10px] bg-white/10 hover:bg-white/25 border border-white/15 px-2 py-0.5 rounded-lg text-white/80 hover:text-white transition-all"
                  title="Kuşbakışı Haritayı Aç"
                >
                  Harita ↗
                </button>
              </div>
            </div>

            {/* Progress Bar & Breakdown */}
            <div className="space-y-3 mb-4 flex-shrink-0">
              <div className="h-3.5 w-full rounded-full flex overflow-hidden bg-black/30 border border-white/15 shadow-inner">
                <div
                  style={{ width: `${selectedResort.slopes.green_blue_percent}%` }}
                  className="bg-sky-400 transition-all duration-700 ease-out"
                  title={`Yeşil/Mavi: %${selectedResort.slopes.green_blue_percent}`}
                />
                <div
                  style={{ width: `${selectedResort.slopes.red_percent}%` }}
                  className="bg-rose-500 transition-all duration-700 ease-out"
                  title={`Kırmızı: %${selectedResort.slopes.red_percent}`}
                />
                <div
                  style={{ width: `${selectedResort.slopes.black_percent}%` }}
                  className="bg-zinc-800 transition-all duration-700 ease-out"
                  title={`Siyah: %${selectedResort.slopes.black_percent}`}
                />
              </div>

              <div className="flex justify-between items-center text-xs px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]"></div>
                  <span className="text-white/80 font-medium">Mavi (%{selectedResort.slopes.green_blue_percent})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></div>
                  <span className="text-white/80 font-medium">Kırmızı (%{selectedResort.slopes.red_percent})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-zinc-800 border border-white/20"></div>
                  <span className="text-white/80 font-medium">Siyah (%{selectedResort.slopes.black_percent})</span>
                </div>
              </div>
            </div>

            {/* Bölge & Pist Bilgi Rehberi */}
            <div className="pt-3.5 border-t border-white/15 flex flex-col flex-grow">
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider drop-shadow-sm flex items-center gap-1.5 mb-3 flex-shrink-0">
                <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Bölge & Pist Bilgi Rehberi
              </span>

              {slopeGuide ? (
                <>
                  <div className="space-y-2.5 flex-grow">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-md shadow-sm">
                      <div className="flex items-center gap-1.5 text-white font-semibold text-xs mb-1 drop-shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        {slopeGuide.zone1_title}
                      </div>
                      <p className="text-white/80 text-[11px] leading-relaxed">
                        {slopeGuide.zone1_desc}
                      </p>
                    </div>

                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-md shadow-sm">
                      <div className="flex items-center gap-1.5 text-white font-semibold text-xs mb-1 drop-shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {slopeGuide.zone2_title}
                      </div>
                      <p className="text-white/80 text-[11px] leading-relaxed">
                        {slopeGuide.zone2_desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 bg-black/25 px-3 py-2 rounded-xl border border-white/10 text-[11px] text-white/90 flex items-center gap-2 shadow-inner flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="truncate">{slopeGuide.popular_runs}</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/60 py-2">Bölge bilgisi bulunamadı.</p>
              )}
            </div>
          </div>

          {/* Card 3: Danışman Notu */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-7 flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:border-white/30">
            <h2 className="text-xs font-bold text-white/90 uppercase tracking-[0.15em] mb-5 flex items-center gap-2.5 drop-shadow-sm flex-shrink-0">
              <span className="bg-white text-black p-1 rounded-md shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Danışman Notu
            </h2>

            {/* Headline Sales Tip */}
            <div className="bg-black/25 border border-white/15 rounded-2xl p-4 mb-4 backdrop-blur-md flex-shrink-0">
              <p className="text-base text-white/95 font-semibold leading-snug tracking-tight drop-shadow-md">
                "{selectedResort.sales_tip}"
              </p>
            </div>

            {/* Recommendation Cards */}
            <div className="flex flex-col justify-between flex-grow gap-2.5">
              {selectedResort.recommendations?.map((rec, i) => (
                <div key={i} className="bg-black/25 border border-white/15 rounded-2xl p-3.5 flex items-center gap-3.5 backdrop-blur-md shadow-inner">
                  <div className="bg-white/10 border border-white/15 p-2.5 rounded-xl flex-shrink-0">
                    <RecommendationIcon category={rec.category} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold block mb-0.5">{rec.label}</span>
                    <span className="text-sm text-white/90 font-medium leading-snug">{rec.item}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-white/60 font-semibold uppercase tracking-widest pt-4 border-t border-white/15 mt-4 flex-shrink-0">
              {selectedResort.name} için Optimize Edildi
            </div>
          </div>

        </main>
      </div>

      {/* Pist Haritası Modal / Lightbox (Frosted Glass Theme) */}
      {isMapModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/75 backdrop-blur-xl animate-fadeIn"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl overflow-hidden shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-white/15 flex items-center justify-between bg-black/30 backdrop-blur-md">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-wide drop-shadow-sm">
                  {selectedResort.name} — Kuşbakışı Pist Haritası
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Toplam {selectedResort.slopes.total_km} km pist uzunluğu • Rakım: {selectedResort.elevation} m
                </p>
              </div>
              
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 p-2 rounded-xl transition-all shadow-sm"
                title="Kapat (ESC)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Image Container */}
            <div className="relative w-full max-h-[75vh] overflow-auto bg-black/40 flex items-center justify-center p-3">
              <img 
                src={selectedResort.trail_map_url || selectedResort.bg_image} 
                alt={`${selectedResort.name} Pist Haritası Detaylı`} 
                className="max-h-[70vh] w-auto object-contain rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/30 backdrop-blur-md border-t border-white/15 flex justify-between items-center text-xs text-white/70">
              <div>
                <span className="font-medium">{selectedResort.city}, Türkiye</span>
                <p className="text-[10px] text-white/40 mt-0.5">Bu görsel temsilidir, resmi pist haritası değildir.</p>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="px-5 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all shadow-md active:scale-95"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
