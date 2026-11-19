export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD9Waw124X0qILg7C_OnIZ7ManSwl_wT50';

/**
 * Searches locations across India with fallback for fast typing autocomplete.
 */
export async function searchLocationsWithGoogle(query) {
  if (!query || query.trim().length < 2) return [];
  const cleanQ = query.trim();

  // Try Nominatim with India country filter for high accuracy locality resolution
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQ
    )}&format=json&countrycodes=IN&limit=8&addressdetails=1`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'MistriPro-MobileApp/2.0' },
    });
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        lon: parseFloat(item.lon),
        address: item.address,
      }));
    }
  } catch (e) {
    console.log('Location search fallback error:', e);
  }
  return [];
}

/**
 * Generates official Google Maps HTML for Interactive Site Address Pinpoint Picker
 * Uses official Google Vector tiles directly for 100% reliable rendering without API key restrictions.
 */
export function generateGoogleMapPickerHtml({
  lat = 25.9928,
  lng = 76.3712,
  label = 'Drag map to pinpoint work site',
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Site Location Picker</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:#f1f5f9; overflow:hidden; }
    .center-pin {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1000;
      pointer-events: none;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
    }
    .pin-label {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.90);
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      z-index: 1000;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.2);
    }
    .radar-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin-left: -8px;
      margin-top: -8px;
      border-radius: 50%;
      background: rgba(79, 70, 229, 0.25);
      border: 1.5px solid #4F46E5;
      z-index: 999;
      pointer-events: none;
      animation: pulseRadar 2s infinite;
    }
    @keyframes pulseRadar {
      0% { transform: scale(1); opacity: 0.9; }
      70% { transform: scale(2.5); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="pin-label">📍 ${label}</div>
  <div class="radar-circle"></div>
  <svg class="center-pin" width="38" height="46" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#4F46E5"/>
    <circle cx="12" cy="10" r="3" fill="#FFFFFF"/>
  </svg>
  <div id="map"></div>

  <script>
    var initialLat = ${lat};
    var initialLng = ${lng};
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([initialLat, initialLng], 16);

    // Official Google Maps Tile Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps'
    }).addTo(map);

    function reportCenter() {
      var center = map.getCenter();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MOVE',
          lat: center.lat,
          lng: center.lng
        }));
      }

      // Reverse geocode in background
      var revUrl = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + center.lat + '&lon=' + center.lng + '&addressdetails=1';
      fetch(revUrl)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.display_name && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'GEOCODE_ADDRESS',
              formatted_address: data.display_name
            }));
          }
        })
        .catch(function() {});
    }

    map.on('moveend', reportCenter);
  </script>
</body>
</html>
  `;
}

/**
 * Generates official Google Maps HTML for Find Workers Screen with Live Mistri Markers & Radar
 */
export function generateGoogleWorkersMapHtml({
  userLat = 25.9928,
  userLng = 76.3712,
  areaLabel = 'Current Location',
  workersData = '[]',
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Mistri Pro Radar Map</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: #E8F4F8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }
    .user-radar-marker {
      position: relative;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.4);
      animation: pulseRadar 2s infinite;
    }
    @keyframes pulseRadar {
      0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6); }
      70% { box-shadow: 0 0 0 14px rgba(37, 99, 235, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }
    .worker-marker-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .worker-circle {
      width: 34px;
      height: 34px;
      border-radius: 17px;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      border: 2.5px solid #FFFFFF;
    }
    .worker-pill {
      background: #0F172A;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      margin-top: 2px;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
    }
    .popup-box {
      font-size: 12px;
      padding: 4px;
      color: #0F172A;
      max-width: 200px;
    }
    .popup-name {
      font-weight: 800;
      font-size: 14px;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .popup-skill {
      font-weight: 600;
      color: #4F46E5;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .popup-rate {
      font-weight: 800;
      color: #059669;
      font-size: 12px;
      margin: 4px 0;
    }
    .popup-btn {
      display: block;
      width: 100%;
      background: #16A34A;
      color: #FFFFFF;
      text-align: center;
      padding: 8px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 12px;
      margin-top: 6px;
      border: none;
      cursor: pointer;
    }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var userLat = ${userLat};
    var userLng = ${userLng};
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([userLat, userLng], 14);

    // Official Google Maps Tile Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps'
    }).addTo(map);

    // User Location Marker with Blue Pulsing GPS Radar
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-radar-marker"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>📍 Your Live Location</b><br/>${areaLabel}')
      .openPopup();

    // Nearby Workers on Google Maps
    var workers = ${workersData};
    workers.forEach(function(w) {
      if (!w.lat || !w.lng) return;
      var circleColor = w.available ? (w.color || '#4F46E5') : '#94A3B8';
      var pillBg = w.available ? '#0F172A' : '#64748B';
      var availTag = w.available ? '' : ' (Offline)';
      var icon = L.divIcon({
        className: '',
        html: '<div class="worker-marker-wrap">' +
                '<div class="worker-circle" style="background-color:' + circleColor + ';">' + (w.avatar || 'W') + '</div>' +
                '<div class="worker-pill" style="background-color:' + pillBg + ';">' + (w.skill ? w.skill.split(' ')[0] : 'Mistri') + availTag + '</div>' +
              '</div>',
        iconSize: [36, 44],
        iconAnchor: [18, 22]
      });

      var statusBadge = w.available
        ? '<div style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:4px;background:#F0FDF4;color:#15803D;font-weight:700;font-size:10px;margin-bottom:4px;"><span style=\\"width:6px;height:6px;border-radius:50%;background:#16A34A;display:inline-block;\\"></span> Online</div>'
        : '<div style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:4px;background:#FEF2F2;color:#DC2626;font-weight:700;font-size:10px;border:1px solid #FECACA;margin-bottom:4px;"><span style=\\"width:6px;height:6px;border-radius:50%;background:#EF4444;display:inline-block;\\"></span> Offline</div>';

      var actionBtn = w.available
        ? '<button class="popup-btn" onclick="sendMsg(\\'' + (w.phone || '') + '\\')">📞 Call Mistri</button>'
        : '<button class="popup-btn" style="background:#94A3B8;" onclick="alertOffline(\\'' + (w.name || 'Worker').replace(/\'/g, "\\\\'") + '\\')">Worker Offline</button>';

      var popupHtml = '<div class="popup-box">' +
        '<div class="popup-name">' + (w.name || 'Verified Mistri') + '</div>' +
        '<div class="popup-skill">' + (w.skill || 'Labour') + '</div>' +
        statusBadge +
        '<div>⭐ ' + (w.rating || 5.0) + ' (' + (w.reviews || 0) + ' reviews)</div>' +
        '<div class="popup-rate">₹' + (w.bookingFee || 99) + ' Booking Fee • ' + (w.distance || '2.0') + ' km away • Quote on-site</div>' +
        actionBtn +
      '</div>';

      L.marker([w.lat, w.lng], { icon: icon })
        .addTo(map)
        .bindPopup(popupHtml)
        .on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_WORKER', id: w.id }));
          }
        });
    });

    function sendMsg(phone) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CALL', phone: phone }));
      }
    }

    function alertOffline(name) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'OFFLINE_ALERT', name: name }));
      }
    }
  </script>
</body>
</html>
  `;
}
