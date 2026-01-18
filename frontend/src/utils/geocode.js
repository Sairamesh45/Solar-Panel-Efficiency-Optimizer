// Utility to fetch lat/lon from Open-Meteo geocoding API
export async function fetchLatLonFromLocation(location) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch coordinates');
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
      name: data.results[0].name,
      country: data.results[0].country
    };
  } else {
    throw new Error('No coordinates found for this location');
  }
}
