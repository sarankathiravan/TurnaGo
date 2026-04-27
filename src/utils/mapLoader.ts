import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  v: 'weekly',
  libraries: ['places', 'geometry'],
});

export const loadMaps = () => importLibrary('maps');
