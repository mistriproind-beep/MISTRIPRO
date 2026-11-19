import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  AppState,
} from 'react-native';
import {
  Bell,
  MapPin,
  ChevronDown,
  Search,
  Star,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ChevronUp,
  Navigation,
} from 'lucide-react-native';
import * as Location from 'expo-location';

import {
  CATEGORIES,
  CATEGORY_GROUPS,
  getCategoryDisplayName,
  getCategoryGroupLabel,
  translateWorkerSkill,
  translateLocationName,
} from '../data/categories';
import RazorpayModal from '../components/RazorpayModal';

/* ─── helpers ─── */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const shortName = (full) => {
  if (!full || typeof full !== 'string') return '';
  const cleaned = full.split('(')[0].split('/')[0].trim();
  if (cleaned.includes('Tile')) return 'Tile Worker';
  if (cleaned.includes('POP')) return 'POP Ceiling';
  if (cleaned.includes('Glass')) return 'Glass Work';
  if (cleaned.includes('Cleaning')) return 'Cleaning';
  if (cleaned.includes('Earth')) return 'Earth Worker';
  const words = cleaned.split(' ');
  if (words.length <= 2) return cleaned;
  if (words[1] === '&' && words[2]) return `${words[0]} & ${words[2]}`;
  return words.slice(0, 2).join(' ');
};

const shortCity = (loc) => {
  if (!loc || typeof loc !== 'string') return '';
  const first = loc.split(',')[0].trim();
  return first.length > 20 ? first.slice(0, 18) + '...' : first;
};

export default function CustomerHomeScreen({
  insets,
  onNavigateTab,
  onBookWorker,
  onOpenNotifications,
  notificationsCount = 0,
  workers = [],
  userName = 'User',
  lang = 'en',
  t,
  customerWalletBalance = 0,
}) {
  const [locationText, setLocationText] = useState('Sawai Madhopur, Rajasthan');
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  // Modals for Worker Details, Checkout & Razorpay
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [checkoutWorker, setCheckoutWorker] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayBookingData, setRazorpayBookingData] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [userLat, setUserLat] = useState(25.9928);
  const [userLon, setUserLon] = useState(76.3712);
  const [distanceRange, setDistanceRange] = useState(10);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);

  const userInitials = useMemo(() => {
    const clean = (typeof userName === 'string' ? userName : 'User').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'US';
  }, [userName]);

  /* Live GPS Detection Function - Always called on app launch and app re-open */
  const detectAndApplyCurrentGpsLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (loc && loc.coords) {
        setUserLat(loc.coords.latitude);
        setUserLon(loc.coords.longitude);
        setIsManualLocation(false);

        const rev = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (rev && rev.length > 0) {
          const place = rev[0];
          const area = place.subregion || place.district || place.city || place.name || 'Sawai Madhopur';
          const st = place.region || 'Rajasthan';
          setLocationText(`${area}, ${st}`);
        }
      }
    } catch (err) {
      console.log('GPS error:', err);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // 1. Initial Launch / Mount: Always detect and apply current device GPS location
  useEffect(() => {
    detectAndApplyCurrentGpsLocation();
  }, [detectAndApplyCurrentGpsLocation]);

  // 2. App Re-open / Foreground Resume: Automatically reset to current live GPS location
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        detectAndApplyCurrentGpsLocation();
      }
    });
    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, [detectAndApplyCurrentGpsLocation]);

  const filteredCategories =
    activeGroup === 'all'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.group === activeGroup);

  // Location search via Nominatim
  const searchLocationByName = async (query) => {
    if (!query || query.trim().length < 3) {
      setLocationResults([]);
      return;
    }
    setLocationSearchLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&countrycodes=IN&limit=7&addressdetails=1`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'MistriProApp/1.0 (contact@mistripro.com)' },
      });
      if (!resp.ok) throw new Error('Network error');
      const data = await resp.json();
      setLocationResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Location search error:', e?.message);
      setLocationResults([]);
    } finally {
      setLocationSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationSearchQuery.trim().length >= 3) {
        searchLocationByName(locationSearchQuery);
      } else {
        setLocationResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  // Concise 8 categories unless "See All" is clicked
  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 8);

  // Live Dropdown Suggestions for the Search Bar
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return { categories: [], workers: [], totalCount: 0 };
    const q = searchQuery.toLowerCase().trim();

    // 1. Matching categories (including trade synonyms & common misspellings)
    const matchingCategories = (CATEGORIES || []).filter((c) => {
      if (!c) return false;
      const name = (c.name || '').toLowerCase();
      const short = shortName(c.name).toLowerCase();
      const synonyms = {
        plumber: ['puber', 'pumber', 'plumb', 'pipe', 'leak', 'tap', 'nal'],
        mason: ['masn', 'maosn', 'raj', 'mistri', 'brick', 'cement'],
        electrician: ['elect', 'bijli', 'wire', 'light', 'fan'],
        carpenter: ['carpent', 'wood', 'lakdi', 'furniture'],
        painter: ['paint', 'paintr', 'color', 'rang'],
        welder: ['weld', 'loha', 'iron'],
      };
      let matchSyn = false;
      for (const [key, list] of Object.entries(synonyms)) {
        if (list.some((syn) => q.includes(syn) || syn.includes(q))) {
          if (name.includes(key)) matchSyn = true;
        }
      }
      return name.includes(q) || short.includes(q) || matchSyn;
    }).slice(0, 4);

    // 2. Matching workers (online first, but also finding offline workers)
    const liveList = Array.isArray(workers) ? workers : [];
    const matchingWorkers = liveList
      .filter((w) => {
        if (!w) return false;
        const wName = (w.name || '').toLowerCase();
        const wSkill = (w.skill || '').toLowerCase();
        const wCat = (w.category || '').toLowerCase();
        const wSkills = Array.isArray(w.skills) ? w.skills.join(' ').toLowerCase() : '';
        return (
          wName.includes(q) ||
          wSkill.includes(q) ||
          wCat.includes(q) ||
          wSkills.includes(q)
        );
      })
      .sort((a, b) => {
        const aAvail = Boolean(a?.available);
        const bAvail = Boolean(b?.available);
        if (aAvail === bAvail) return 0;
        return aAvail ? -1 : 1;
      })
      .slice(0, 3);

    return {
      categories: matchingCategories,
      workers: matchingWorkers,
      totalCount: matchingCategories.length + matchingWorkers.length,
    };
  }, [searchQuery, workers]);

  // Filter Workers: Online & Offline workers with status badge, calculated live GPS distance
  const nearbyWorkersWithDist = useMemo(() => {
    const liveList = Array.isArray(workers) ? workers : [];
    const currentLat = userLat || 25.9928;
    const currentLon = userLon || 76.3712;

    const filtered = liveList.filter((w) => {
      if (!w) return false;
      // 1. Category selection filter (e.g., clicking Mason shows only Masons)
      if (selectedCategory) {
        const catTarget = String(selectedCategory).toLowerCase();
        const wCat = (w.category || '').toLowerCase();
        const wSkill = (w.skill || '').toLowerCase();

        // Exact match or substring contains
        let isMatch = wCat === catTarget || wCat.includes(catTarget) || catTarget.includes(wCat);

        if (!isMatch) {
          // Tokenize category words (length >= 3, excluding stopwords)
          const cleanTokens = catTarget
            .replace(/[^a-z0-9]/g, ' ')
            .split(/\s+/)
            .filter((t) => t.length >= 3 && !['and', 'for', 'the', 'other'].includes(t));

          const workerCombined = `${wCat} ${wSkill}`.toLowerCase();
          isMatch = cleanTokens.some((tok) => workerCombined.includes(tok));
        }

        if (!isMatch) return false;
      }

      // 2. Search query filter (Tag-aware + Typo-tolerant: e.g. "puber" -> Plumber)
      if (searchQuery.trim()) {
        const rawQ = searchQuery.toLowerCase().trim();
        const wName = (w.name || '').toLowerCase();
        const wSkill = (w.skill || '').toLowerCase();
        const wCat = (w.category || '').toLowerCase();
        const wArea = (w.area || '').toLowerCase();
        const wSkills = Array.isArray(w.skills) ? w.skills.join(' ').toLowerCase() : '';

        // Direct substring check
        let matches =
          wName.includes(rawQ) ||
          wSkill.includes(rawQ) ||
          wCat.includes(rawQ) ||
          wArea.includes(rawQ) ||
          wSkills.includes(rawQ);

        // Smart trade tag & typo mapping (e.g. "puber", "pipe", "leak" -> plumber)
        if (!matches) {
          const SYNONYMS = {
            plumber: ['puber', 'pumber', 'plumb', 'pipe', 'leak', 'tap', 'nal', 'fitting', 'sanitary'],
            mason: ['masn', 'maosn', 'raj', 'mistri', 'brick', 'cement', 'wall', 'chunaee', 'mortar'],
            electrician: ['elect', 'bijli', 'wire', 'wiring', 'switch', 'light', 'fan', 'fuse', 'mcb'],
            carpenter: ['carpent', 'wood', 'furniture', 'door', 'table', 'lakdi', 'shuttering'],
            tile: ['tile', 'marble', 'floor', 'flooring', 'granite', 'stone'],
            painter: ['paint', 'paintr', 'wall paint', 'color', 'putti', 'distemper'],
            welder: ['weld', 'loha', 'iron', 'gate', 'grill', 'fabricat'],
            'ac technician': ['ac', 'aircon', 'cooler', 'cooling'],
            cleaning: ['clean', 'safai', 'housekeep', 'dusting'],
          };

          for (const [trade, keywords] of Object.entries(SYNONYMS)) {
            if (keywords.some((kw) => rawQ.includes(kw) || kw.includes(rawQ))) {
              if (wCat.includes(trade) || wSkill.includes(trade)) {
                matches = true;
                break;
              }
            }
          }
        }

        if (!matches) return false;
      }

      return true;
    });

    // Calculate real live distance for every worker from customer GPS
    const mapped = filtered.map((worker) => {
      const wLat = worker.latitude ?? worker.lat ?? 25.9928;
      const wLon = worker.longitude ?? worker.lng ?? 76.3712;
      const dist = getDistanceKm(currentLat, currentLon, wLat, wLon);
      return {
        ...worker,
        latitude: wLat,
        longitude: wLon,
        lat: wLat,
        lng: wLon,
        computedDistance: dist,
        distance: dist.toFixed(1),
      };
    });

    // Sort: Online workers first, then closest live distance first
    return mapped.sort((a, b) => {
      const aAvail = Boolean(a?.available);
      const bAvail = Boolean(b?.available);
      if (aAvail !== bAvail) return aAvail ? -1 : 1;
      return (a.computedDistance || 0) - (b.computedDistance || 0);
    });
  }, [searchQuery, selectedCategory, workers, userLat, userLon]);

  // Filtered by strict 20km perimeter (Requests never go to other cities/states beyond 20km)
  const nearbyWorkers10km = useMemo(() => {
    // Only workers strictly within 20km are eligible
    const within20km = nearbyWorkersWithDist.filter((w) => (w.computedDistance ?? 0) <= 20);
    if (distanceRange === 10) {
      return within20km.filter((w) => (w.computedDistance ?? 0) <= 10);
    }
    return within20km;
  }, [nearbyWorkersWithDist, distanceRange]);

  const handleProceedToBooking = (worker) => {
    setSelectedWorker(null);
    setCheckoutWorker(worker);
  };

  const handleConfirmBooking = () => {
    if (!checkoutWorker) return;
    const worker = checkoutWorker;
    const bookingFee = 99;
    const totalAmount = bookingFee;

    const bookingDetails = {
      workerId: worker.id,
      workerName: worker.name,
      workerAvatar: worker.avatar,
      workerColor: worker.color,
      workerPhone: '+91 98290 12345', // Protected: customer reaches Company Helpline
      workerSkill: worker.skill,
      category: worker.category || worker.skill,
      title: `${worker.skill} Site Inspection`,
      siteLocation: locationText,
      scheduledDate: 'Today, Immediate',
      duration: 'Site Inspection & On-site Quote',
      bookingFee,
      workerFee: 0,
      platformFee: bookingFee,
      txnFee: 0,
      totalAmount,
      pricingModel: 'ON_SITE_QUOTE',
    };

    setCheckoutWorker(null);
    setRazorpayBookingData(bookingDetails);
    setShowRazorpayModal(true);
  };

  const renderCategoryItem = useCallback(
    ({ item }) => {
      const catLabel = getCategoryDisplayName(item, lang);
      const isSelected = selectedCategory === item.name;
      return (
        <TouchableOpacity
          style={styles.categoryItem}
          activeOpacity={0.7}
          onPress={() => {
            setSelectedCategory((prev) => (prev === item.name ? null : item.name));
          }}
        >
          <View
            style={[
              styles.categoryIconCircle,
              {
                backgroundColor: isSelected
                  ? '#4F46E5'
                  : item.group === 'construction'
                  ? '#EEF2FF'
                  : item.group === 'technical'
                  ? '#F0FDFA'
                  : '#FFF7ED',
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? '#3730A3' : 'rgba(226, 232, 240, 0.6)',
              },
            ]}
          >
            <Text style={styles.categoryEmoji}>{item.icon}</Text>
          </View>
          <Text
            style={[
              styles.categoryLabel,
              isSelected && { color: '#4F46E5', fontFamily: 'Satoshi-Bold' },
            ]}
            numberOfLines={2}
          >
            {catLabel}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCategory, lang],
  );

  const renderWorkerCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.workerCard}
        activeOpacity={0.85}
        onPress={() => setSelectedWorker(item)}
      >
        {/* Avatar */}
        <View style={[styles.workerAvatar, { backgroundColor: item?.color || '#4F46E5' }]}>
          <Text style={styles.workerAvatarText}>{item?.avatar || 'W'}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName} numberOfLines={1}>{item?.name || 'Worker'}</Text>
            {item?.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.workerSkill}>{translateWorkerSkill(item?.skill || item?.category, lang)}</Text>
          {/* Availability Status Badge */}
          <View style={[styles.cardAvailBadge, item?.available ? styles.cardAvailOnline : styles.cardAvailOffline]}>
            <View style={[styles.cardAvailDot, item?.available ? styles.cardDotOnline : styles.cardDotOffline]} />
            <Text style={[styles.cardAvailText, item?.available ? styles.cardTextOnline : styles.cardTextOffline]}>
              {item?.available
                ? (lang === 'hi' ? 'ऑनलाइन' : lang === 'gu' ? 'ઓનલાઇન' : lang === 'mr' ? 'ऑनलाइन' : 'Online')
                : (lang === 'hi' ? 'ऑफलाइन' : lang === 'gu' ? 'ઑફલાઇન' : lang === 'mr' ? 'ऑफलाइन' : 'Offline')}
            </Text>
          </View>
          <View style={styles.workerMeta}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.workerRating}>{item?.rating || '5.0'}</Text>
            <Text style={styles.workerReviews}>({item?.reviews ?? 0})</Text>
            <View style={styles.metaDot} />
            <Text style={styles.workerRate}>₹{item?.bookingFee || 99} <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>{lang === 'hi' ? 'विजिट' : 'Visit'}</Text></Text>
          </View>
          <Text style={{ fontSize: 10, color: '#059669', fontWeight: '600', marginTop: 2 }}>
            • {lang === 'hi' ? 'काम का रेट साइट विजिट पर तय होगा' : lang === 'gu' ? 'કામનો દર સાઇટ મુલાકાત પર નક્કી થશે' : lang === 'mr' ? 'कामाचा दर साइट भेटीवर ठरेल' : 'Work price decided on-site'}
          </Text>
        </View>

        {/* Right side */}
        <View style={styles.workerRight}>
          <View style={styles.distanceBadge}>
            <MapPin size={11} color="#4F46E5" />
            <Text style={styles.distanceText}>{item?.distance || '2.0'} {lang === 'hi' ? 'किमी' : lang === 'gu' ? 'કિમી' : lang === 'mr' ? 'किमी' : 'km'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.hireBtn, !item?.available && styles.hireBtnOffline]}
            activeOpacity={0.8}
            onPress={() => {
              if (item?.available) {
                setSelectedWorker(item);
              } else {
                Alert.alert(
                  lang === 'hi' ? 'कारीगर ऑफलाइन है 🔴' : lang === 'gu' ? 'કારીગર ઑફલાઇન છે 🔴' : lang === 'mr' ? 'कामगार ऑफलाइन आहे 🔴' : 'Worker Offline 🔴',
                  lang === 'hi' ? `${item?.name || 'यह कारीगर'} अभी ऑफलाइन है। जब वे ऑनलाइन आएंगे तब आप बुक कर सकते हैं।` : lang === 'gu' ? `${item?.name || 'આ કારીગર'} હાલમાં ઑફલાઇન છે. જ્યારે તેઓ ઑનલાઇન આવશે ત્યારે તમે બુક કરી શકો છો.` : lang === 'mr' ? `${item?.name || 'हा कामगार'} सध्या ऑफलाइन आहे. ते ऑनलाइन आल्यावर आपण बुक करू शकता.` : `${item?.name || 'This worker'} is not available right now. You can view their verified profile or check back later.`
                );
              }
            }}
          >
            <Text style={[styles.hireBtnText, !item?.available && styles.hireBtnTextOffline]}>
              {item?.available
                ? (lang === 'hi' ? 'बुक करें' : lang === 'gu' ? 'બુક કરો' : lang === 'mr' ? 'बुक करा' : 'Book')
                : (lang === 'hi' ? 'ऑफलाइन' : lang === 'gu' ? 'ઑફલાઇન' : lang === 'mr' ? 'ऑफलाइन' : 'Offline')}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [lang],
  );

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── 1. Header Bar ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.avatarCircle}
              activeOpacity={0.7}
              onPress={() => onNavigateTab && onNavigateTab('PROFILE')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigateTab && onNavigateTab('PROFILE')}
            >
              <Text style={styles.greetingSub}>
                {lang === 'hi' ? 'शुभ प्रभात 👋' : lang === 'gu' ? 'શુભ સવાર 👋' : lang === 'mr' ? 'शुभ प्रभात 👋' : 'Good morning 👋'}
              </Text>
              <Text style={styles.greetingName}>
                {lang === 'hi' ? `नमस्ते, ${userName || 'उपयोगकर्ता'}!` : lang === 'gu' ? `નમસ્તે, ${userName || 'વપરાશકર્તા'}!` : lang === 'mr' ? `नमस्कार, ${userName || 'वापरकर्ता'}!` : `Hello, ${userName || 'User'}!`}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.bellWrapper}
            activeOpacity={0.7}
            onPress={onOpenNotifications}
          >
            <Bell size={22} color="#0F172A" />
            {notificationsCount > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* ─── 2. Location Picker ─── */}
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.75} onPress={() => setShowLocationSearch(true)}>
          <MapPin size={15} color={isManualLocation ? '#4F46E5' : '#16A34A'} />
          {locationLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginLeft: 4 }} />
          ) : (
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {translateLocationName(locationText, lang)}
            </Text>
          )}
          {isManualLocation && (
            <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexShrink: 0 }}>
              <Text style={{ fontSize: 9, fontFamily: 'Satoshi-Bold', color: '#4F46E5' }}>
                {lang === 'hi' ? 'चुना हुआ' : lang === 'gu' ? 'પસંદ કરેલ' : lang === 'mr' ? 'निवडलेले' : 'Selected'}
              </Text>
            </View>
          )}
          <ChevronDown size={14} color="#64748B" style={{ flexShrink: 0 }} />
        </TouchableOpacity>

        {/* ─── 3. Main Hero Card with Search ─── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>
            {lang === 'hi' ? 'आज आपको किस कारीगर की जरूरत है?' : lang === 'gu' ? 'આજે તમને કયા કારીગરની જરૂર છે?' : lang === 'mr' ? 'आज आपल्याला कोणत्या कामगाराची गरज आहे?' : 'Which worker do you need today?'}
          </Text>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={lang === 'hi' ? 'मिस्त्री, प्लंबर, इलेक्ट्रीशियन खोजें...' : lang === 'gu' ? 'કડિયા, પ્લમ્બર, ઇલેક્ટ્રિશિયન શોધો...' : lang === 'mr' ? 'गवंडी, प्लंबर, इलेक्ट्रिशियन शोधा...' : 'Search mason, plumber, electrician...'}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Instant Search Suggestions Dropdown (Direct 1-Tap to Find Tab) */}
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchDropdownCard}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderText}>Suggestions • Tap to Open on Map</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.dropdownCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {searchSuggestions.totalCount === 0 ? (
                <View style={styles.emptySuggestionRow}>
                  <Text style={styles.emptySuggestionText}>No online trade found for "{searchQuery}"</Text>
                </View>
              ) : (
                <>
                  {/* Categories suggestions */}
                  {searchSuggestions.categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.suggestionRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        const targetCategory = cat.name;
                        setSearchQuery('');
                        if (onNavigateTab) {
                          onNavigateTab('FIND_WORKERS', targetCategory);
                        }
                      }}
                    >
                      <View style={styles.suggestionIconWrap}>
                        <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.suggestionTitle} numberOfLines={1}>
                          {cat.name}
                        </Text>
                        <Text style={styles.suggestionSub}>
                          Tap to view {cat.name} on Live Map →
                        </Text>
                      </View>
                      <View style={styles.suggestionActionBadge}>
                        <Text style={styles.suggestionActionText}>Open Map</Text>
                        <ArrowUpRight size={13} color="#4F46E5" />
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Worker suggestions */}
                  {searchSuggestions.workers.map((w, wIdx) => (
                    <TouchableOpacity
                      key={w.id || `sw-${wIdx}`}
                      style={styles.suggestionRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        const targetCategory = w.category || w.skill;
                        setSearchQuery('');
                        if (onNavigateTab) {
                          onNavigateTab('FIND_WORKERS', targetCategory);
                        }
                      }}
                    >
                      <View style={[styles.suggestionAvatar, { backgroundColor: w.color || '#4F46E5' }]}>
                        <Text style={styles.suggestionAvatarText}>{w.avatar || 'W'}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.suggestionTitle} numberOfLines={1}>
                          {w.name || 'Worker'} • <Text style={{ color: w.available ? '#15803D' : '#64748B' }}>{w.available ? '● Online' : '○ Offline'}</Text>
                        </Text>
                        <Text style={styles.suggestionSub} numberOfLines={1}>
                          {w.skill || 'Labour'} • ₹{w.bookingFee || 99} {lang === 'hi' ? 'विजिट शुल्क' : 'Visit Fee'} • {w.distance ? `${w.distance} km away` : 'Nearby'}
                        </Text>
                      </View>
                      <View style={styles.suggestionActionBadge}>
                        <Text style={styles.suggestionActionText}>Open Map</Text>
                        <ArrowUpRight size={13} color="#4F46E5" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
        </View>

        {/* ─── 4. Category Filter Tabs ─── */}
        <View style={styles.tabsRow}>
          {CATEGORY_GROUPS.map((g) => {
            const active = activeGroup === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveGroup(g.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, active && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {getCategoryGroupLabel(g, lang)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── 5. Concise Labour Categories Grid (8 concise + See All toggle) ─── */}
        <FlatList
          data={displayedCategories}
          keyExtractor={(item) => item.id}
          numColumns={4}
          renderItem={renderCategoryItem}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoryGrid}
        />

        {filteredCategories.length > 8 && (
          <TouchableOpacity
            style={styles.seeAllCategoriesBtn}
            onPress={() => setShowAllCategories((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Text style={styles.seeAllCategoriesBtnText}>
              {showAllCategories
                ? (lang === 'hi' ? 'कम देखें ▴' : lang === 'gu' ? 'ઓછું જુઓ ▴' : lang === 'mr' ? 'कमी पहा ▴' : 'Show Less ▴')
                : (lang === 'hi' ? `सभी सेवाएं देखें (${filteredCategories.length}) ▾` : lang === 'gu' ? `બધી સેવાઓ જુઓ (${filteredCategories.length}) ▾` : lang === 'mr' ? `सर्व सेवा पहा (${filteredCategories.length}) ▾` : `See All Services (${filteredCategories.length}) ▾`)}
            </Text>
          </TouchableOpacity>
        )}

        {/* ─── 6. Nearby Workers (<10km / <50km / All) ─── */}
        <View style={styles.sectionHeader}>
          <View style={styles.nearbyTitleRow}>
            <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
              {selectedCategory
                ? `${translateWorkerSkill(selectedCategory, lang)} (${nearbyWorkers10km.length})`
                : searchQuery
                ? `${lang === 'hi' ? 'खोज' : lang === 'gu' ? 'શોધ' : lang === 'mr' ? 'शोध' : 'Search'}: "${searchQuery}" (${nearbyWorkers10km.length})`
                : isManualLocation
                ? (lang === 'hi' ? `${shortCity(translateLocationName(locationText, lang))} में कारीगर (${nearbyWorkers10km.length})` : lang === 'gu' ? `${shortCity(translateLocationName(locationText, lang))} માં કારીગરો (${nearbyWorkers10km.length})` : lang === 'mr' ? `${shortCity(translateLocationName(locationText, lang))} मधील कामगार (${nearbyWorkers10km.length})` : `Workers in ${shortCity(locationText)} (${nearbyWorkers10km.length})`)
                : (lang === 'hi' ? `पास के कारीगर (${nearbyWorkers10km.length})` : lang === 'gu' ? `નજીકના કારીગરો (${nearbyWorkers10km.length})` : lang === 'mr' ? `जवळचे कामगार (${nearbyWorkers10km.length})` : `Workers near you (${nearbyWorkers10km.length})`)}
            </Text>
            {isManualLocation ? (
              <TouchableOpacity
                style={[styles.rangeBadge, { backgroundColor: '#FEF3C7', flexShrink: 0 }]}
                onPress={detectAndApplyCurrentGpsLocation}
                activeOpacity={0.8}
              >
                <Text style={[styles.rangeBadgeText, { color: '#B45309' }]}>
                  {lang === 'hi' ? 'GPS ↺' : lang === 'gu' ? 'GPS ↺' : lang === 'mr' ? 'GPS ↺' : 'GPS ↺'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.rangeBadge, { flexShrink: 0 }]}>
                <Text style={styles.rangeBadgeText}>{lang === 'hi' ? 'लाइव GPS' : lang === 'gu' ? 'લાઈવ GPS' : lang === 'mr' ? 'लाइव्ह GPS' : 'Live GPS'}</Text>
              </View>
            )}
          </View>
          {(selectedCategory || searchQuery) ? (
            <TouchableOpacity onPress={() => { setSelectedCategory(null); setSearchQuery(''); }} style={{ flexShrink: 0 }}>
              <Text style={[styles.seeAll, { color: '#DC2626', fontFamily: 'Satoshi-Bold' }]}>
                {lang === 'hi' ? 'हटाएं ✕' : lang === 'gu' ? 'હટાવો ✕' : lang === 'mr' ? 'काढा ✕' : 'Clear ✕'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => onNavigateTab && onNavigateTab('FIND_WORKERS')} style={{ flexShrink: 0 }}>
              <Text style={styles.seeAll}>
                {lang === 'hi' ? 'नक्शा →' : lang === 'gu' ? 'નકશો →' : lang === 'mr' ? 'नकाशा →' : 'Map →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Distance Range Filter Selector (<10km / <20km Local Perimeter) */}
        <View style={styles.rangeSelectorRow}>
          <TouchableOpacity
            style={[styles.rangePill, distanceRange === 10 && styles.rangePillActive]}
            onPress={() => setDistanceRange(10)}
            activeOpacity={0.8}
          >
            <MapPin size={11} color={distanceRange === 10 ? '#FFFFFF' : '#4F46E5'} />
            <Text style={[styles.rangePillText, distanceRange === 10 && styles.rangePillTextActive]}>
              {lang === 'hi' ? '10 किमी दायरा' : lang === 'gu' ? '10 કિમી હેઠળ' : lang === 'mr' ? '10 किमी आत' : '< 10 km'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rangePill, distanceRange === 20 && styles.rangePillActive]}
            onPress={() => setDistanceRange(20)}
            activeOpacity={0.8}
          >
            <Navigation size={11} color={distanceRange === 20 ? '#FFFFFF' : '#4F46E5'} />
            <Text style={[styles.rangePillText, distanceRange === 20 && styles.rangePillTextActive]}>
              {lang === 'hi' ? '20 किमी (अधिकतम सीमा)' : lang === 'gu' ? '20 કિમી (મહત્તમ)' : lang === 'mr' ? '20 किमी (मर्यादा)' : '< 20 km (Max Limit)'}
            </Text>
          </TouchableOpacity>
        </View>

        {nearbyWorkers10km.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📍</Text>
            <Text style={styles.emptyTitle}>
              {lang === 'hi'
                ? 'वर्तमान स्थान पर 20 किमी में कोई कारीगर उपलब्ध नहीं है'
                : 'Worker not available in your current location right now'}
            </Text>
            <Text style={styles.emptySub}>
              {lang === 'hi'
                ? 'MistriPro केवल 20 किमी के स्थानीय दायरे में बुकिंग स्वीकार करता है ताकि कारीगर समय पर पहुंच सकें। आपके वर्तमान क्षेत्र में अभी कोई कारीगर ऑनलाइन नहीं है।'
                : 'No workers are available within 20km of your current location. MistriPro strictly operates within a 20km perimeter to guarantee rapid arrival.'}
            </Text>
            <Text style={styles.emptySub}>
              {isManualLocation && distanceRange === 10
                ? (lang === 'hi' ? 'इस चुने हुए स्थान के 10 किमी में कोई कारीगर नहीं मिला। 50 किमी दायरा देखें या अपने वर्तमान GPS स्थान पर लौटें।' : lang === 'gu' ? 'આ પસંદ કરેલા સ્થાનના 10 કિમીમાં કોઈ કારીગર મળ્યા નથી. 50 કિમી સુધી જુઓ અથવા વર્તમાન GPS પર પાછા જાઓ.' : lang === 'mr' ? 'या निवडलेल्या स्थानाच्या 10 किमीमध्ये कोणताही कामगार आढळला नाही. 50 किमी पहा किंवा चालू GPS स्थानावर परत जा.' : 'No workers found within 10 km of this selected location. Expand to 50 km or reset to your live GPS location.')
                : (lang === 'hi' ? 'इस ट्रेड के सभी कारीगर अभी ऑफलाइन हैं या अन्य काम में व्यस्त हैं। कृपया थोड़ी देर बाद देखें।' : lang === 'gu' ? 'આ ટ્રેડના બધા કારીગરો હાલમાં ઑફલાઇન છે અથવા અન્ય કામમાં વ્યસ્ત છે. કૃપા કરીને થોડી વાર પછી તપાસો.' : lang === 'mr' ? 'या कामाचे सर्व कारागीर सध्या ऑफलाइन आहेत किंवा इतर कामात व्यस्त आहेत. कृपया काही वेळाने तपासा.' : 'All workers in this trade are currently offline or engaged in active contracts. Please check back shortly or explore another skill.')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, width: '100%' }}>
              {isManualLocation && (
                <TouchableOpacity
                  style={[styles.clearBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC', borderWidth: 1, flex: 1 }]}
                  onPress={detectAndApplyCurrentGpsLocation}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.clearBtnText, { color: '#15803D' }]}>
                    {lang === 'hi' ? 'लाइव GPS पर लौटें ↺' : lang === 'gu' ? 'લાઇવ GPS પર પાછા જાઓ ↺' : lang === 'mr' ? 'थेट GPS वर परत जा ↺' : 'Reset to Live GPS ↺'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.clearBtn, { flex: 1 }]}
                onPress={() => { setSelectedCategory(null); setSearchQuery(''); setDistanceRange(50); }}
                activeOpacity={0.8}
              >
                <Text style={styles.clearBtnText}>
                  {lang === 'hi' ? 'सभी उपलब्ध मिस्त्री देखें' : lang === 'gu' ? 'બધા ઉપલબ્ધ મિસ્ત્રી જુઓ' : lang === 'mr' ? 'सर्व उपलब्ध मिस्त्री पहा' : 'Show All Available Mistris'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          nearbyWorkers10km.slice(0, 8).map((worker, wIdx) => (
            <View key={worker.id || `nw-${wIdx}`}>{renderWorkerCard({ item: worker })}</View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── WORKER DETAIL POPUP MODAL CARD ─── */}
      <Modal visible={!!selectedWorker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View style={styles.modalWorkerAvatarRow}>
                <View style={[styles.avatarCircle, { backgroundColor: selectedWorker?.color || '#4F46E5', width: 48, height: 48, borderRadius: 24 }]}>
                  <Text style={[styles.avatarInitials, { fontSize: 17 }]}>{selectedWorker?.avatar}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.modalWorkerName} numberOfLines={1}>{selectedWorker?.name}</Text>
                    {selectedWorker?.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalWorkerSkill}>{selectedWorker?.skill}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedWorker?.rating} ★</Text>
                <Text style={styles.modalStatLabel}>{selectedWorker?.reviews} {lang === 'hi' ? 'समीक्षाएं' : lang === 'gu' ? 'રિવ્યુઝ' : lang === 'mr' ? 'अभिप्राय' : 'reviews'}</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedWorker?.exp || 5} {lang === 'hi' ? 'साल' : lang === 'gu' ? 'વર્ષ' : lang === 'mr' ? 'वर्षे' : 'Yrs'}</Text>
                <Text style={styles.modalStatLabel}>{lang === 'hi' ? 'अनुभव' : lang === 'gu' ? 'અનુભવ' : lang === 'mr' ? 'अनुभव' : 'Experience'}</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedWorker?.distance || '2.1'} {lang === 'hi' ? 'किमी' : lang === 'gu' ? 'કિમી' : lang === 'mr' ? 'किमी' : 'km'}</Text>
                <Text style={styles.modalStatLabel}>{lang === 'hi' ? 'दूरी' : lang === 'gu' ? 'અંતર' : lang === 'mr' ? 'अंतर' : 'Distance'}</Text>
              </View>
            </View>

            <View style={styles.credentialsBox}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.credentialsText}>
                {lang === 'hi' ? 'आधार सत्यापित मिस्त्री • रेज़रपे सुरक्षित' : lang === 'gu' ? 'આધાર ચકાસાયેલ મિસ્ત્રી • રેઝરપે સુરક્ષિત' : lang === 'mr' ? 'आधार सत्यापित मिस्त्री • रेझरपे सुरक्षित' : 'Aadhaar Verified Mistri • Razorpay Protected'}
              </Text>
            </View>

            {!selectedWorker?.available && (
              <View style={styles.modalOfflineNotice}>
                <Text style={styles.modalOfflineNoticeText}>
                  {lang === 'hi' ? '⚠️ यह मिस्त्री अभी ऑफलाइन है। जब वे ऑनलाइन आएंगे तब बुकिंग संभव होगी।' : lang === 'gu' ? '⚠️ આ મિસ્ત્રી હાલમાં ઑફલાઇન છે. તેઓ ઑનલાઇન આવશે ત્યારે બુકિંગ શક્ય બનશે.' : lang === 'mr' ? '⚠️ हा मिस्त्री सध्या ऑफलाइन आहे. ते ऑनलाइन आल्यावर बुकिंग शक्य होईल.' : '⚠️ This mistri is currently OFFLINE / Not Available Right Now. Immediate bookings are paused until they go online.'}
                </Text>
              </View>
            )}

            <View style={styles.modalFooterRow}>
              <View>
                <Text style={styles.modalRateLabel}>{lang === 'hi' ? 'साइट विजिट शुल्क' : lang === 'gu' ? 'મુલાકાત શુલ્ક' : lang === 'mr' ? 'भेट शुल्क' : 'Site Visit Fee'}</Text>
                <Text style={styles.modalRateVal}>₹{selectedWorker?.bookingFee || 99} <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600' }}>• {lang === 'hi' ? 'काम का रेट साइट पर' : 'Quote On-Site'}</Text></Text>
              </View>

              {selectedWorker?.available ? (
                <TouchableOpacity
                  style={styles.modalBookBtn}
                  onPress={() => handleProceedToBooking(selectedWorker)}
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
                      `${selectedWorker?.name} ${lang === 'hi' ? 'अभी बुकिंग के लिए उपलब्ध नहीं हैं।' : lang === 'gu' ? 'હાલમાં બુકિંગ માટે ઉપલબ્ધ નથી.' : lang === 'mr' ? 'सध्या बुकिंगसाठी उपलब्ध नाहीत.' : 'is currently not available for instant booking.'}`
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
                <Text style={styles.modalTitle}>{lang === 'hi' ? 'बुकिंग की पुष्टि और भुगतान' : lang === 'gu' ? 'બુકિંગની પુષ્ટિ અને ચુકવણી' : lang === 'mr' ? 'बुकिंगची पुष्टी आणि पेमेंट' : 'Confirm Booking & Pay'}</Text>
                <Text style={styles.modalSub}>{checkoutWorker?.name} • {translateWorkerSkill(checkoutWorker?.skill || checkoutWorker?.category, lang)}</Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>{lang === 'hi' ? 'साइट विजिट व निरीक्षण शुल्क' : lang === 'gu' ? 'સાઇટ મુલાકાત અને નિરીક્ષણ શુલ્ક' : lang === 'mr' ? 'साइट भेट व तपासणी शुल्क' : 'Site Visit & Inspection Fee'}</Text>
                <Text style={styles.billVal}>₹99</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>{lang === 'hi' ? 'काम का वास्तविक खर्च' : lang === 'gu' ? 'કામનો વાસ્તવિક ખર્ચ' : lang === 'mr' ? 'कामाचा प्रत्यक्ष खर्च' : 'Actual Work Price'}</Text>
                <Text style={[styles.billVal, { color: '#059669', fontWeight: '700' }]}>{lang === 'hi' ? 'साइट देखकर तय होगा' : lang === 'gu' ? 'સાઇટ જોઈને નક્કી થશે' : lang === 'mr' ? 'साइट पाहून ठरवले जाईल' : 'Decided On-Site'}</Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRowGrand}>
                <Text style={styles.billTotalLabel}>{lang === 'hi' ? 'अभी देय बुकिंग राशि' : lang === 'gu' ? 'હાલ ચૂકવવાપાત્ર બુકિંગ રકમ' : lang === 'mr' ? 'आता देय बुकिंग रक्कम' : 'Total to Pay Now'}</Text>
                <Text style={styles.billTotalVal}>₹99</Text>
              </View>
            </View>

            <View style={styles.escrowNotice}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.escrowNoticeText}>
                {lang === 'hi' ? '100% सुरक्षित: आप अभी केवल ₹99 विजिट शुल्क दे रहे हैं। मिस्त्री आपकी साइट पर आकर काम देखकर उचित रेट तय करेंगे।' : lang === 'gu' ? '100% સુરક્ષિત: તમે અત્યારે ફક્ત ₹99 વિઝિટ ફી ચૂકવી રહ્યા છો. મિસ્ત્રી સાઇટ જોઈને યોગ્ય ભાવ નક્કી કરશે.' : lang === 'mr' ? '100% सुरक्षित: आपण सध्या फक्त ₹99 भेट शुल्क देत आहात. मिस्त्री जागेवर येऊन कामाचा योग्य दर ठरवतील.' : '100% Protected: You only pay ₹99 inspection booking fee. The mistri visits your site and quotes work price directly.'}
              </Text>
            </View>

            {/* Virtual Wallet 1-Tap Option (Usable strictly for booking) */}
            {customerWalletBalance >= 99 ? (
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: '#059669', marginBottom: 10 }]}
                onPress={() => {
                  Alert.alert(
                    'वर्चुअल वॉलेट से भुगतान करें? 💰',
                    `आपके पास MistriPro वर्चुअल वॉलेट में ₹${customerWalletBalance} शेष हैं।\n\nइस बुकिंग के लिए ₹99 वॉलेट से कटेंगे (अतिरिक्त कोई ऑनलाइन भुगतान नहीं करना होगा)।`,
                    [
                      { text: 'रद्द करें (Cancel)', style: 'cancel' },
                      {
                        text: 'हाँ, वॉलेट से बुक करें (₹0)',
                        onPress: () => {
                          const worker = checkoutWorker;
                          setCheckoutWorker(null);
                          if (onBookWorker) {
                            onBookWorker({
                              workerId: worker.id,
                              workerName: worker.name,
                              workerAvatar: worker.avatar,
                              workerColor: worker.color,
                              workerPhone: '+91 98290 12345',
                              workerSkill: worker.skill,
                              category: worker.category || worker.skill,
                              title: `${worker.skill} Site Inspection`,
                              siteLocation: locationText,
                              scheduledDate: 'Today, Immediate',
                              duration: 'Site Inspection & On-site Quote',
                              bookingFee: 99,
                              workerFee: 0,
                              platformFee: 99,
                              txnFee: 0,
                              totalAmount: 99,
                              pricingModel: 'ON_SITE_QUOTE',
                              paidViaWallet: true,
                            });
                          }
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
              onPress={handleConfirmBooking}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.payBtnText}>
                {customerWalletBalance >= 99
                  ? (lang === 'hi' ? 'रेज़रपे ऑनलाइन भुगतान' : 'Pay via Razorpay')
                  : (lang === 'hi' ? 'भुगतान करें और बुक करें' : 'Pay & Request Booking')}
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
          if (onBookWorker) {
            onBookWorker(completedDetails);
          }
        }}
      />

      {/* Location Search Modal */}
      <Modal
        visible={showLocationSearch}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowLocationSearch(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#F8F9FF' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 54,
            paddingBottom: 16,
            paddingHorizontal: 20,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#E8ECFF',
          }}>
            <TouchableOpacity onPress={() => { setShowLocationSearch(false); setLocationSearchQuery(''); setLocationResults([]); }} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 24, color: '#3D47D6' }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A2E', fontFamily: 'Satoshi-Bold' }}>
              {lang === 'hi' ? 'स्थान चुनें' : lang === 'gu' ? 'સ્થાન પસંદ કરો' : lang === 'mr' ? 'स्थान निवडा' : 'Choose Location'}
            </Text>
          </View>

          {/* Search Input */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#3D47D6',
              paddingHorizontal: 14,
              paddingVertical: 10,
              shadowColor: '#3D47D6',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
              <TextInput
                autoFocus
                value={locationSearchQuery}
                onChangeText={setLocationSearchQuery}
                placeholder={lang === 'hi' ? 'भारत में शहर या इलाका खोजें...' : lang === 'gu' ? 'ભારતમાં શહેર કે વિસ્તાર શોધો...' : lang === 'mr' ? 'भारतातील शहर किंवा परिसर शोधा...' : 'Search city, area, town in India...'}
                placeholderTextColor="#9BA3C7"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#1A1A2E',
                  fontFamily: 'Satoshi-Medium',
                }}
              />
              {locationSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setLocationSearchQuery(''); setLocationResults([]); }}>
                  <Text style={{ fontSize: 18, color: '#9BA3C7' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Action: Use My Current Live GPS Location */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#EEF2FF',
              marginHorizontal: 20,
              marginBottom: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#C7D2FE',
              gap: 12,
            }}
            onPress={() => {
              setShowLocationSearch(false);
              setLocationSearchQuery('');
              setLocationResults([]);
              detectAndApplyCurrentGpsLocation();
            }}
            activeOpacity={0.8}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Satoshi-Bold', color: '#312E81' }}>
                {lang === 'hi' ? 'मेरे वर्तमान GPS स्थान पर जाएं' : lang === 'gu' ? 'મારા વર્તમાન GPS સ્થાનનો ઉપયોગ કરો' : lang === 'mr' ? 'माझ्या चालू GPS स्थानावर जा' : 'Use My Current Live GPS Location'}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: 'Satoshi-Regular', color: '#4F46E5' }}>
                {lang === 'hi' ? 'डिवाइस का लाइव स्थान चालू करें' : lang === 'gu' ? 'ડિવાઇસનું લાઈવ લોકેશન મેળવો' : lang === 'mr' ? 'डिव्हाइसचे थेट स्थान मिळवा' : 'Detect live GPS coordinates from device'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Loading */}
          {locationSearchLoading && (
            <View style={{ alignItems: 'center', paddingTop: 20 }}>
              <ActivityIndicator size="large" color="#3D47D6" />
              <Text style={{ marginTop: 8, color: '#6B7280', fontFamily: 'Satoshi-Regular' }}>
                {lang === 'hi' ? 'खोज रहे हैं...' : lang === 'gu' ? 'શોધી રહ્યું છે...' : lang === 'mr' ? 'शोधत आहे...' : 'Searching...'}
              </Text>
            </View>
          )}

          {/* Results */}
          <FlatList
            data={locationResults}
            keyExtractor={(item, index) => `${item.place_id || index}`}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
            renderItem={({ item }) => {
              const parts = (item.display_name || '').split(',');
              const mainName = parts[0]?.trim() || item.display_name;
              const subName = parts.slice(1, 3).join(',').trim();
              return (
                <TouchableOpacity
                  onPress={() => {
                    const cleanPrimary = (mainName || parts[0] || '').trim();
                    const shortLocationName = cleanPrimary.length > 25 ? cleanPrimary.slice(0, 22) + '...' : cleanPrimary;
                    setLocationText(shortLocationName || item.display_name);
                    setUserLat(parseFloat(item.lat));
                    setUserLon(parseFloat(item.lon));
                    setIsManualLocation(true);
                    setDistanceRange(10);
                    setShowLocationSearch(false);
                    setLocationSearchQuery('');
                    setLocationResults([]);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    marginBottom: 8,
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A2E', fontFamily: 'Satoshi-Bold' }} numberOfLines={1}>
                      {mainName}
                    </Text>
                    {subName ? (
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2, fontFamily: 'Satoshi-Regular' }} numberOfLines={1}>
                        {subName}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              !locationSearchLoading && locationSearchQuery.length >= 3 ? (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 32 }}>🗺️</Text>
                  <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8, fontFamily: 'Satoshi-Regular' }}>
                    {lang === 'hi' ? 'कोई स्थान नहीं मिला' : lang === 'gu' ? 'કોઈ સ્થાન મળ્યું નથી' : lang === 'mr' ? 'कोणतेही स्थान आढळले नाही' : 'No locations found'}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#9BA3C7', marginTop: 4 }}>
                    {lang === 'hi' ? 'कोई दूसरा शहर या क्षेत्र खोजें' : lang === 'gu' ? 'કોઈ અન્ય શહેર કે વિસ્તાર શોધો' : lang === 'mr' ? 'दुसरे शहर किंवा परिसर शोधा' : 'Try a different city or area name'}
                  </Text>
                </View>
              ) : locationSearchQuery.length < 3 && locationSearchQuery.length > 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 13, color: '#9BA3C7', fontFamily: 'Satoshi-Regular' }}>
                    {lang === 'hi' ? 'कम से कम 3 अक्षर दर्ज करें' : lang === 'gu' ? 'ઓછામાં ઓછા 3 અક્ષર દાખલ કરો' : lang === 'mr' ? 'किमान 3 अक्षरे प्रविष्ट करा' : 'Type at least 3 characters to search'}
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 32 }}>🏙️</Text>
                  <Text style={{ fontSize: 15, color: '#6B7280', marginTop: 8, fontFamily: 'Satoshi-Regular' }}>
                    {lang === 'hi' ? 'अपना शहर या क्षेत्र खोजें' : lang === 'gu' ? 'તમારું શહેર કે વિસ્તાર શોધો' : lang === 'mr' ? 'आपले शहर किंवा परिसर शोधा' : 'Search for your city or area'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9BA3C7', marginTop: 4 }}>
                    {lang === 'hi' ? 'केवल भारत के स्थान' : lang === 'gu' ? 'માત્ર ભારતના સ્થળો' : lang === 'mr' ? 'ફક્ત भारतातील ठिकाणे' : 'India locations only'}
                  </Text>
                </View>
              )
            }
          />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
  },
  greetingSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  greetingName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  bellWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '92%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 6,
  },
  locationText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12.5,
    color: '#334155',
    flexShrink: 1,
    maxWidth: 180,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  heroTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },
  categoryGrid: {
    paddingBottom: 8,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 10.5,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 13.5,
    minHeight: 28,
  },
  seeAllCategoriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignSelf: 'center',
  },
  seeAllCategoriesBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12.5,
    color: '#4F46E5',
  },
  searchDropdownCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownHeaderText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownCloseText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 10,
  },
  suggestionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionAvatarText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  suggestionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  suggestionSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  suggestionActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  suggestionActionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10.5,
    color: '#4F46E5',
  },
  emptySuggestionRow: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySuggestionText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  rangeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  rangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangePillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  rangePillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#475569',
  },
  rangePillTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  nearbyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14.5,
    color: '#0F172A',
    flexShrink: 1,
  },
  rangeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rangeBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9.5,
    color: '#15803D',
  },
  seeAll: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#4F46E5',
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
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  workerAvatarText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
  },
  workerInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  workerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Satoshi-Bold',
  },
  workerSkill: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  workerRating: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  workerReviews: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 2,
  },
  workerRate: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#4F46E5',
  },
  workerRight: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  hireBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  hireBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
  },
  hireBtnOffline: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hireBtnTextOffline: {
    color: '#94A3B8',
  },
  cardAvailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 3,
    marginBottom: 4,
  },
  cardAvailOnline: {
    backgroundColor: '#F0FDF4',
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
  modalTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  modalSub: {
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
