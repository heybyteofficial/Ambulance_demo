import { useEffect, useRef, useState } from 'react';
import './Crew.scss';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
let mapsPromise;

function loadGoogleMaps() {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (!API_KEY) return Promise.reject(new Error('Add VITE_GOOGLE_MAPS_API_KEY to .env.local.'));
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__ambulanceGoogleMapsLoaded';
    const script = document.createElement('script');
    window[callbackName] = () => {
      const maps = window.google?.maps;
      delete window[callbackName];
      if (maps?.importLibrary) resolve(maps);
      else reject(new Error('Google Maps loaded without the Maps JavaScript API.'));
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window[callbackName];
      reject(new Error('Google Maps could not be loaded. Check the API key and network.'));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    mapsPromise = null;
    throw error;
  });

  return mapsPromise;
}

export default function LiveMap({ location }) {
  const elementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const locationRef = useRef(location);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then((maps) => Promise.all([
        maps.importLibrary('maps'),
        maps.importLibrary('marker'),
      ]))
      .then(([mapsLibrary, markerLibrary]) => {
        if (!active || !elementRef.current) return;
        const currentLocation = locationRef.current;
        const center = currentLocation
          ? { lat: currentLocation.lat, lng: currentLocation.lng }
          : { lat: 17.0007, lng: 81.804 };
        const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
        const map = new mapsLibrary.Map(elementRef.current, {
          center,
          zoom: currentLocation ? 16 : 12,
          disableDefaultUI: true,
          zoomControl: true,
          mapId,
          gestureHandling: 'cooperative',
        });
        mapRef.current = map;
        markerRef.current = new markerLibrary.AdvancedMarkerElement({
          map,
          position: center,
          title: 'Ambulance live location',
        });
      })
      .catch((error) => {
        if (active) setMapError(error.message);
      });

    return () => {
      active = false;
      markerRef.current = null;
      mapRef.current = null;
    };
    // Load the map once; location changes are handled by the next effect.
  }, []);

  useEffect(() => {
    locationRef.current = location;
    if (!location || !mapRef.current || !markerRef.current) return;
    const position = { lat: location.lat, lng: location.lng };
    markerRef.current.position = position;
    mapRef.current.setCenter(position);
  }, [location]);

  return (
    <div className="crew-map">
      <div className="crew-map__canvas" ref={elementRef} aria-label="Live ambulance map" />
      {mapError && (
        <div className="crew-map__message" role="status">
          <i className="bi bi-map" />
          <strong>Map unavailable</strong>
          <span>{mapError}</span>
        </div>
      )}
      {!location && !mapError && (
        <div className="crew-map__waiting">
          <i className="bi bi-crosshair" /> Waiting for GPS
        </div>
      )}
    </div>
  );
}
