import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function ResortMap({ lat, lon, name, height = '190px' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [lon, lat],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    new maplibregl.Marker({ color: '#38bdf8' })
      .setLngLat([lon, lat])
      .addTo(map);

    return () => map.remove();
  }, [lat, lon]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-white/20"
      style={{ height }}
    />
  );
}
