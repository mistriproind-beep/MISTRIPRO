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
  Modal,
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
  Layers,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { CATEGORIES } from '../data/categories';
import { MOCK_WORKERS } from '../data/mockWorkers';
import RazorpayModal from '../components/RazorpayModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function RatingStars({ rating }) {
  const fullStars = Math.floor(rating);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={12}
        color={i < fullStars ? '#EAB308' : '#CBD5E1'}
        fill={i < fullStars ? '#EAB308' : 'transparent'}
      />
    );
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

function WorkerCard({ worker, isSelected, onSelect, onOpenProfile, onProceedBooking }) {
  return (
    <TouchableOpacity
      style={[styles.workerCard, isSelected && styles.workerCardSelected]}
      onPress={() => onSelect && onSelect(worker)}
      activeOpacity={0.85}
    >
      <View style={styles.workerCardRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: worker.color || '#4F46E5' }]}>
          <Text style={styles.avatarText}>{worker.avatar}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName} numberOfLines={1}>{worker.name}</Text>
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
          <Navigation size={10} color="#059669" />
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
            onPress={() => onOpenProfile && onOpenProfile(worker)}
          >
            <User size={13} color="#4F46E5" />
            <Text style={styles.viewProfileText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookActionBtn}
            onPress={() => onProceedBooking && onProceedBooking(worker)}
          >
            <Text style={styles.bookActionText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FindWorkersScreen({
  insets,
  onBookWorker,
  onNavigateTab,
  initialCategory = 'All',
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude, areaName }
  const [isLocLoading, setIsLocLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('google'); // 'google' | 'voyager'
  const webViewRef = useRef(null);

  // Modals for Worker Details & Checkout
  const [selectedProfileWorker, setSelectedProfileWorker] = useState(null);
  const [checkoutWorker, setCheckoutWorker] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayBookingData, setRazorpayBookingData] = useState(null);

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

  // Base filtered list: Only online workers matching selected trade (Strict Uber/Ola online filter)
  const baseWorkers = useMemo(() => {
    if (selectedCategory === 'All') {
      return MOCK_WORKERS.filter((w) => w.available === true);
    }
    const catTarget = selectedCategory.toLowerCase();
    return MOCK_WORKERS.filter((w) => {
      if (w.available !== true) return false;
      const wCat = (w.category || '').toLowerCase();
      const wSkill = (w.skill || '').toLowerCase();

      if (wCat === catTarget || wCat.includes(catTarget) || catTarget.includes(wCat)) {
        return true;
      }

      const cleanTokens = catTarget
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !['and', 'for', 'the', 'other'].includes(t));

      const workerCombined = `${wCat} ${wSkill}`.toLowerCase();
      return cleanTokens.some((tok) => workerCombined.includes(tok));
    });
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

  // Live Colorful Clear Map (Google Roadmap or Apple-like Voyager)
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
        color: w.color || '#4F46E5',
        distance: w.distance,
        lat: w.lat,
        lng: w.lng,
      }))
    );

    const tileUrl =
      mapStyle === 'google'
        ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileAttr =
      mapStyle === 'google'
        ? '© Google Maps'
        : '© OpenStreetMap, © CARTO';

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

    /* Vibrant User Marker: Google Blue with pulsing live GPS radar */
    .user-marker {
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
      70% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }

    /* Colorful Apple-Style Worker Marker Pin */
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

    /* Vibrant Callout Popup */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      padding: 4px;
      background: #FFFFFF;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
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
      color: #4F46E5;
      font-size: 11px;
      margin-bottom: 4px;
    }
    .popup-rate {
      font-weight: 800;
      color: #059669;
      font-size: 13px;
      margin-top: 4px;
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

    // Live Crystal-Clear Map Layer
    L.tileLayer('${tileUrl}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3', 'a', 'b', 'c', 'd'],
      attribution: '${tileAttr}'
    }).addTo(map);

    // Real Live GPS User Location Marker
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-marker"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([${userLat}, ${userLng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>📍 Your Live Location</b><br/>${areaLabel}')
      .openPopup();

    // Worker Markers scattered around user's live position
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
  }, [liveWorkers, userLat, userLng, areaLabel, mapStyle]);

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
            <MapPin size={13} color="#2563EB" />
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {areaLabel}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Map style toggle */}
          <TouchableOpacity
            style={styles.styleToggleBtn}
            onPress={() => setMapStyle(mapStyle === 'google' ? 'voyager' : 'google')}
            activeOpacity={0.8}
          >
            <Layers size={13} color="#4F46E5" />
            <Text style={styles.styleToggleText}>Map Style</Text>
          </TouchableOpacity>

          {/* Re-center */}
          <TouchableOpacity
            style={styles.recenterBtn}
            onPress={fetchLiveLocation}
            activeOpacity={0.8}
          >
            {isLocLoading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                <LocateFixed size={13} color="#2563EB" />
                <Text style={styles.recenterBtnText}>Locate</Text>
              </>
            )}
          </TouchableOpacity>
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
            const isSelected =
              selectedCategory === chip ||
              (chip !== 'All' &&
                selectedCategory !== 'All' &&
                (chip.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                  selectedCategory.toLowerCase().includes(chip.toLowerCase())));
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

        {/* ─── LIVE VIBRANT REAL MAP CONTAINER ─── */}
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
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={styles.mapLoadingText}>Loading Live Clear Map...</Text>
                </View>
              )}
              onMessage={handleWebViewMessage}
            />

            {/* Live Map Badge Overlay */}
            <View style={styles.mapLivePill}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.mapLiveText}>
                Live Radar • {liveWorkers.length} Active Mistris
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
              onOpenProfile={(w) => setSelectedProfileWorker(w)}
              onProceedBooking={(w) => setCheckoutWorker(w)}
            />
          ))}
        </View>
      </ScrollView>

      {/* ─── WORKER DETAIL POPUP MODAL CARD ─── */}
      <Modal visible={!!selectedProfileWorker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View style={styles.modalWorkerAvatarRow}>
                <View style={[styles.avatar, { backgroundColor: selectedProfileWorker?.color || '#4F46E5', width: 48, height: 48, borderRadius: 24, marginRight: 0 }]}>
                  <Text style={[styles.avatarText, { fontSize: 17 }]}>{selectedProfileWorker?.avatar}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.modalWorkerName} numberOfLines={1}>{selectedProfileWorker?.name}</Text>
                    {selectedProfileWorker?.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>KYC ✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalWorkerSkill}>{selectedProfileWorker?.skill}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedProfileWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedProfileWorker?.rating} ★</Text>
                <Text style={styles.modalStatLabel}>{selectedProfileWorker?.reviews} reviews</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedProfileWorker?.exp} Yrs</Text>
                <Text style={styles.modalStatLabel}>Experience</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedProfileWorker?.distance} km</Text>
                <Text style={styles.modalStatLabel}>Distance</Text>
              </View>
            </View>

            <View style={styles.credentialsBox}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.credentialsText}>
                Aadhaar Verified Mistri • Escrow Safe • Police Verification Cleared
              </Text>
            </View>

            <View style={styles.modalFooterRow}>
              <View>
                <Text style={styles.modalRateLabel}>Daily Wage</Text>
                <Text style={styles.modalRateVal}>₹{selectedProfileWorker?.rate} <Text style={{ fontSize: 13, color: '#64748B' }}>/day</Text></Text>
              </View>

              <TouchableOpacity
                style={styles.modalBookBtn}
                onPress={() => {
                  const w = selectedProfileWorker;
                  setSelectedProfileWorker(null);
                  setCheckoutWorker(w);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBookBtnText}>Proceed to Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CHECKOUT & ESCROW PAYMENT SHEET ─── */}
      <Modal visible={!!checkoutWorker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Confirm Booking & Escrow</Text>
                <Text style={styles.modalSheetSub}>{checkoutWorker?.name} • {checkoutWorker?.skill}</Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>Worker Fee (1 Day)</Text>
                <Text style={styles.billVal}>₹{checkoutWorker?.rate || 950}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>Mistri Pro Platform Fee</Text>
                <Text style={styles.billVal}>₹99</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>Digital Escrow & Processing (5%)</Text>
                <Text style={styles.billVal}>₹{Math.round((checkoutWorker?.rate || 950) * 0.05)}</Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRowGrand}>
                <Text style={styles.billTotalLabel}>Total to Pay</Text>
                <Text style={styles.billTotalVal}>
                  ₹{(checkoutWorker?.rate || 950) + 99 + Math.round((checkoutWorker?.rate || 950) * 0.05)}
                </Text>
              </View>
            </View>

            <View style={styles.escrowNotice}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.escrowNoticeText}>
                Your money is held safely in Digital Escrow and only released after you confirm the work is completed onsite.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => {
                if (!checkoutWorker) return;
                const worker = checkoutWorker;
                const workerFee = Number(worker.rate || 950);
                const platformFee = 99;
                const txnFee = Math.round(workerFee * 0.05);
                const totalAmount = workerFee + platformFee + txnFee;

                const bookingDetails = {
                  workerId: worker.id,
                  workerName: worker.name,
                  workerAvatar: worker.avatar,
                  workerColor: worker.color,
                  workerPhone: worker.phone,
                  workerSkill: worker.skill,
                  category: worker.category || worker.skill,
                  title: `${worker.skill} Service`,
                  siteLocation: areaLabel,
                  scheduledDate: 'Today, Immediate',
                  duration: '1 Day',
                  workerFee,
                  platformFee,
                  transactionFee: txnFee,
                  totalAmount,
                };

                setCheckoutWorker(null);
                setRazorpayBookingData(bookingDetails);
                setShowRazorpayModal(true);
              }}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.payBtnText}>Pay & Request Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── RAZORPAY TEST MODE CHECKOUT MODAL ─── */}
      <RazorpayModal
        visible={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        bookingData={razorpayBookingData}
        onPaymentSuccess={(completedDetails) => {
          if (onBookWorker) {
            onBookWorker(completedDetails);
          }
        }}
      />
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
    color: '#2563EB',
    flex: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  styleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
  },
  styleToggleText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#4F46E5',
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
  },
  recenterBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#2563EB',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F4F8',
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
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    minWidth: 0,
    marginRight: 8,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  workerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
    flexShrink: 1,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    flexShrink: 0,
  },
  distanceText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#15803D',
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
  bookActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookActionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalSheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalWorkerAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalWorkerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  modalWorkerSkill: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12.5,
    color: '#4F46E5',
    marginTop: 2,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  modalStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatNum: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  modalStatLabel: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  credentialsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  credentialsText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#15803D',
    flex: 1,
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalRateLabel: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  modalRateVal: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#0F172A',
  },
  modalBookBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  modalBookBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalSheetTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  modalSheetSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  billBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  billItem: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12.5,
    color: '#475569',
  },
  billVal: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#0F172A',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  billRowGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 2,
  },
  billTotalLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  billTotalVal: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#4F46E5',
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  escrowNoticeText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#15803D',
    flex: 1,
    lineHeight: 15,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
  },
  payBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
