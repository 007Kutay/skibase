// MGM (Meteoroloji Genel Müdürlüğü) Hadise Kodları Sözlüğü
const mgmHadiseCodes = {
  'A': 'Açık',
  'AB': 'Az Bulutlu',
  'PB': 'Parçalı Bulutlu',
  'CB': 'Çok Bulutlu',
  'HY': 'Hafif Yağmurlu',
  'Y': 'Yağmurlu',
  'KY': 'Kuvvetli Yağmurlu',
  'SY': 'Sağanak Yağışlı',
  'K': 'Kar Yağışlı',
  'HKY': 'Hafif Kar Yağışlı',
  'YKY': 'Yoğun Kar Yağışlı',
  'KKY': 'Karla Karışık Yağmur',
  'S': 'Sisli',
  'SIS': 'Sisli',
  'P': 'Puslu',
  'PUS': 'Puslu',
  'D': 'Dumanlı',
  'GSY': 'Gökgürültülü Sağanak',
  'MSY': 'Mevzi Sağanak',
  'DY': 'Dolu Yağışlı',
  'R': 'Rüzgarlı',
  'KF': 'Kum / Toz Fırtınası',
  'GKR': 'Güneyli Kuvvetli Rüzgar',
  'KKR': 'Kuzeyli Kuvvetli Rüzgar',
  'SCK': 'Sıcak',
  'SGK': 'Soğuk',
  'HHY': 'Hafif Çisenti',
  'KGY': 'Kuvvetli Gökgürültülü',
  'KSY': 'Kuvvetli Sağanak'
};

// Open-Meteo WMO Kodları Sözlüğü
const wmoWeatherCodes = {
  0: 'Açık',
  1: 'Çoğunlukla Açık',
  2: 'Parçalı Bulutlu',
  3: 'Kapalı',
  45: 'Sisli',
  48: 'Kırağılı Sis',
  51: 'Hafif Çisenti',
  53: 'Orta Çisenti',
  55: 'Şiddetli Çisenti',
  56: 'Dondurucu Çisenti',
  57: 'Dondurucu Çisenti',
  61: 'Hafif Yağmur',
  63: 'Orta Yağmur',
  65: 'Şiddetli Yağmur',
  66: 'Dondurucu Yağmur',
  67: 'Dondurucu Yağmur',
  71: 'Hafif Kar',
  73: 'Kar Yağışı',
  75: 'Yoğun Kar',
  77: 'Kar Taneleri',
  80: 'Hafif Sağanak',
  81: 'Orta Sağanak',
  82: 'Şiddetli Sağanak',
  85: 'Hafif Kar Sağanağı',
  86: 'Yoğun Kar Sağanağı',
  95: 'Fırtına',
  96: 'Dolulu Fırtına',
  99: 'Şiddetli Fırtına'
};

const trDays = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function getTrDayName(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return trDays[d.getDay()] || '';
  } catch {
    return '';
  }
}

/**
 * MGM Günlük Tahmin Servisinden 5 günlük tahmin verisini çeker.
 */
async function fetchMgmForecast(istNo) {
  if (!istNo) return null;
  try {
    const url = `/api-mgm/web/tahminler/gunluk?istno=${istNo}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const item = data[0];
    const forecast = [];

    for (let i = 1; i <= 5; i++) {
      const tarih = item[`tarihGun${i}`];
      const enDusuk = item[`enDusukGun${i}`];
      const enYuksek = item[`enYuksekGun${i}`];
      const hadise = item[`hadiseGun${i}`];

      if (tarih) {
        const hadiseTrimmed = hadise ? hadise.trim().toUpperCase() : '';
        forecast.push({
          dayName: getTrDayName(tarih),
          date: tarih,
          minTemp: enDusuk !== undefined && enDusuk !== -9999 ? Math.round(enDusuk) : '-',
          maxTemp: enYuksek !== undefined && enYuksek !== -9999 ? Math.round(enYuksek) : '-',
          hadiseCode: hadiseTrimmed,
          description: mgmHadiseCodes[hadiseTrimmed] || hadiseTrimmed || 'Açık'
        });
      }
    }

    return forecast.length > 0 ? forecast : null;
  } catch (err) {
    console.warn('MGM tahmin servisi hatası:', err);
    return null;
  }
}

/**
 * Open-Meteo API'sinden hem anlık hem de 7 günlük yedek tahmin çeker.
 */
async function fetchOpenMeteoFallback(lat, lon, elevation) {
  const elevationParam = elevation ? `&elevation=${elevation}` : '';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}${elevationParam}&current=temperature_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo fallback hatası: ${res.status}`);
  
  const data = await res.json();
  const current = data.current;
  const daily = data.daily;
  
  const windSpeed = Number(current.wind_speed_10m).toFixed(1);

  // Parse Open-Meteo 7 daily forecast
  const fallbackForecast = [];
  if (daily && daily.time) {
    for (let i = 1; i < Math.min(daily.time.length, 6); i++) {
      const dateStr = daily.time[i];
      const wCode = daily.weather_code[i];
      fallbackForecast.push({
        dayName: getTrDayName(dateStr),
        date: dateStr,
        minTemp: Math.round(daily.temperature_2m_min[i]),
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        hadiseCode: String(wCode),
        description: wmoWeatherCodes[wCode] || 'Açık'
      });
    }
  }

  return {
    temperature: Number(current.temperature_2m).toFixed(1),
    windSpeed: windSpeed,
    weatherDescription: wmoWeatherCodes[current.weather_code] || 'Bilinmeyen Hava Durumu',
    snowDepth: 0,
    snowDepthText: '0 cm (Sezon Dışı)',
    humidity: null,
    dataSource: 'Open-Meteo (Yedek)',
    forecast: fallbackForecast,
    liftWarning: current.wind_speed_10m > 40,
    warningMessage: current.wind_speed_10m > 40 ? 'Rüzgar yüksek, liftler kapanabilir' : null,
    lastUpdated: current.time
  };
}

/**
 * Open-Meteo ve MGM servislerini birleştirerek anlık ve 5 günlük tahmin verisini çeker.
 * 
 * @param {number} lat - Enlem
 * @param {number} lon - Boylam
 * @param {number} elevation - Rakım
 * @param {number|string} mgmIstNo - MGM İstasyon Numarası
 * @returns {Promise<Object>} Birleştirilmiş hava durumu ve tahmin verisi
 */
export async function getWeatherData(lat, lon, elevation, mgmIstNo) {
  // 1. Birincil Kaynak: MGM İstasyon ve Tahmin Servisleri
  if (mgmIstNo) {
    try {
      const sondurumUrl = `/api-mgm/web/sondurumlar?istno=${mgmIstNo}`;
      
      const [sondurumRes, mgmForecast] = await Promise.all([
        fetch(sondurumUrl, { headers: { 'Accept': 'application/json' } }),
        fetchMgmForecast(mgmIstNo)
      ]);

      if (sondurumRes.ok) {
        const data = await sondurumRes.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const station = data[0];
          
          const temperature = (station.sicaklik !== undefined && station.sicaklik !== null && station.sicaklik !== -9999)
            ? Number(station.sicaklik).toFixed(1)
            : '0';

          const rawWind = (station.ruzgarHiz !== undefined && station.ruzgarHiz !== null && station.ruzgarHiz !== -9999)
            ? Number(station.ruzgarHiz).toFixed(1)
            : '0.0';
          
          const windSpeedNum = parseFloat(rawWind);
          const hadiseKodu = station.hadiseKodu ? station.hadiseKodu.trim().toUpperCase() : '';
          const weatherDescription = mgmHadiseCodes[hadiseKodu] || (hadiseKodu ? `Hadise: ${hadiseKodu}` : 'Açık');

          const rawKar = station.karYukseklik;
          let snowDepth = 0;
          let snowDepthText = '0 cm';

          if (rawKar !== undefined && rawKar !== null && rawKar !== -9999 && rawKar >= 0) {
            snowDepth = rawKar;
            snowDepthText = `${rawKar} cm`;
          } else {
            snowDepthText = '0 cm (Sezon Dışı)';
          }

          const liftWarning = windSpeedNum > 40;
          const warningMessage = liftWarning ? 'Rüzgar yüksek, liftler kapanabilir' : null;

          // Eğer MGM 5 günlük tahmin başarılı değilse, sadece tahmin için Open-Meteo'yu çağır
          let finalForecast = mgmForecast;
          if (!finalForecast || finalForecast.length === 0) {
            try {
              const fallback = await fetchOpenMeteoFallback(lat, lon, elevation);
              finalForecast = fallback.forecast;
            } catch {
              finalForecast = [];
            }
          }

          return {
            success: true,
            data: {
              temperature: temperature,
              windSpeed: rawWind,
              weatherDescription: weatherDescription,
              snowDepth: snowDepth,
              snowDepthText: snowDepthText,
              humidity: (station.nem !== undefined && station.nem !== -9999) ? station.nem : null,
              dataSource: 'MGM Canlı İstasyon',
              forecast: finalForecast || [],
              liftWarning: liftWarning,
              warningMessage: warningMessage,
              lastUpdated: station.veriZamani || new Date().toISOString()
            },
            error: null
          };
        }
      }
    } catch (mgmError) {
      console.warn('MGM Servis bağlantısı başarısız, Open-Meteo yedek servise geçiliyor:', mgmError);
    }
  }

  // 2. İkincil / Yedek Kaynak: Open-Meteo
  try {
    const fallbackData = await fetchOpenMeteoFallback(lat, lon, elevation);
    return {
      success: true,
      data: fallbackData,
      error: null
    };
  } catch (error) {
    console.error('Tüm hava durumu servisleri başarısız oldu:', error);
    return {
      success: false,
      error: 'Hava durumu verisi alınamadı.',
      data: null
    };
  }
}
