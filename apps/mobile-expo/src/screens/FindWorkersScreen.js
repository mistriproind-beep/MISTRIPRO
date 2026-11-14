import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import {
  Search,
  MapPin,
  Star,
  Phone,
  User,
  Navigation,
  ChevronRight,
} from 'lucide-react-native';
import { CATEGORIES } from '../data/categories';
import { MOCK_WORKERS } from '../data/mockWorkers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 350;
const MAP_WIDTH = SCREEN_WIDTH - 32;

// Center reference point (approx Jaipur center)
const CENTER_LAT = 26.92;
const CENTER_LNG = 75.76;

function WorkerDot({ worker, mapWidth, mapHeight }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const x = mapWidth / 2 + (worker.lng - CENTER_LNG) * 800;
  const y = mapHeight / 2 + (CENTER_LAT - worker.lat) * 800;

  // Clamp within bounds
  const clampedX = Math.max(16, Math.min(x, mapWidth - 16));
  const clampedY = Math.max(16, Math.min(y, mapHeight - 16));

  return (
    <View style={[styles.dotContainer, { left: clampedX - 14, top: clampedY - 14 }]}>
      <Animated.View
        style={[
          styles.dotPulse,
          {
            backgroundColor: worker.color + '25',
            borderColor: worker.color + '50',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View style={[styles.dotInner, { backgroundColor: worker.color }]}>
        <Text style={styles.dotInitials}>{worker.avatar}</Text>
      </View>
    </View>
  );
}

function RatingStars({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" style={{ opacity: 0.5 }} />
      );
    } else {
      stars.push(
        <Star key={i} size={12} color="#D1D5DB" />
      );
    }
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

function WorkerCard({ worker }) {
  return (
    <View style={styles.workerCard}>
      <View style={styles.workerCardRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: worker.color + '18' }]}>
          <Text style={[styles.avatarText, { color: worker.color }]}>{worker.avatar}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName}>{worker.name}</Text>
            {worker.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
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
          <TouchableOpacity style={styles.viewProfileBtn}>
            <User size={14} color="#4F46E5" />
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${worker.phone}`)}
          >
            <Phone size={14} color="#FFFFFF" />
            <Text style={styles.callText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function FindWorkersScreen({ insets }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredWorkers = selectedCategory === 'All'
    ? MOCK_WORKERS.filter(w => w.available)
    : MOCK_WORKERS.filter(
        w => w.available && w.category === selectedCategory
      );

  const allChips = ['All', ...CATEGORIES.map(c => c.name)];

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 44 }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: (insets?.bottom || 34) + 80 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Workers</Text>
          <Text style={styles.headerSubtitle}>Discover skilled workers near you</Text>
        </View>

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

        {/* Simulated Map View */}
        <View style={styles.mapContainer}>
          <View style={styles.mapCard}>
            {/* Grid lines for map effect */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <View
                key={`h-${frac}`}
                style={[
                  styles.gridLineH,
                  { top: `${frac * 100}%` },
                ]}
              />
            ))}
            {[0.25, 0.5, 0.75].map((frac) => (
              <View
                key={`v-${frac}`}
                style={[
                  styles.gridLineV,
                  { left: `${frac * 100}%` },
                ]}
              />
            ))}

            {/* Road-like lines */}
            <View style={styles.roadH} />
            <View style={styles.roadV} />

            {/* Worker dots */}
            {filteredWorkers.map((worker) => (
              <WorkerDot
                key={worker.id}
                worker={worker}
                mapWidth={MAP_WIDTH}
                mapHeight={MAP_HEIGHT}
              />
            ))}

            {/* Center marker - "You" */}
            <View style={styles.youMarkerContainer}>
              <Text style={styles.youMarkerEmoji}>📍</Text>
              <View style={styles.youLabel}>
                <Text style={styles.youLabelText}>You</Text>
              </View>
            </View>

            {/* Map label */}
            <View style={styles.mapLabelContainer}>
              <MapPin size={12} color="#64748B" />
              <Text style={styles.mapLabel}>Jaipur, Rajasthan</Text>
            </View>

            {/* Worker count badge */}
            <View style={styles.workerCountBadge}>
              <Text style={styles.workerCountText}>
                {filteredWorkers.length} workers nearby
              </Text>
            </View>
          </View>
        </View>

        {/* Worker List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Available Workers</Text>
            <Text style={styles.listCount}>{filteredWorkers.length} found</Text>
          </View>

          {filteredWorkers.length === 0 ? (
            <View style={styles.emptyState}>
              <Search size={32} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No workers found</Text>
              <Text style={styles.emptySubtitle}>
                Try selecting a different category
              </Text>
            </View>
          ) : (
            filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))
          )}
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
  scroll: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 2,
  },

  // Chips
  chipsScroll: {
    marginTop: 12,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#475569',
  },

  // Map
  mapContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  mapCard: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#E8F4F8',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D1E7ED',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#C5DDE5',
    opacity: 0.5,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#C5DDE5',
    opacity: 0.5,
  },
  roadH: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#B8CDD5',
    opacity: 0.7,
  },
  roadV: {
    position: 'absolute',
    left: '52%',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#B8CDD5',
    opacity: 0.7,
  },

  // Worker dots
  dotContainer: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  dotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dotInitials: {
    fontSize: 7,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },

  // "You" marker
  youMarkerContainer: {
    position: 'absolute',
    top: MAP_HEIGHT / 2 - 22,
    left: '50%',
    marginLeft: -16,
    alignItems: 'center',
    zIndex: 20,
  },
  youMarkerEmoji: {
    fontSize: 24,
  },
  youLabel: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -2,
  },
  youLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Satoshi-Bold',
  },

  // Map labels
  mapLabelContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFCC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  mapLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#64748B',
  },
  workerCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  workerCountText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },

  // Worker list
  listSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  listCount: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#64748B',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    color: '#94A3B8',
  },

  // Worker card
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  workerCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
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
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },
  workerSkill: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  reviewsText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    color: '#94A3B8',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  distanceText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Bold',
    color: '#4F46E5',
  },

  // Card bottom
  workerCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateAmount: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  rateType: {
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
    color: '#94A3B8',
  },
  workerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    gap: 4,
  },
  viewProfileText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#4F46E5',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#10B981',
    gap: 4,
  },
  callText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
});
