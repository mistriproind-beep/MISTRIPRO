import React, { useState, useMemo } from 'react';
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
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
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
        color={i < fullStars ? '#F59E0B' : '#E2E8F0'}
        fill={i < fullStars ? '#F59E0B' : 'transparent'}
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
        <View style={[styles.avatar, { backgroundColor: worker.color }]}>
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
          <Navigation size={10} color="#4F46E5" />
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
                `Trade: ${worker.skill}\nExperience: ${worker.exp} years\nRate: ₹${worker.rate}/day\nLocation: ${worker.area}`
              )
            }
          >
            <User size={13} color="#4F46E5" />
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

  const filteredWorkers = useMemo(() => {
    if (selectedCategory === 'All') {
      return MOCK_WORKERS.filter((w) => w.available);
    }
    return MOCK_WORKERS.filter(
      (w) => w.available && (w.category === selectedCategory || w.skill.includes(selectedCategory))
    );
  }, [selectedCategory]);

  const allChips = ['All', ...CATEGORIES.map((c) => c.name)];

  // Real OpenStreetMap HTML using Leaflet.js
  const mapHtml = useMemo(() => {
    const userLat = 26.9124;
    const userLng = 75.7873;
    const workersData = JSON.stringify(
      filteredWorkers.map((w) => ({
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
      background: #E8F4F8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .user-marker {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.35);
    }
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
      color: #FFFFFF;
      font-weight: 700;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      border: 2px solid #FFFFFF;
    }
    .worker-pill {
      background: #0F172A;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 6px;
      margin-top: 1px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 2px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    }
    .popup-box {
      font-size: 12px;
      padding: 4px;
    }
    .popup-name {
      font-weight: 700;
      font-size: 13px;
      color: #0F172A;
    }
    .popup-skill {
      font-weight: 600;
      color: #4F46E5;
      font-size: 11px;
      margin-bottom: 2px;
    }
    .popup-rate {
      font-weight: 700;
      color: #059669;
      margin-top: 2px;
    }
    .popup-btn {
      display: block;
      width: 100%;
      background: #4F46E5;
      color: #FFFFFF;
      text-align: center;
      padding: 6px 10px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 11px;
      margin-top: 6px;
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
    }).setView([${userLat}, ${userLng}], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // User Location Marker
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-marker"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    L.marker([${userLat}, ${userLng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>📍 You are here</b><br/>Jaipur, Rajasthan');

    // Worker Markers
    var workers = ${workersData};
    workers.forEach(function(w) {
      if (!w.lat || !w.lng) return;
      var icon = L.divIcon({
        className: '',
        html: '<div class="worker-marker-wrap">' +
                '<div class="worker-circle" style="background-color:' + w.color + ';">' + w.avatar + '</div>' +
                '<div class="worker-pill">' + w.skill.split(' ')[0] + '</div>' +
              '</div>',
        iconSize: [36, 44],
        iconAnchor: [18, 22]
      });

      var popupHtml = '<div class="popup-box">' +
        '<div class="popup-name">' + w.name + '</div>' +
        '<div class="popup-skill">' + w.skill + '</div>' +
        '<div>⭐ ' + w.rating + ' (' + w.reviews + ' reviews)</div>' +
        '<div class="popup-rate">₹' + w.rate + '/' + w.rateType + ' • ' + w.distance + ' km</div>' +
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
  }, [filteredWorkers]);

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
          <Text style={styles.headerSubtitle}>Live OpenStreetMap view of verified mistris</Text>
        </View>
        <View style={styles.osmBadge}>
          <Globe size={13} color="#059669" />
          <Text style={styles.osmBadgeText}>OpenStreetMap</Text>
        </View>
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

        {/* ─── REAL OPENSTREETMAP CONTAINER ─── */}
        <View style={styles.mapOuterWrap}>
          <View style={styles.mapCard}>
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              style={styles.mapWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.mapLoadingOverlay}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.mapLoadingText}>Loading OpenStreetMap...</Text>
                </View>
              )}
              onMessage={handleWebViewMessage}
            />

            {/* Live Map Header Pill */}
            <View style={styles.mapLivePill}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.mapLiveText}>
                {filteredWorkers.length} Workers Plotted on Map
              </Text>
            </View>
          </View>
        </View>

        {/* Worker List Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>Nearby Workers on Map</Text>
              <Text style={styles.listCount}>
                Showing {filteredWorkers.length} available mistris
              </Text>
            </View>
            {selectedCategory !== 'All' && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={styles.resetFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredWorkers.map((worker) => (
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
  headerSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  osmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  osmBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#15803D',
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
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
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
    backgroundColor: '#E8F4F8',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetFilterText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#4F46E5',
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
    borderColor: '#4F46E5',
    backgroundColor: '#F8FAFF',
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#15803D',
  },
  workerSkill: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#4F46E5',
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  distanceText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 10,
    color: '#4F46E5',
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  viewProfileText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#4F46E5',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
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
