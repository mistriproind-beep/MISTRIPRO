import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  MapPin,
  Star,
  Phone,
  User,
  Navigation,
  Globe,
  Compass,
  LocateFixed,
  RefreshCw,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { CATEGORIES } from '../data/categories';
import { MOCK_WORKERS } from '../data/mockWorkers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function RatingStars({ rating }) {
  const fullStars = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={12}
        color={i < fullStars ? '#0F172A' : '#CBD5E1'}
        fill={i < fullStars ? '#0F172A' : 'transparent'}
      />
    );
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

function WorkerCard({ worker, isSelected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.workerCard, isSelected && styles.workerCardSelected]}
      onPress={() => onSelect && onSelect(worker)}
      activeOpacity={0.85}
    >
      <View style={styles.workerCardRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: worker.color || '#0F172A' }]}>
          <Text style={styles.avatarText}>{worker.avatar}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>KYC ✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.workerSkill}>{worker.skill}</Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={worker.rating} />
            <Text style={styles.ratingText}>{worker.rating}</Text>
            <Text style={styles.reviewsText}>({worker.reviews})</Text>
          </View>
        </View>

        {/* Distance Badge */}
        <View style={styles.distanceBadge}>
          <Navigation size={10} color="#0F172A" />
          <Text style={styles.distanceText}>{worker.distance} km</Text>
        </View>
      </View>

      {/* Bottom row */}
      <View style={styles.workerCardBottom}>
        <View style={styles.rateContainer}>
          <Text style={styles.rateAmount}>₹{worker.rate}</Text>
          <Text style={styles.rateType}>/{worker.rateType}</Text>
        </View>

        <View style={styles.workerActions}>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() =>
              Alert.alert(
                worker.name,
                `Trade: ${worker.skill}\nExperience: ${worker.exp} years\nRate: ₹${worker.rate}/day\nAvailable for immediate site booking.`
              )
            }
          >
            <User size={13} color="#0F172A" />
            <Text style={styles.viewProfileText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${worker.phone}`)}
          >
            <Phone size={13} color="#FFFFFF" />
            <Text style={styles.callText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FindWorkersScreen({ insets }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude, areaName }
  const [isLocLoading, setIsLocLoading] = useState(true);
  const webViewRef = useRef(null);

  // Auto fetch user's real live GPS coordinates on mount
  useEffect(() => {
    fetchLiveLocation();
  }, []);

  const fetchLiveLocation = async () => {
    setIsLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation({
          latitude: 26.0124,
          longitude: 76.3533,
          areaName: 'Sawai Madhopur, Rajasthan',
        });
        setIsLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const rev = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      let area = 'Current Location';
      if (rev && rev.length > 0) {
        const place = rev[0];
        const locality = place.district || place.subregion || place.city || '';
        const sub = place.name || place.street || '';
        area = sub ? `${sub}, ${locality}` : locality || 'Current Location';
      }
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        areaName: area,
      });
    } catch (e) {
      console.log('Location error:', e);
      setUserLocation({
        latitude: 26.0124,
        longitude: 76.3533,
        areaName: 'Sawai Madhopur, Rajasthan',
      });
    } finally {
      setIsLocLoading(false);
    }
  };

  const userLat = userLocation?.latitude || 26.0124;
  const userLng = userLocation?.longitude || 76.3533;
  const areaLabel = userLocation?.areaName || 'Detecting GPS...';

  // Base filtered list
  const baseWorkers = useMemo(() => {
    if (selectedCategory === 'All') {
      return MOCK_WORKERS.filter((w) => w.available);
    }
    return MOCK_WORKERS.filter(
      (w) => w.available && (w.category === selectedCategory || w.skill.includes(selectedCategory))
    );
  }, [selectedCategory]);

  // Dynamically place workers around the user's REAL live GPS location
  const liveWorkers = useMemo(() => {
    return baseWorkers.map((w, index) => {
      // Scatter workers realistically within 1 to 7 km of the user's exact coordinates
      const angle = (index * 2 * Math.PI) / baseWorkers.length;
      const radius = 0.012 + (index % 5) * 0.01; // ~1.2km to ~5.5km
      const lat = userLat + radius * Math.cos(angle);
      const lng = userLng + radius * Math.sin(angle);
      const distance = (radius * 111).toFixed(1);
      return {
        ...w,
        lat,
        lng,
        distance,
      };
    });
  }, [baseWorkers, userLat, userLng]);

  const allChips = ['All', ...CATEGORIES.map((c) => c.name)];

  // Real Black and White Leaflet Map with CartoDB Positron / Grayscale OpenStreetMap
  const mapHtml = useMemo(() => {
    const workersData = JSON.stringify(
      liveWorkers.map((w) => ({
        id: w.id,
        name: w.name,
        skill: w.skill,
        rate: w.rate,
        rateType: w.rateType,
        rating: w.rating,
        reviews: w.reviews,
        phone: w.phone,
        avatar: w.avatar,
        color: w.color,
        distance: w.distance,
        lat: w.lat,
        lng: w.lng,
      }))
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* PURE BLACK AND WHITE / MONOCHROME TILE FILTER */
    .leaflet-tile-pane {
      filter: grayscale(100%) contrast(120%) brightness(96%);
      -webkit-filter: grayscale(100%) contrast(120%) brightness(96%);
    }

    /* Real GPS User Marker: Black circle with white border & pulsing radar */
    .user-marker {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #0F172A;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 5px rgba(15, 23, 42, 0.3);
      animation: pulseRadar 2s infinite;
    }
    @keyframes pulseRadar {
      0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.5); }
      70% { box-shadow: 0 0 0 10px rgba(15, 23, 42, 0); }
      100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
    }

    /* B&W Worker Marker Pin */
    .worker-marker-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .worker-circle {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      border: 2px solid #FFFFFF;
    }
    .worker-pill {
      background: #000000;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 6px;
      margin-top: 2px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.4);
    }

    /* B&W Callout Popup */
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 4px;
      background: #FFFFFF;
      border: 1px solid #0F172A;
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }
    .popup-box {
      font-size: 12px;
      padding: 4px;
      color: #0F172A;
    }
    .popup-name {
      font-weight: 800;
      font-size: 14px;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .popup-skill {
      font-weight: 600;
      color: #475569;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .popup-rate {
      font-weight: 800;
      color: #0F172A;
      font-size: 13px;
      margin-top: 4px;
    }
    .popup-btn {
      display: block;
      width: 100%;
      background: #0F172A;
      color: #FFFFFF;
      text-align: center;
      padding: 7px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 11px;
      margin-top: 8px;
      border: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView([${userLat}, ${userLng}], 13);

    // CartoDB Positron Black & White Real Map Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap, © CARTO'
    }).addTo(map);

    // Real Live GPS User Location Marker
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-marker"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    L.marker([${userLat}, ${userLng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>📍 Your Live GPS Location</b><br/>${areaLabel}')
      .openPopup();

    // Worker Markers scattered around user's live position
    var workers = ${workersData};
    workers.forEach(function(w) {
      if (!w.lat || !w.lng) return;
      var icon = L.divIcon({
        className: '',
        html: '<div class="worker-marker-wrap">' +
                '<div class="worker-circle" style="background-color:' + (w.color || '#0F172A') + ';">' + w.avatar + '</div>' +
                '<div class="worker-pill">' + w.skill.split(' ')[0] + '</div>' +
              '</div>',
        iconSize: [36, 44],
        iconAnchor: [18, 22]
      });

      var popupHtml = '<div class="popup-box">' +
        '<div class="popup-name">' + w.name + '</div>' +
        '<div class="popup-skill">' + w.skill + '</div>' +
        '<div>⭐ ' + w.rating + ' (' + w.reviews + ' reviews)</div>' +
        '<div class="popup-rate">₹' + w.rate + '/' + w.rateType + ' • ' + w.distance + ' km away</div>' +
        '<button class="popup-btn" onclick="sendMsg(\\'' + w.phone + '\\')">📞 Call Mistri</button>' +
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
  </script>
</body>
</html>
`;
  }, [liveWorkers, userLat, userLng, areaLabel]);

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CALL' && data.phone) {
        Linking.openURL(`tel:${data.phone}`);
      } else if (data.type === 'SELECT_WORKER' && data.id) {
        setSelectedWorkerId(data.id);
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.headerTitle}>Find Workers</Text>
          <View style={styles.locationSubRow}>
            <MapPin size={12} color="#0F172A" />
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {areaLabel}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={fetchLiveLocation}
          activeOpacity={0.8}
        >
          {isLocLoading ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <>
              <LocateFixed size={14} color="#0F172A" />
              <Text style={styles.recenterBtnText}>Live GPS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets?.bottom || 34) + 110 }}
      >
        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {allChips.map((chip) => {
            const isSelected = selectedCategory === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                ]}
                onPress={() => setSelectedCategory(chip)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                  numberOfLines={1}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── BLACK & WHITE REAL MAP CONTAINER ─── */}
        <View style={styles.mapOuterWrap}>
          <View style={styles.mapCard}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.mapWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="large" color="#0F172A" />
                  <Text style={styles.mapLoadingText}>Loading B&W Real Map...</Text>
                </View>
              )}
              onMessage={handleWebViewMessage}
            />

            {/* Live B&W Map Badge Overlay */}
            <View style={styles.mapLivePill}>
              <View style={styles.blackLiveDot} />
              <Text style={styles.mapLiveText}>
                ⚫ Black & White Real Map • {liveWorkers.length} Mistris
              </Text>
            </View>
          </View>
        </View>

        {/* Worker List Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Workers Near Your Location</Text>
              <Text style={styles.listCount}>
                Showing {liveWorkers.length} available mistris around {areaLabel.split(',')[0]}
              </Text>
            </View>
            {selectedCategory !== 'All' && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={styles.resetFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {liveWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              isSelected={selectedWorkerId === worker.id}
              onSelect={(w) => setSelectedWorkerId(w.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeftCol: {
    flex: 1,
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 22,
    color: '#0F172A',
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#0F172A',
    flex: 1,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  recenterBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  chipsScroll: {
    marginTop: 12,
    marginBottom: 10,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },
  chipTextUnselected: {
    color: '#475569',
  },
  mapOuterWrap: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mapCard: {
    height: 330,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapLoadingText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  mapLivePill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blackLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  mapLiveText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  listSection: {
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: '#0F172A',
  },
  listCount: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  resetFilterBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetFilterText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#0F172A',
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  workerCardSelected: {
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  workerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  workerInfo: {
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#0F172A',
  },
  workerSkill: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#0F172A',
    marginLeft: 2,
  },
  reviewsText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  distanceText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#0F172A',
  },
  workerCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateAmount: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  rateType: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginLeft: 2,
  },
  workerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  viewProfileText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#0F172A',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  callText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
});
