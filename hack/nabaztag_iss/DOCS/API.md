# API Documentation

## Where The ISS At API

This project uses the **Where The ISS At** API to fetch real-time International Space Station position data.

### Base URL

```
https://api.wheretheiss.at/v1/satellites/25544
```

### Endpoint

**GET** `/v1/satellites/25544`

Returns current position and velocity data for the International Space Station (NORAD ID: 25544).

### Response Format

The API returns a JSON object with the following fields:

```json
{
  "name": "iss",
  "id": 25544,
  "latitude": 51.5074,
  "longitude": -0.1278,
  "altitude": 408.0,
  "velocity": 27600.0,
  "visibility": "daylight",
  "footprint": 4446.0,
  "timestamp": 1234567890,
  "daynum": 2459123.5,
  "solar_lat": 23.5,
  "solar_lon": 180.0,
  "units": "kilometers"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Satellite name ("iss") |
| `id` | number | NORAD catalog number (25544 for ISS) |
| `latitude` | number | Current latitude in degrees (-90 to 90) |
| `longitude` | number | Current longitude in degrees (-180 to 180) |
| `altitude` | number | Altitude above sea level in kilometers |
| `velocity` | number | Velocity in kilometers per hour |
| `visibility` | string | Current visibility state ("daylight" or "eclipsed") |
| `footprint` | number | Radius of visibility footprint in kilometers |
| `timestamp` | number | Unix timestamp of the position data |
| `daynum` | number | Julian day number |
| `solar_lat` | number | Solar latitude |
| `solar_lon` | number | Solar longitude |
| `units` | string | Unit system used ("kilometers") |

### Usage in This Project

The application uses only the `latitude` and `longitude` fields:

```javascript
const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
const data = await response.json();
const { latitude, longitude } = data;
```

### Rate Limits

- **No API key required**
- **Rate limit**: Reasonable use (updates every 5 seconds is acceptable)
- **Free tier**: Suitable for personal and educational projects

### Error Handling

The API may return standard HTTP error codes:

- `200 OK`: Success
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

**Example error handling:**

```javascript
try {
    const response = await fetch(issApiUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Process data...
} catch (error) {
    console.error('Error fetching ISS position:', error);
    // Handle error...
}
```

### CORS Policy

The API supports Cross-Origin Resource Sharing (CORS), allowing direct browser requests without a proxy server.

### Additional Endpoints

The Where The ISS At API provides additional endpoints:

- **GET** `/v1/satellites` - List all tracked satellites
- **GET** `/v1/satellites/{id}` - Get data for specific satellite
- **GET** `/v1/satellites/{id}/positions` - Get position history

### Official Documentation

For complete API documentation, visit:
- **Website**: https://wheretheiss.at/
- **API Docs**: https://wheretheiss.at/w/developer

### Example Request

```bash
curl https://api.wheretheiss.at/v1/satellites/25544
```

### Example Response

```json
{
  "name": "iss",
  "id": 25544,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "altitude": 408.5,
  "velocity": 27600.0,
  "visibility": "daylight",
  "footprint": 4446.0,
  "timestamp": 1704067200,
  "daynum": 2460300.5,
  "solar_lat": -23.5,
  "solar_lon": 180.0,
  "units": "kilometers"
}
```

## Leaflet Map API

This project uses Leaflet.js for map rendering. While not an external API, here's how it's configured:

### Map Initialization

```javascript
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    tap: true,
    tapTolerance: 15,
    zoomDelta: 0.25,
    zoomSnap: 0.25
}).setView([46.2, 2.2], 3);
```

### Tile Layer

Uses OpenStreetMap tiles:

```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 2
}).addTo(map);
```

### Marker Updates

```javascript
const newLatLng = L.latLng(latitude, longitude);
issMarker.setLatLng(newLatLng);
map.panTo(newLatLng, { animate: true, duration: 1 });
```

### Leaflet Documentation

- **Official Docs**: https://leafletjs.com/
- **API Reference**: https://leafletjs.com/reference.html

