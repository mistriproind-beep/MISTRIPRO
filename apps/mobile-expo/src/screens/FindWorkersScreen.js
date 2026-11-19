import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  AppState,
  RefreshControl,
  Platform,
  FlatList,
} from 'react-native';
import {
  MapPin,
  Star,
  Search,
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
  List,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { CATEGORIES, translateWorkerSkill } from '../data/categories';
import LiveBackend, { getDistanceKm } from '../services/liveBackend';
import RazorpayModal from '../components/RazorpayModal';
import SiteAddressPickerModal from '../components/SiteAddressPickerModal';
import { generateGoogleWorkersMapHtml, searchLocationsWithGoogle } from '../services/googleMapsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function RatingStars({ rating }) {
  const safeRating = Number(rating) || 5;
  const fullStars = Math.floor(safeRating);
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

function WorkerCard({ worker, isSelected, onSelect, onOpenProfile, onProceedBooking, lang = 'en' }) {
  if (!worker) return null;
  return (
    <TouchableOpacity
      style={[styles.workerCard, isSelected && styles.workerCardSelected]}
      onPress={() => onSelect && onSelect(worker)}
      activeOpacity={0.85}
    >
      <View style={styles.workerCardRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: worker.color || '#4F46E5' }]}>
          <Text style={styles.avatarText}>{worker.avatar || 'W'}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName} numberOfLines={1}>{worker.name || 'Worker'}</Text>
            {worker.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>KYC ✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.workerSkill}>{translateWorkerSkill(worker.skill || worker.category, lang)}</Text>

          {/* Availability Status Badge - Single Clean Dot */}
          <View style={[styles.cardAvailBadge, worker.available ? styles.cardAvailOnline : styles.cardAvailOffline]}>
            <View style={[styles.cardAvailDot, worker.available ? styles.cardDotOnline : styles.cardDotOffline]} />
            <Text style={[styles.cardAvailText, worker.available ? styles.cardTextOnline : styles.cardTextOffline]}>
              {worker.available
                ? (lang === 'hi' ? 'ऑनलाइन' : lang === 'gu' ? 'ઓનલાઇન' : lang === 'mr' ? 'ऑनलाइन' : 'Online')
                : (lang === 'hi' ? 'ऑफलाइन' : lang === 'gu' ? 'ઑફલાઇન' : lang === 'mr' ? 'ऑफलाइन' : 'Offline')}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <RatingStars rating={worker.rating} />
            <Text style={styles.ratingText}>{worker.rating || '5.0'}</Text>
            <Text style={styles.reviewsText}>({worker.reviews ?? 0})</Text>
          </View>
        </View>

        {/* Distance Badge */}
        <View style={styles.distanceBadge}>
          <Navigation size={10} color="#059669" />
          <Text style={styles.distanceText}>{worker.distance || '2.0'} {lang === 'hi' ? 'किमी' : lang === 'gu' ? 'કિમી' : lang === 'mr' ? 'किમી' : 'km'}</Text>
        </View>
      </View>

      {/* Bottom row */}
      <View style={styles.workerCardBottom}>
        <View style={styles.verifiedRowTag}>
          <ShieldCheck size={13} color="#16A34A" />
          <Text style={styles.verifiedRowTagText}>
            {lang === 'hi' ? 'सत्यापित मिस्त्री' : 'Verified Mistri'}
          </Text>
        </View>

        <View style={styles.workerActions}>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => onOpenProfile && onOpenProfile(worker)}
          >
            <User size={13} color="#4F46E5" />
            <Text style={styles.viewProfileText}>
              {lang === 'hi' ? 'प्रोफाइल' : lang === 'gu' ? 'પ્રોફાઇલ' : lang === 'mr' ? 'प्रोफाइल' : 'Profile'}
            </Text>
          </TouchableOpacity>
          {worker.available ? (
            <TouchableOpacity
              style={styles.bookActionBtn}
              onPress={() => onProceedBooking && onProceedBooking(worker)}
            >
              <Text style={styles.bookActionText}>
                {lang === 'hi' ? 'बुक करें' : lang === 'gu' ? 'બુક કરો' : lang === 'mr' ? 'बुक करा' : 'Book'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.bookActionBtn, styles.bookActionBtnOffline]}
              onPress={() => {
                Alert.alert(
                  lang === 'hi' ? 'कारीगर ऑफलाइन है 🔴' : lang === 'gu' ? 'કારીગર ઑફલાઇન છે 🔴' : lang === 'mr' ? 'कामगार ऑफलाइन आहे 🔴' : 'Worker Offline 🔴',
                  lang === 'hi' ? `${worker.name || 'यह कारीगर'} अभी ऑफलाइन है। जब वे ऑनलाइन आएंगे तब आप बुक कर सकते हैं।` : lang === 'gu' ? `${worker.name || 'આ કારીગર'} હાલમાં ઑફલાઇન છે. જ્યારે તેઓ ઑનલાઇન આવશે ત્યારે તમે બુક કરી શકો છો.` : lang === 'mr' ? `${worker.name || 'हा कामगार'} सध्या ऑफलाइन आहे. ते ऑनलाइन आल्यावर आपण बुक करू शकता.` : `${worker.name || 'This worker'} is not available right now. You can view their verified profile or check back later.`
                );
              }}
            >
              <Text style={styles.bookActionTextOffline}>
                {lang === 'hi' ? 'ऑफलाइन' : lang === 'gu' ? 'ઑફલાઇન' : lang === 'mr' ? 'ऑफलाइन' : 'Offline'}
              </Text>
            </TouchableOpacity>
          )}
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
  workers = [],
  lang = 'en',
  t,
  customerWalletBalance = 0,
  sessionLocation,
  onUpdateSessionLocation,
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [userLocation, setUserLocation] = useState(
    sessionLocation
      ? { latitude: sessionLocation.lat, longitude: sessionLocation.lng, areaName: sessionLocation.text }
      : null
  ); // { latitude, longitude, areaName }
  const [isLocLoading, setIsLocLoading] = useState(false);
  const [mapStyle, setMapStyle] = useState('google'); // 'google' | 'voyager'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [localWorkers, setLocalWorkers] = useState(Array.isArray(workers) && workers.length > 0 ? workers : []);
  const [isSyncing, setIsSyncing] = useState(false);
  const webViewRef = useRef(null);

  // Modals for Worker Details & Checkout
  const [selectedProfileWorker, setSelectedProfileWorker] = useState(null);
  const [checkoutWorker, setCheckoutWorker] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayBookingData, setRazorpayBookingData] = useState(null);
  const [showSiteAddressPicker, setShowSiteAddressPicker] = useState(false);
  const [pendingPaidBooking, setPendingPaidBooking] = useState(null);

  // Location search modal state
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [isManualLocation, setIsManualLocation] = useState(Boolean(sessionLocation?.isManual));

  // Sync with sessionLocation if updated outside
  useEffect(() => {
    if (sessionLocation) {
      setUserLocation({
        latitude: sessionLocation.lat,
        longitude: sessionLocation.lng,
        areaName: sessionLocation.text,
      });
      setIsManualLocation(Boolean(sessionLocation.isManual));
    }
  }, [sessionLocation]);

  // Sync workers function
  const syncLiveWorkers = async () => {
    try {
      setIsSyncing(true);
      const data = await LiveBackend.fetchRealWorkers();
      if (Array.isArray(data) && data.length > 0) {
        setLocalWorkers(data);
      }
    } catch (e) {
      console.log('Worker sync error in FindWorkersScreen:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(workers) && workers.length > 0) {
      setLocalWorkers(workers);
    }
  }, [workers]);

  // Auto fetch user's real live GPS coordinates on mount & app re-open
  // Also auto-fetch all worker locations accurately every 2 hours
  useEffect(() => {
    fetchLiveLocation();
    syncLiveWorkers();

    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        fetchLiveLocation();
        syncLiveWorkers();
      }
    });

    const twoHoursMs = 2 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      console.log('[FindWorkersScreen] 2-Hour Auto-Sync: Worker Live Location & GPS');
      fetchLiveLocation();
      syncLiveWorkers();
    }, twoHoursMs);

    return () => {
      if (sub && sub.remove) sub.remove();
      clearInterval(interval);
    };
  }, []);

  const fetchLiveLocation = async () => {
    setIsLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const fallback = {
          latitude: 26.0124,
          longitude: 76.3533,
          areaName: 'Sawai Madhopur, Rajasthan',
        };
        setUserLocation(fallback);
        setIsManualLocation(false);
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
      const newLoc = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        areaName: area,
      };
      setUserLocation(newLoc);
      setIsManualLocation(false);
      if (onUpdateSessionLocation) {
        onUpdateSessionLocation({
          text: area,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          isManual: false,
        });
      }
    } catch (e) {
      console.log('Location error:', e);
      setUserLocation({
        latitude: 26.0124,
        longitude: 76.3533,
        areaName: 'Sawai Madhopur, Rajasthan',
      });
      setIsManualLocation(false);
    } finally {
      setIsLocLoading(false);
    }
  };

  const searchLocationByName = async (query) => {
    if (!query || query.trim().length < 3) {
      setLocationResults([]);
      return;
    }
    setLocationSearchLoading(true);
    try {
      const results = await searchLocationsWithGoogle(query);
      setLocationResults(results);
    } catch (e) {
      setLocationResults([]);
    } finally {
      setLocationSearchLoading(false);
    }
  };

  const handleSelectLocation = (item) => {
    const parts = (item.display_name || '').split(',');
    const mainName = parts[0]?.trim() || item.display_name;
    const cleanPrimary = (mainName || parts[0] || '').trim();
    const shortLocationName = cleanPrimary.length > 25 ? cleanPrimary.slice(0, 22) + '...' : cleanPrimary;
    const finalLoc = shortLocationName || item.display_name;
    const parsedLat = parseFloat(item.lat);
    const parsedLon = parseFloat(item.lon);

    setUserLocation({
      latitude: parsedLat,
      longitude: parsedLon,
      areaName: finalLoc,
    });
    setIsManualLocation(true);
    setShowLocationSearch(false);
    setLocationSearchQuery('');
    setLocationResults([]);

    if (onUpdateSessionLocation) {
      onUpdateSessionLocation({
        text: finalLoc,
        lat: parsedLat,
        lng: parsedLon,
        isManual: true,
      });
    }
  };

  const userLat = userLocation?.latitude || 26.0124;
  const userLng = userLocation?.longitude || 76.3533;
  const areaLabel = userLocation?.areaName || 'Detecting GPS...';

  // Base filtered list: Shows online & offline workers with status badge (Online sorted first)
  const baseWorkers = useMemo(() => {
    const liveList = Array.isArray(localWorkers) && localWorkers.length > 0 ? localWorkers : (Array.isArray(workers) ? workers : []);
    let filtered = liveList.filter(Boolean);

    // 1. Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      const catTarget = String(selectedCategory).toLowerCase();
      filtered = filtered.filter((w) => {
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
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const rawQ = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((w) => {
        const wName = (w.name || '').toLowerCase();
        const wSkill = (w.skill || '').toLowerCase();
        const wCat = (w.category || '').toLowerCase();
        const wArea = (w.area || '').toLowerCase();
        const wSkills = Array.isArray(w.skills) ? w.skills.join(' ').toLowerCase() : '';

        if (
          wName.includes(rawQ) ||
          wSkill.includes(rawQ) ||
          wCat.includes(rawQ) ||
          wArea.includes(rawQ) ||
          wSkills.includes(rawQ)
        ) {
          return true;
        }

        // Typo & synonym tolerance
        const SYNONYMS = {
          plumber: ['puber', 'pumber', 'plumb', 'pipe', 'leak', 'tap', 'nal'],
          mason: ['masn', 'maosn', 'raj', 'mistri', 'brick', 'cement'],
          electrician: ['elect', 'bijli', 'wire', 'light', 'fan'],
          carpenter: ['carpent', 'wood', 'lakdi', 'furniture'],
          painter: ['paint', 'paintr', 'color', 'rang'],
          welder: ['weld', 'loha', 'iron'],
        };
        for (const [trade, keywords] of Object.entries(SYNONYMS)) {
          if (keywords.some((kw) => rawQ.includes(kw) || kw.includes(rawQ))) {
            if (wCat.includes(trade) || wSkill.includes(trade)) return true;
          }
        }
        return false;
      });
    }

    // Sort: Online workers first, then offline workers
    return [...filtered].sort((a, b) => {
      const aAvail = Boolean(a?.available);
      const bAvail = Boolean(b?.available);
      if (aAvail === bAvail) return 0;
      return aAvail ? -1 : 1;
    });
  }, [selectedCategory, searchQuery, localWorkers, workers]);

  // Dynamically place workers with REAL live GPS distance calculation
  const liveWorkers = useMemo(() => {
    const list = baseWorkers.map((w, index) => {
      if (!w) return null;
      let lat = w.latitude ?? w.lat;
      let lng = w.longitude ?? w.lng;
      let distance;

      if (lat && lng) {
        distance = getDistanceKm(userLat, userLng, lat, lng).toFixed(1);
      } else {
        const count = baseWorkers.length || 1;
        const angle = (index * 2 * Math.PI) / count;
        const radius = 0.012 + (index % 5) * 0.01; // ~1.2km to ~5.5km
        lat = userLat + radius * Math.cos(angle);
        lng = userLng + radius * Math.sin(angle);
        distance = (radius * 111).toFixed(1);
      }

      return {
        ...w,
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        distance,
      };
    }).filter(Boolean);

    // If workers are within 25km, show them. Otherwise show all available workers sorted by closest distance
    const withinRange = list.filter((w) => parseFloat(w.distance || '0') <= 25);
    const finalList = withinRange.length > 0 ? withinRange : list;

    // Strictly sort: ALL online workers first (nearest distance first), ALL offline workers strictly at the end
    return finalList.sort((a, b) => {
      const aAvail = Boolean(a.available);
      const bAvail = Boolean(b.available);
      if (aAvail && !bAvail) return -1;
      if (!aAvail && bAvail) return 1;
      const distA = parseFloat(a.distance) || 999;
      const distB = parseFloat(b.distance) || 999;
      return distA - distB;
    });
  }, [baseWorkers, userLat, userLng]);

  const allChips = ['All', ...CATEGORIES.map((c) => c.name)];

  // Live Colorful Clear Google Maps with Live Mistri Radar Markers
  const mapHtml = useMemo(() => {
    const workersData = JSON.stringify(
      liveWorkers.map((w) => ({
        id: w.id,
        name: w.name || 'Verified Mistri',
        skill: w.skill || 'Labour',
        rate: Number(w.rate) || 800,
        rateType: w.rateType || 'day',
        rating: w.rating || 5.0,
        reviews: w.reviews || 0,
        phone: w.phone || '',
        avatar: w.avatar || 'W',
        color: w.color || '#4F46E5',
        distance: w.distance || '2.0',
        lat: w.lat,
        lng: w.lng,
        available: Boolean(w.available),
        bookingFee: 99,
      }))
    );

    return generateGoogleWorkersMapHtml({
      userLat,
      userLng,
      areaLabel,
      workersData,
    });
  }, [liveWorkers, userLat, userLng, areaLabel]);

  const handleWebViewMessage = (event) => {
    try {
      if (!event?.nativeEvent?.data) return;
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CALL') {
        Linking.openURL('tel:+919829012345').catch(() => {
          Alert.alert('Company Helpline', 'Calling MistriPro Helpline at +91 98290 12345');
        });
      } else if (data.type === 'SELECT_WORKER' && data.id) {
        setSelectedWorkerId(data.id);
      } else if (data.type === 'OFFLINE_ALERT') {
        Alert.alert(
          'Worker Offline 🔴',
          `${data.name || 'This worker'} is not available right now. You can view their verified profile or check back later.`
        );
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
          <Text style={styles.headerTitle}>
            {lang === 'hi' ? 'कारीगर खोजें' : lang === 'gu' ? 'કારીગરો શોધો' : lang === 'mr' ? 'कामगार शोधा' : 'Find Workers'}
          </Text>
          <TouchableOpacity
            style={styles.locationSubRow}
            activeOpacity={0.7}
            onPress={() => setShowLocationSearch(true)}
          >
            <MapPin size={13} color={isManualLocation ? '#4F46E5' : '#16A34A'} />
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {areaLabel}
            </Text>
            {isManualLocation && (
              <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: 'Satoshi-Bold', color: '#4F46E5' }}>
                  {lang === 'hi' ? 'चुना हुआ' : 'Selected'}
                </Text>
              </View>
            )}
            <ChevronDown size={13} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRightActions}>
          {/* Refresh / Re-center GPS & Worker Sync */}
          <TouchableOpacity
            style={styles.recenterBtn}
            onPress={() => {
              fetchLiveLocation();
              syncLiveWorkers();
            }}
            activeOpacity={0.8}
          >
            {isLocLoading || isSyncing ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                <RefreshCw size={13} color="#2563EB" />
                <Text style={styles.recenterBtnText}>
                  {lang === 'hi' ? 'रिफ्रेश' : lang === 'gu' ? 'રિફ્રેશ' : lang === 'mr' ? 'रिफ्रेश' : 'Sync'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets?.bottom || 34) + 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isLocLoading || isSyncing}
            onRefresh={() => {
              fetchLiveLocation();
              syncLiveWorkers();
            }}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchBarWrap}>
          <View style={styles.searchBar}>
            <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                lang === 'hi'
                  ? 'कारीगर, मिस्त्री, कार्य खोजें...'
                  : lang === 'gu'
                  ? 'કારીગર, મિસ્ત્રી, કાર્ય શોધો...'
                  : lang === 'mr'
                  ? 'कारागीर, मिस्त्री, काम शोधा...'
                  : 'Search by worker name, skill, category...'
              }
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={15} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {allChips.map((chip) => {
            const isSelected =
              Boolean(selectedCategory) &&
              (selectedCategory === chip ||
                (chip !== 'All' &&
                  selectedCategory !== 'All' &&
                  typeof selectedCategory === 'string' &&
                  (chip.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                    selectedCategory.toLowerCase().includes(chip.toLowerCase()))));
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

        {/* View Mode Switcher: Workers List (Default) vs Live Map */}
        <View style={styles.viewModeRow}>
          <TouchableOpacity
            style={[styles.viewModeTab, viewMode === 'list' && styles.viewModeTabActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <List size={14} color={viewMode === 'list' ? '#4F46E5' : '#64748B'} />
            <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>
              {lang === 'hi'
                ? `कारीगर सूची (${liveWorkers.filter((w) => w.available).length} ऑनलाइन)`
                : lang === 'gu'
                ? `કારીગરો યાદી (${liveWorkers.filter((w) => w.available).length} ઑનલાઇન)`
                : lang === 'mr'
                ? `कामगार यादी (${liveWorkers.filter((w) => w.available).length} ऑनलाइन)`
                : `Workers List (${liveWorkers.filter((w) => w.available).length} Online)`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeTab, viewMode === 'map' && styles.viewModeTabActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
          >
            <Compass size={14} color={viewMode === 'map' ? '#4F46E5' : '#64748B'} />
            <Text style={[styles.viewModeText, viewMode === 'map' && styles.viewModeTextActive]}>
              {lang === 'hi' ? 'लाइव रडार मैप' : lang === 'gu' ? 'લાઇવ રડાર નકશો' : lang === 'mr' ? 'लाइव्ह रडार नकाशा' : 'Live Radar Map'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── LIVE VIBRANT REAL MAP CONTAINER (Shown only when Live Radar Map tab is clicked) ─── */}
        {viewMode === 'map' && (
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
                  Live Radar • {liveWorkers.filter((w) => w.available).length} Online ({liveWorkers.length} Total)
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Worker List Section - Appears Directly in List under Search & Categories */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                {lang === 'hi' ? 'आसपास के कारीगर' : lang === 'gu' ? 'નજીકના કારીગરો' : lang === 'mr' ? 'जवळचे कामगार' : 'Nearby Mistris'}
              </Text>
              <Text style={styles.listCount}>
                {lang === 'hi'
                  ? `${liveWorkers.filter((w) => w.available).length} ऑनलाइन • ${liveWorkers.length} कुल कारीगर`
                  : lang === 'gu'
                  ? `${liveWorkers.filter((w) => w.available).length} ઑનલાઇન • ${liveWorkers.length} કુલ કારીગરો`
                  : lang === 'mr'
                  ? `${liveWorkers.filter((w) => w.available).length} ऑनलाइन • ${liveWorkers.length} एकूण कामगार`
                  : `${liveWorkers.filter((w) => w.available).length} online • ${liveWorkers.length} total mistris`}
              </Text>
            </View>
            {(selectedCategory !== 'All' || searchQuery.trim().length > 0) && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetFilterText}>
                  {lang === 'hi' ? 'फ़िल्टर हटाएं' : lang === 'gu' ? 'ફિલ્ટર હટાવો' : lang === 'mr' ? 'फिल्टर काढा' : 'Clear Filter'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {liveWorkers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>👷‍♂️</Text>
              <Text style={styles.emptyTitle}>No Workers Found</Text>
              <Text style={styles.emptySub}>
                No workers match your filter or search query. Try clearing filters to view all nearby mistris.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearBtnText}>Show All Mistris</Text>
              </TouchableOpacity>
            </View>
          ) : (
            liveWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                lang={lang}
                isSelected={selectedWorkerId === worker.id}
                onSelect={(w) => setSelectedWorkerId(w.id)}
                onOpenProfile={(w) => setSelectedProfileWorker(w)}
                onProceedBooking={(w) => setCheckoutWorker(w)}
              />
            ))
          )}
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
                  <Text style={styles.modalWorkerSkill}>{translateWorkerSkill(selectedProfileWorker?.skill || selectedProfileWorker?.category, lang)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedProfileWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedProfileWorker?.rating} ★</Text>
                <Text style={styles.modalStatLabel}>{selectedProfileWorker?.reviews} {lang === 'hi' ? 'समीक्षाएं' : lang === 'gu' ? 'રિવ્યુઝ' : lang === 'mr' ? 'अभिप्राय' : 'reviews'}</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedProfileWorker?.exp} {lang === 'hi' ? 'साल' : lang === 'gu' ? 'વર્ષ' : lang === 'mr' ? 'वर्षे' : 'Yrs'}</Text>
                <Text style={styles.modalStatLabel}>{lang === 'hi' ? 'अनुभव' : lang === 'gu' ? 'અનુભવ' : lang === 'mr' ? 'अनुभव' : 'Experience'}</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedProfileWorker?.distance} {lang === 'hi' ? 'किमी' : lang === 'gu' ? 'કિમી' : lang === 'mr' ? 'किમી' : 'km'}</Text>
                <Text style={styles.modalStatLabel}>{lang === 'hi' ? 'दूरी' : lang === 'gu' ? 'અંતર' : lang === 'mr' ? 'अंतर' : 'Distance'}</Text>
              </View>
            </View>

            <View style={styles.credentialsBox}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.credentialsText}>
                {lang === 'hi' ? 'आधार सत्यापित मिस्त्री • रेज़रपे सुरक्षित' : lang === 'gu' ? 'આધાર ચકાસાયેલ મિસ્ત્રી • રેઝરપે સુરક્ષિત' : lang === 'mr' ? 'आधार सत्यापित मिस्त्री • रेझरपे सुरक्षित' : 'Aadhaar Verified Mistri • Razorpay Protected'}
              </Text>
            </View>

            {!selectedProfileWorker?.available && (
              <View style={styles.modalOfflineNotice}>
                <Text style={styles.modalOfflineNoticeText}>
                  {lang === 'hi' ? '⚠️ यह मिस्त्री अभी ऑफलाइन है। जब वे ऑनलाइन आएंगे तब बुकिंग संभव होगी।' : lang === 'gu' ? '⚠️ આ મિસ્ત્રી હાલમાં ઑફલાઇન છે. તેઓ ઑનલાઇન આવશે ત્યારે બુકિંગ શક્ય બનશે.' : lang === 'mr' ? '⚠️ हा मिस्त्री सध्या ऑफलाइन आहे. ते ऑनलाइन आल्यावर बुकिंग शक्य होईल.' : '⚠️ This mistri is currently OFFLINE / Not Available Right Now. Direct booking will resume when they go online.'}
                </Text>
              </View>
            )}

            <View style={styles.modalFooterRow}>
              <View>
                <Text style={styles.modalRateLabel}>{lang === 'hi' ? 'दैनिक मजदूरी' : lang === 'gu' ? 'દૈનિક વેતન' : lang === 'mr' ? 'दैनिक मजुरी' : 'Daily Wage'}</Text>
                <Text style={styles.modalRateVal}>₹{selectedProfileWorker?.rate} <Text style={{ fontSize: 13, color: '#64748B' }}>/{lang === 'hi' ? 'दिन' : lang === 'gu' ? 'દિવસ' : lang === 'mr' ? 'दिवस' : 'day'}</Text></Text>
              </View>

              {selectedProfileWorker?.available ? (
                <TouchableOpacity
                  style={styles.modalBookBtn}
                  onPress={() => {
                    const targetWorker = selectedProfileWorker;
                    setSelectedProfileWorker(null);
                    setCheckoutWorker(targetWorker);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBookBtnText}>{lang === 'hi' ? 'आगे बढ़ें और बुक करें' : lang === 'gu' ? 'આગળ વધો અને બુક કરો' : lang === 'mr' ? 'पुढे जा आणि बुक करा' : 'Proceed to Book'}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalBookBtn, { backgroundColor: '#94A3B8' }]}
                  onPress={() => {
                    Alert.alert(
                      lang === 'hi' ? 'कारीगर ऑफलाइन है' : lang === 'gu' ? 'કારીગર ઑફલાઇન છે' : lang === 'mr' ? 'कामगार ऑफलाइन आहे' : 'Worker Currently Offline',
                      `${selectedProfileWorker?.name} ${lang === 'hi' ? 'अभी बुकिंग के लिए उपलब्ध नहीं हैं।' : lang === 'gu' ? 'હાલમાં બુકિંગ માટે ઉપલબ્ધ નથી.' : lang === 'mr' ? 'सध्या बुकिंगसाठी उपलब्ध नाहीत.' : 'is currently not available for instant booking.'}`
                    );
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBookBtnText}>{lang === 'hi' ? 'अभी ऑफलाइन हैं' : lang === 'gu' ? 'હાલમાં ઑફલાઇન છે' : lang === 'mr' ? 'સध्या ऑफलाइन आहेत' : 'Currently Offline'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CHECKOUT & SECURE PAYMENT SHEET ─── */}
      <Modal visible={!!checkoutWorker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Confirm Booking & Pay</Text>
                <Text style={styles.modalSheetSub}>{checkoutWorker?.name} • {checkoutWorker?.skill}</Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>
                  {lang === 'hi' ? 'बुकिंग शुल्क (साइट निरीक्षण)' : 'Booking Charge (Site Inspection)'}
                </Text>
                <Text style={styles.billVal}>₹99</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>
                  {lang === 'hi' ? 'काम का वास्तविक खर्च' : 'Actual Work Price'}
                </Text>
                <Text style={[styles.billVal, { color: '#059669', fontWeight: '700' }]}>
                  {lang === 'hi' ? 'साइट देखकर तय होगा' : 'Decided On-Site'}
                </Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRowGrand}>
                <Text style={styles.billTotalLabel}>
                  {lang === 'hi' ? 'अभी देय बुकिंग राशि' : 'Total Booking Charge'}
                </Text>
                <Text style={styles.billTotalVal}>₹99</Text>
              </View>
            </View>

            <View style={styles.escrowNotice}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.escrowNoticeText}>
                {lang === 'hi'
                  ? '100% सुरक्षित: आप अभी केवल ₹99 बुकिंग शुल्क दे रहे हैं। मिस्त्री आपकी साइट पर आकर काम देखकर उचित रेट तय करेंगे।'
                  : '100% Protected: You only pay ₹99 booking charge. The mistri visits your site and quotes work price directly.'}
              </Text>
            </View>

            {/* Virtual Wallet 1-Tap Option */}
            {customerWalletBalance >= 99 ? (
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: '#059669', marginBottom: 10 }]}
                onPress={() => {
                  Alert.alert(
                    lang === 'hi' ? 'वर्चुअल वॉलेट से भुगतान करें? 💰' : 'Pay via Virtual Wallet? 💰',
                    lang === 'hi'
                      ? `आपके पास MistriPro वर्चुअल वॉलेट में ₹${customerWalletBalance} शेष हैं।\n\nइस बुकिंग के लिए ₹99 वॉलेट से कटेंगे (अतिरिक्त कोई ऑनलाइन भुगतान नहीं करना होगा)।`
                      : `You have ₹${customerWalletBalance} in your MistriPro Virtual Wallet.\n\n₹99 booking charge will be deducted from your wallet balance.`,
                    [
                      { text: lang === 'hi' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
                      {
                        text: lang === 'hi' ? 'हाँ, वॉलेट से बुक करें (₹0)' : 'Yes, Book via Wallet',
                        onPress: () => {
                          const worker = checkoutWorker;
                          setCheckoutWorker(null);
                          const walletBookingPayload = {
                            workerId: worker.id,
                            workerName: worker.name || 'Verified Mistri',
                            workerAvatar: worker.avatar || 'W',
                            workerColor: worker.color || '#4F46E5',
                            workerPhone: '+91 98290 12345',
                            workerSkill: worker.skill || 'Labour Service',
                            category: worker.category || worker.skill || 'Labour Service',
                            title: `${worker.skill || 'Labour'} Site Inspection`,
                            siteLocation: areaLabel,
                            scheduledDate: 'Today, Immediate',
                            duration: 'Site Inspection & On-site Quote',
                            bookingFee: 99,
                            workerFee: 0,
                            platformFee: 99,
                            txnFee: 0,
                            totalAmount: 99,
                            pricingModel: 'ON_SITE_QUOTE',
                            paidViaWallet: true,
                          };
                          setPendingPaidBooking(walletBookingPayload);
                          setShowSiteAddressPicker(true);
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.payBtnText}>
                  {lang === 'hi'
                    ? `वर्चुअल वॉलेट से बुक करें (₹${customerWalletBalance} उपलब्ध)`
                    : `Pay via Virtual Wallet (₹${customerWalletBalance} Avail)`}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.payBtn, customerWalletBalance >= 99 && { backgroundColor: '#4F46E5' }]}
              onPress={() => {
                if (!checkoutWorker) return;
                const worker = checkoutWorker;
                const bookingDetails = {
                  workerId: worker.id,
                  workerName: worker.name || 'Verified Mistri',
                  workerAvatar: worker.avatar || 'W',
                  workerColor: worker.color || '#4F46E5',
                  workerPhone: '+91 98290 12345',
                  workerSkill: worker.skill || 'Labour Service',
                  category: worker.category || worker.skill || 'Labour Service',
                  title: `${worker.skill || 'Labour'} Site Inspection`,
                  siteLocation: areaLabel,
                  scheduledDate: 'Today, Immediate',
                  duration: 'Site Inspection & On-site Quote',
                  bookingFee: 99,
                  workerFee: 0,
                  platformFee: 99,
                  txnFee: 0,
                  totalAmount: 99,
                  pricingModel: 'ON_SITE_QUOTE',
                };

                setCheckoutWorker(null);
                setRazorpayBookingData(bookingDetails);
                setShowRazorpayModal(true);
              }}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.payBtnText}>
                {customerWalletBalance >= 99
                  ? (lang === 'hi' ? 'रेज़रपे ऑनलाइन भुगतान' : 'Pay via Razorpay')
                  : (lang === 'hi' ? 'भुगतान करें और बुक करें' : 'Pay ₹99 Booking Fee')}
              </Text>
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
          setShowRazorpayModal(false);
          setPendingPaidBooking(completedDetails);
          setShowSiteAddressPicker(true);
        }}
      />

      {/* ─── POST-PAYMENT EXACT SITE LOCATION & ADDRESS PICKER MODAL ─── */}
      <SiteAddressPickerModal
        visible={showSiteAddressPicker}
        onClose={() => {
          setShowSiteAddressPicker(false);
          setPendingPaidBooking(null);
        }}
        initialLocation={{ text: areaLabel, lat: userLat, lng: userLng }}
        lang={lang}
        onConfirmSiteAddress={(siteData) => {
          setShowSiteAddressPicker(false);
          if (onBookWorker && pendingPaidBooking) {
            onBookWorker({
              ...pendingPaidBooking,
              siteAddress: siteData.siteAddress,
              siteLocation: siteData.siteLocation,
              siteCoordinates: siteData.siteCoordinates,
              siteContactPerson: siteData.siteContactPerson,
              siteContactPhone: siteData.siteContactPhone,
            });
          }
          setPendingPaidBooking(null);
        }}
      />

      {/* ─── LOCATION SEARCH MODAL (Shared Session-Only Location Picker) ─── */}
      <Modal
        visible={showLocationSearch}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowLocationSearch(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: (insets?.top || (Platform?.OS === 'ios' ? 44 : 20)) }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' }}>
            <TouchableOpacity onPress={() => setShowLocationSearch(false)} style={{ padding: 4, marginRight: 10 }}>
              <ArrowLeft size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Satoshi-Bold', color: '#0F172A' }}>
                {lang === 'hi' ? 'स्थान बदलें' : 'Change Location'}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: 'Satoshi-Regular', color: '#64748B' }}>
                {lang === 'hi' ? 'ऐप रीलोड होने तक यह स्थान मान्य रहेगा' : 'Active for this app session'}
              </Text>
            </View>
          </View>

          {/* Search Box */}
          <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Search size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#0F172A' }}
                placeholder={lang === 'hi' ? 'शहर, कस्बा, कॉलोनी खोजें...' : 'Search city, town, area...'}
                placeholderTextColor="#94A3B8"
                value={locationSearchQuery}
                onChangeText={(text) => {
                  setLocationSearchQuery(text);
                  searchLocationByName(text);
                }}
                autoFocus
              />
              {locationSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setLocationSearchQuery(''); setLocationResults([]); }}>
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Live GPS Reset Button */}
          <TouchableOpacity
            onPress={() => {
              setShowLocationSearch(false);
              fetchLiveLocation();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', margin: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0' }}
            activeOpacity={0.8}
          >
            <Compass size={20} color="#16A34A" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontFamily: 'Satoshi-Bold', color: '#15803D' }}>
                {lang === 'hi' ? 'वर्तमान GPS स्थान का उपयोग करें' : 'Use Current Live GPS Location'}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: 'Satoshi-Regular', color: '#166534' }}>
                {lang === 'hi' ? 'डिवाइस का सटीक स्थान स्वतः पहचानें' : 'Automatically detect live device coordinates'}
              </Text>
            </View>
          </TouchableOpacity>

          {locationSearchLoading && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator color="#4F46E5" size="small" />
              <Text style={{ marginTop: 8, color: '#64748B', fontFamily: 'Satoshi-Regular', fontSize: 12 }}>
                {lang === 'hi' ? 'स्थान खोज रहे हैं...' : 'Searching locations...'}
              </Text>
            </View>
          )}

          {/* Results List */}
          <FlatList
            data={locationResults}
            keyExtractor={(item, index) => `${item.place_id || index}`}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            renderItem={({ item }) => {
              const parts = (item.display_name || '').split(',');
              const mainName = parts[0]?.trim() || item.display_name;
              const subName = parts.slice(1, 3).join(',').trim();
              return (
                <TouchableOpacity
                  onPress={() => handleSelectLocation(item)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' }}
                  activeOpacity={0.7}
                >
                  <MapPin size={18} color="#4F46E5" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Satoshi-Bold', color: '#0F172A' }}>{mainName}</Text>
                    {subName ? <Text style={{ fontSize: 11, fontFamily: 'Satoshi-Regular', color: '#64748B' }}>{subName}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
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
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 13.5,
    color: '#0F172A',
    padding: 0,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  clearBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  chipsScroll: {
    marginTop: 10,
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
  verifiedRowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  verifiedRowTagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10.5,
    color: '#15803D',
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
  bookActionBtnOffline: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookActionTextOffline: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#94A3B8',
  },
  viewModeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    gap: 8,
  },
  viewModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewModeTabActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  viewModeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#64748B',
  },
  viewModeTextActive: {
    color: '#4F46E5',
  },
  cardAvailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 2,
  },
  cardAvailOnline: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  cardAvailOffline: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cardAvailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardDotOnline: {
    backgroundColor: '#16A34A',
  },
  cardDotOffline: {
    backgroundColor: '#EF4444',
  },
  cardAvailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
  },
  cardTextOnline: {
    color: '#15803D',
  },
  cardTextOffline: {
    color: '#DC2626',
  },
  modalOfflineNotice: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  modalOfflineNoticeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
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
