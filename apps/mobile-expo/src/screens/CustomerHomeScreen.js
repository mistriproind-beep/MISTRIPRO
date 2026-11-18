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
} from 'lucide-react-native';
import * as Location from 'expo-location';

import { CATEGORIES, CATEGORY_GROUPS } from '../data/categories';
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

export default function CustomerHomeScreen({
  insets,
  onNavigateTab,
  onBookWorker,
  onOpenNotifications,
  notificationsCount = 0,
  workers = [],
  userName = 'User',
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

  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
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

  /* GPS Location */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setUserLat(loc.coords.latitude);
        setUserLon(loc.coords.longitude);

        if (address) {
          const area = address.subregion || address.district || address.city || address.name || 'Sawai Madhopur';
          const st = address.region || 'Rajasthan';
          setLocationText(`${area}, ${st}`);
        }
      } catch (err) {
        // fallback
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

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

  // Filter Workers: Online & Offline workers with status badge, online sorted first
  const nearbyWorkers = useMemo(() => {
    const liveList = Array.isArray(workers) ? workers : [];
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

    // Sort: Online workers first, offline below
    return [...filtered].sort((a, b) => {
      const aAvail = Boolean(a?.available);
      const bAvail = Boolean(b?.available);
      if (aAvail === bAvail) return 0;
      return aAvail ? -1 : 1;
    });
  }, [searchQuery, selectedCategory, workers]);

  // Filtered by 10km distance
  const nearbyWorkers10km = useMemo(() => {
    return nearbyWorkers
      .map((worker) => {
        if (userLat && userLon && worker.latitude && worker.longitude) {
          const dist = getDistanceKm(userLat, userLon, worker.latitude, worker.longitude);
          return { ...worker, computedDistance: dist, distance: dist.toFixed(1) };
        }
        return worker;
      })
      .filter((worker) => {
        if (userLat && userLon && worker.computedDistance !== undefined) {
          return worker.computedDistance <= 10;
        }
        return true;
      });
  }, [nearbyWorkers, userLat, userLon]);

  const handleProceedToBooking = (worker) => {
    setSelectedWorker(null);
    setCheckoutWorker(worker);
  };

  const handleConfirmBooking = () => {
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
      siteLocation: locationText,
      scheduledDate: 'Today, Immediate',
      duration: '1 Day',
      workerFee,
      platformFee,
      txnFee,
      totalAmount,
    };

    setCheckoutWorker(null);
    setRazorpayBookingData(bookingDetails);
    setShowRazorpayModal(true);
  };

  const renderCategoryItem = useCallback(
    ({ item }) => {
      const catLabel = shortName(item.name);
      const isSelected = selectedCategory === catLabel;
      return (
        <TouchableOpacity
          style={styles.categoryItem}
          activeOpacity={0.7}
          onPress={() => {
            setSelectedCategory((prev) => (prev === catLabel ? null : catLabel));
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
    [selectedCategory],
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
          <Text style={styles.workerSkill}>{item?.skill || 'Labour'}</Text>
          {/* Availability Status Badge */}
          <View style={[styles.cardAvailBadge, item?.available ? styles.cardAvailOnline : styles.cardAvailOffline]}>
            <View style={[styles.cardAvailDot, item?.available ? styles.cardDotOnline : styles.cardDotOffline]} />
            <Text style={[styles.cardAvailText, item?.available ? styles.cardTextOnline : styles.cardTextOffline]}>
              {item?.available ? 'Online' : 'Not Available Right Now'}
            </Text>
          </View>
          <View style={styles.workerMeta}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.workerRating}>{item?.rating || '5.0'}</Text>
            <Text style={styles.workerReviews}>({item?.reviews ?? 0})</Text>
            <View style={styles.metaDot} />
            <Text style={styles.workerRate}>₹{item?.rate || 800}/{item?.rateType || 'day'}</Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.workerRight}>
          <View style={styles.distanceBadge}>
            <MapPin size={11} color="#4F46E5" />
            <Text style={styles.distanceText}>{item?.distance || '2.0'} km</Text>
          </View>
          <TouchableOpacity
            style={[styles.hireBtn, !item?.available && styles.hireBtnOffline]}
            activeOpacity={0.8}
            onPress={() => {
              if (item?.available) {
                setSelectedWorker(item);
              } else {
                Alert.alert(
                  'Worker Offline 🔴',
                  `${item?.name || 'This worker'} is not available right now. You can view their verified profile or check back later.`
                );
              }
            }}
          >
            <Text style={[styles.hireBtnText, !item?.available && styles.hireBtnTextOffline]}>
              {item?.available ? 'Book' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [],
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
            <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.8} onPress={() => onNavigateTab && onNavigateTab('profile')}>
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.greetingSub}>Good morning 👋</Text>
              <Text style={styles.greetingName}>Hello, {userName || 'User'}!</Text>
            </View>
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
          <MapPin size={16} color="#4F46E5" />
          {locationLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginLeft: 6 }} />
          ) : (
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
          )}
          <ChevronDown size={16} color="#64748B" />
        </TouchableOpacity>

        {/* ─── 3. Main Hero Card with Search ─── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Which worker do you need today?</Text>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search mason, plumber, electrician..."
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
                          {w.skill || 'Labour'} • ₹{w.rate || 800}/day • {w.distance ? `${w.distance} km away` : 'Nearby'}
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
                  {g.label}
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
                ? 'Show Less (कम देखें) ▴'
                : `See All Services (${filteredCategories.length}) ▾`}
            </Text>
          </TouchableOpacity>
        )}

        {/* ─── 6. Nearby Workers (<15km) ─── */}
        <View style={styles.sectionHeader}>
          <View style={styles.nearbyTitleRow}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `${selectedCategory}s Online (${nearbyWorkers10km.length})`
                : searchQuery
                ? `Search: "${searchQuery}" (${nearbyWorkers10km.length})`
                : `Workers near you (${nearbyWorkers10km.length})`}
            </Text>
            <View style={styles.rangeBadge}>
              <Text style={styles.rangeBadgeText}>Live GPS</Text>
            </View>
          </View>
          {(selectedCategory || searchQuery) ? (
            <TouchableOpacity onPress={() => { setSelectedCategory(null); setSearchQuery(''); }}>
              <Text style={[styles.seeAll, { color: '#DC2626', fontFamily: 'Satoshi-Bold' }]}>Clear Filter ✕</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => onNavigateTab && onNavigateTab('FIND_WORKERS')}>
              <Text style={styles.seeAll}>Open Map →</Text>
            </TouchableOpacity>
          )}
        </View>

        {nearbyWorkers10km.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>👷‍♂️</Text>
            <Text style={styles.emptyTitle}>
              No Online {selectedCategory || searchQuery} Near You
            </Text>
            <Text style={styles.emptySub}>
              All workers in this trade are currently offline or engaged in active contracts. Please check back shortly or explore another skill.
            </Text>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setSelectedCategory(null); setSearchQuery(''); }}
            >
              <Text style={styles.clearBtnText}>Show All Available Mistris</Text>
            </TouchableOpacity>
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
                <Text style={styles.modalStatLabel}>{selectedWorker?.reviews} reviews</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedWorker?.exp} Yrs</Text>
                <Text style={styles.modalStatLabel}>Experience</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNum}>{selectedWorker?.distance} km</Text>
                <Text style={styles.modalStatLabel}>Distance</Text>
              </View>
            </View>

            <View style={styles.credentialsBox}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.credentialsText}>
                Aadhaar Verified Mistri • Razorpay Protected • Police Verification Cleared
              </Text>
            </View>

            {!selectedWorker?.available && (
              <View style={styles.modalOfflineNotice}>
                <Text style={styles.modalOfflineNoticeText}>
                  ⚠️ This mistri is currently OFFLINE / Not Available Right Now. Immediate bookings are paused until they go online.
                </Text>
              </View>
            )}

            <View style={styles.modalFooterRow}>
              <View>
                <Text style={styles.modalRateLabel}>Daily Wage</Text>
                <Text style={styles.modalRateVal}>₹{selectedWorker?.rate} <Text style={{ fontSize: 13, color: '#64748B' }}>/day</Text></Text>
              </View>

              {selectedWorker?.available ? (
                <TouchableOpacity
                  style={styles.modalBookBtn}
                  onPress={() => handleProceedToBooking(selectedWorker)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBookBtnText}>Proceed to Book</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalBookBtn, { backgroundColor: '#94A3B8' }]}
                  onPress={() => {
                    Alert.alert(
                      'Worker Currently Offline',
                      `${selectedWorker?.name} is currently not available for instant booking.`
                    );
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBookBtnText}>Currently Offline</Text>
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
                <Text style={styles.modalTitle}>Confirm Booking & Pay</Text>
                <Text style={styles.modalSub}>{checkoutWorker?.name} • {checkoutWorker?.skill}</Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutWorker(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>Worker Fee (1 Day)</Text>
                <Text style={styles.billVal}>₹{Number(checkoutWorker?.rate) || 950}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>Mistri Pro Platform Fee</Text>
                <Text style={styles.billVal}>₹99</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billItem}>Gateway & Service Processing (5%)</Text>
                <Text style={styles.billVal}>₹{Math.round((Number(checkoutWorker?.rate) || 950) * 0.05)}</Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRowGrand}>
                <Text style={styles.billTotalLabel}>Total to Pay</Text>
                <Text style={styles.billTotalVal}>
                  ₹{(Number(checkoutWorker?.rate) || 950) + 99 + Math.round((Number(checkoutWorker?.rate) || 950) * 0.05)}
                </Text>
              </View>
            </View>

            <View style={styles.escrowNotice}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.escrowNoticeText}>
                100% Protected Payment: Processed securely via Razorpay. Money is transferred to mistri only after you confirm work completion.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleConfirmBooking}
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
              Choose Location
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
                placeholder="Search city, area, town in India..."
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

          {/* Loading */}
          {locationSearchLoading && (
            <View style={{ alignItems: 'center', paddingTop: 20 }}>
              <ActivityIndicator size="large" color="#3D47D6" />
              <Text style={{ marginTop: 8, color: '#6B7280', fontFamily: 'Satoshi-Regular' }}>Searching...</Text>
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
                    const shortLocationName = parts.slice(0, 2).join(', ').trim();
                    setLocationText(shortLocationName || item.display_name);
                    setUserLat(parseFloat(item.lat));
                    setUserLon(parseFloat(item.lon));
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
                    No locations found
                  </Text>
                  <Text style={{ fontSize: 13, color: '#9BA3C7', marginTop: 4 }}>Try a different city or area name</Text>
                </View>
              ) : locationSearchQuery.length < 3 && locationSearchQuery.length > 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 13, color: '#9BA3C7', fontFamily: 'Satoshi-Regular' }}>Type at least 3 characters to search</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontSize: 32 }}>🏙️</Text>
                  <Text style={{ fontSize: 15, color: '#6B7280', marginTop: 8, fontFamily: 'Satoshi-Regular' }}>
                    Search for your city or area
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9BA3C7', marginTop: 4 }}>India locations only</Text>
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
    fontSize: 13,
    color: '#334155',
    maxWidth: 240,
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
    marginBottom: 12,
  },
  nearbyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#94A3B8',
  },
  cardAvailText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
  },
  cardTextOnline: {
    color: '#15803D',
  },
  cardTextOffline: {
    color: '#64748B',
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
