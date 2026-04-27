export function haversineDistance(a: google.maps.LatLng, b: google.maps.LatLng): number {
  const R = 6371000; // Radius of the Earth in meters
  const lat1 = (a.lat() * Math.PI) / 180;
  const lat2 = (b.lat() * Math.PI) / 180;
  const deltaLat = ((b.lat() - a.lat()) * Math.PI) / 180;
  const deltaLng = ((b.lng() - a.lng()) * Math.PI) / 180;

  const aVal =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return R * c; // Distance in meters
}
