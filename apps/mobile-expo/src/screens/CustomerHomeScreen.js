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
} from 'lucide-react-native';
import * as Location from 'expo-location';

import { CATEGORIES, CATEGORY_GROUPS } from '../data/categories';
import { MOCK_WORKERS } from '../data/mockWorkers';
import RazorpayModal from '../components/RazorpayModal';

/* ─── helpers ─── */
const shortName = (full) => {
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

  // Filter Workers: Online Only + Category Filter + Search Query Filter
  const nearbyWorkers = useMemo(() => {
    return MOCK_WORKERS.filter((w) => {
      // 1. Online / Available only
      if (w.available !== true) return false;

      // 2. Category selection filter
      if (selectedCategory) {
        const catTarget = selectedCategory.toLowerCase().replace(/ worker| mistri| expert| labour/g, '').trim();
        const wCat = (w.category || '').toLowerCase();
        const wSkill = (w.skill || '').toLowerCase();
        if (!wCat.includes(catTarget) && !wSkill.includes(catTarget)) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (w.name || '').toLowerCase().includes(q);
        const matchesSkill = (w.skill || '').toLowerCase().includes(q);
        const matchesCat = (w.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSkill && !matchesCat) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

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
        <View style={[styles.workerAvatar, { backgroundColor: item.color }]}>
          <Text style={styles.workerAvatarText}>{item.avatar}</Text>
        </View>

        {/* Info */}
        <View style={styles.workerInfo}>
          <View style={styles.workerNameRow}>
            <Text style={styles.workerName} numberOfLines={1}>{item.name}</Text>
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
          <TouchableOpacity
            style={styles.hireBtn}
            activeOpacity={0.8}
            onPress={() => setSelectedWorker(item)}
          >
            <Text style={styles.hireBtnText}>Book</Text>
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
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>RS</Text>
            </View>
            <View>
              <Text style={styles.greetingSub}>Good morning 👋</Text>
              <Text style={styles.greetingName}>Hello, Ramesh!</Text>
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
          </View>
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

        {/* ─── 5. 25 Labour Categories Grid ─── */}
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          numColumns={4}
          renderItem={renderCategoryItem}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoryGrid}
        />

        {/* ─── 6. Nearby Workers (<15km) ─── */}
        <View style={styles.sectionHeader}>
          <View style={styles.nearbyTitleRow}>
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `${selectedCategory}s Online (${nearbyWorkers.length})`
                : searchQuery
                ? `Search: "${searchQuery}" (${nearbyWorkers.length})`
                : `Workers near you (${nearbyWorkers.length})`}
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

        {nearbyWorkers.length === 0 ? (
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
          nearbyWorkers.slice(0, 8).map((worker) => (
            <View key={worker.id}>{renderWorkerCard({ item: worker })}</View>
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
                Aadhaar Verified Mistri • Escrow Safe • Police Verification Cleared
              </Text>
            </View>

            <View style={styles.modalFooterRow}>
              <View>
                <Text style={styles.modalRateLabel}>Daily Wage</Text>
                <Text style={styles.modalRateVal}>₹{selectedWorker?.rate} <Text style={{ fontSize: 13, color: '#64748B' }}>/day</Text></Text>
              </View>

              <TouchableOpacity
                style={styles.modalBookBtn}
                onPress={() => handleProceedToBooking(selectedWorker)}
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
                <Text style={styles.modalTitle}>Confirm Booking & Escrow</Text>
                <Text style={styles.modalSub}>{checkoutWorker?.name} • {checkoutWorker?.skill}</Text>
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
