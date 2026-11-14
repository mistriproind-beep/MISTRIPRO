import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Bell, MapPin, ChevronDown, Search, Star } from 'lucide-react-native';
import * as Location from 'expo-location';

import { CATEGORIES, CATEGORY_GROUPS } from '../data/categories';
import { MOCK_WORKERS } from '../data/mockWorkers';

/* ─── helpers ─── */
const shortName = (full) => {
  // Take text before first parenthesis / slash, trim
  const cleaned = full.split('(')[0].split('/')[0].trim();
  // Max two words
  const words = cleaned.split(' ');
  return words.length > 2 ? words.slice(0, 2).join(' ') : cleaned;
};

/* ─── Component ─── */
export default function CustomerHomeScreen({ insets }) {
  const [locationText, setLocationText] = useState('Jaipur, Rajasthan');
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

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
        const reverseGeo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (reverseGeo && reverseGeo.length > 0) {
          const place = reverseGeo[0];
          const area = place.subregion || place.district || place.city || '';
          const region = place.region || '';
          setLocationText(area ? `${area}, ${region}` : region || 'Jaipur, Rajasthan');
        }
      } catch {
        // fallback already set
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  /* Filtered categories */
  const filteredCategories =
    activeGroup === 'all'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.group === activeGroup);

  /* Nearby available workers */
  const nearbyWorkers = MOCK_WORKERS.filter((w) => w.distance <= 15 && w.available === true);

  /* ── Render helpers ── */

  const renderCategoryItem = useCallback(
    ({ item }) => (
      <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7}>
        <View style={[styles.categoryIconCircle, { backgroundColor: `${item.group === 'construction' ? '#EEF2FF' : item.group === 'technical' ? '#F0FDFA' : '#FFF7ED'}` }]}>
          <Text style={styles.categoryEmoji}>{item.icon}</Text>
        </View>
        <Text style={styles.categoryLabel} numberOfLines={2}>
          {shortName(item.name)}
        </Text>
      </TouchableOpacity>
    ),
    [],
  );

  const renderWorkerCard = useCallback(
    ({ item }) => (
      <View style={styles.workerCard}>
        {/* Avatar */}
        <View style={[styles.workerAvatar, { backgroundColor: item.color }]}>
          <Text style={styles.workerAvatarText}>{item.avatar}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName}>{item.name}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.workerSkill}>{item.skill}</Text>
          <View style={styles.workerMeta}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.workerRating}>{item.rating}</Text>
            <Text style={styles.workerReviews}>({item.reviews})</Text>
            <View style={styles.metaDot} />
            <Text style={styles.workerRate}>₹{item.rate}/{item.rateType}</Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.workerRight}>
          <View style={styles.distanceBadge}>
            <MapPin size={11} color="#4F46E5" />
            <Text style={styles.distanceText}>{item.distance} km</Text>
          </View>
          <TouchableOpacity style={styles.hireBtn} activeOpacity={0.8}>
            <Text style={styles.hireBtnText}>Hire</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [],
  );

  /* ── Main render ── */
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
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>RS</Text>
            </View>
            <View>
              <Text style={styles.greetingSub}>Good morning 👋</Text>
              <Text style={styles.greetingName}>Hello, Ramesh!</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellWrapper} activeOpacity={0.7}>
            <Bell size={22} color="#0F172A" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ─── 2. Location Picker ─── */}
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.75}>
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

        {/* ─── 3 & 4. Prompt Card + Search Bar ─── */}
        <View style={styles.promptCard}>
          <Text style={styles.promptHeading}>Which worker do you need today?</Text>

          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search mason, plumber, electrician..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* ─── 5. Category Filter Tabs ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsRow}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORY_GROUPS.map((g) => {
            const active = activeGroup === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveGroup(g.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── 6. Categories Grid ─── */}
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={4}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
        />

        {/* ─── 7. Available Near You ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workers near you (within 15km)</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {nearbyWorkers.map((worker) => (
          <View key={worker.id}>{renderWorkerCard({ item: worker })}</View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════ STYLES ═══════════════════════ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* ── Header ── */
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
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  /* ── Location ── */
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  locationText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#0F172A',
    maxWidth: 200,
  },

  /* ── Prompt Card ── */
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  promptHeading: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 14,
  },

  /* ── Search Bar ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },

  /* ── Filter Tabs ── */
  tabsRow: {
    marginBottom: 12,
  },
  tabsContent: {
    gap: 8,
    paddingVertical: 2,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  /* ── Category Grid ── */
  gridContainer: {
    paddingBottom: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
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
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 14,
  },

  /* ── Section Header ── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  seeAll: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#4F46E5',
  },

  /* ── Worker Card ── */
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerAvatarText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
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
    fontSize: 15,
    color: '#0F172A',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#CBD5E1',
    marginHorizontal: 2,
  },
  workerRate: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#4F46E5',
  },

  /* ── Worker Right ── */
  workerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  distanceText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#4F46E5',
  },
  hireBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  hireBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
