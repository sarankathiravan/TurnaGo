import { useState, useEffect } from 'react';

export interface GeolocationState {
  coords: GeolocationCoordinates | null;
  speedKmh: string;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    speedKmh: '--',
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported', loading: false }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const speedKmh = position.coords.speed !== null && position.coords.speed >= 0
          ? Math.round(position.coords.speed * 3.6).toString()
          : '--';
          
        setState({
          coords: position.coords,
          speedKmh,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(s => ({ ...s, error: error.message, loading: false }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
