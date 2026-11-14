import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  FileText,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react-native';
import { MOCK_BOOKINGS } from '../data/mockWorkers';

export default function MyBookingsScreen({ insets, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'cancelled'
  const [bookingsList, setBookingsList] = useState(MOCK_BOOKINGS);

  const filteredBookings = bookingsList.filter((b) => b.status === activeTab);

  const getStatusCounts = () => {
    const active = bookingsList.filter((b) => b.status === 'active').length;
    const completed = bookingsList.filter((b) => b.status === 'completed').length;
    const cancelled = bookingsList.filter((b) => b.status === 'cancelled').length;
    return { active, completed, cancelled };
  };

  const counts = getStatusCounts();

  const handleAction = (booking, action) => {
    if (action === 'call') {
      Alert.alert('Calling Worker', `Dialing ${booking.workerName}...`);
    } else if (action === 'track') {
      Alert.alert(
        'Live Job Tracking',
        `Job: ${booking.title}\nWorker: ${booking.workerName}\nSite: ${booking.location}\nStatus: Work in progress (Day 2 of ${booking.duration})`
      );
    } else if (action === 'review') {
      Alert.alert('Rate & Review', `Leave a 5-star review for ${booking.workerName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit 5 ★', onPress: () => Alert.alert('Thank You!', 'Review submitted successfully.') },
      ]);
    } else if (action === 'rebook') {
      Alert.alert('Rebooking', `Creating new booking with ${booking.workerName}...`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const newBooking = {
              ...booking,
              id: `B-${Date.now().toString().slice(-3)}`,
              status: 'active',
              date: 'Tomorrow, 9:00 AM',
            };
            setBookingsList([newBooking, ...bookingsList]);
            setActiveTab('active');
            Alert.alert('Success', 'Worker rebooked for tomorrow!');
          },
        },
      ]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            Track your daily labour & contractor bookings
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newBookingBtn}
          onPress={() => onNavigateTab && onNavigateTab('HOME')}
          activeOpacity={0.8}
        >
          <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.newBookingBtnText}>Book Mistri</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'active' && styles.tabItemActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({counts.active})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'completed' && styles.tabItemActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({counts.completed})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'cancelled' && styles.tabItemActive]}
          onPress={() => setActiveTab('cancelled')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
            Cancelled ({counts.cancelled})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets?.bottom ? insets.bottom + 120 : 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <FileText size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'active'
                ? 'You have no ongoing or upcoming bookings. Hire a mistri today!'
                : `You don't have any ${activeTab} bookings.`}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => onNavigateTab && onNavigateTab('HOME')}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>Find Available Workers</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {/* Card Top */}
              <View style={styles.cardHeader}>
                <View style={styles.workerRow}>
                  <View style={[styles.workerAvatar, { backgroundColor: booking.workerColor }]}>
                    <Text style={styles.avatarText}>{booking.workerAvatar}</Text>
                  </View>
                  <View style={styles.workerMeta}>
                    <View style={styles.workerNameRow}>
                      <Text style={styles.workerName} numberOfLines={1}>
                        {booking.workerName}
                      </Text>
                      <View style={styles.kycBadge}>
                        <ShieldCheck size={10} color="#15803D" />
                        <Text style={styles.kycText}>Verified</Text>
                      </View>
                    </View>
                    <Text style={styles.categoryPillText}>{booking.category}</Text>
                  </View>
                </View>

                {/* Status Indicator Pill */}
                <View
                  style={[
                    styles.statusPill,
                    booking.status === 'active' && styles.statusPillActive,
                    booking.status === 'completed' && styles.statusPillCompleted,
                    booking.status === 'cancelled' && styles.statusPillCancelled,
                  ]}
                >
                  {booking.status === 'active' && <View style={styles.activeDot} />}
                  {booking.status === 'completed' && <CheckCircle2 size={12} color="#15803D" />}
                  {booking.status === 'cancelled' && <XCircle size={12} color="#DC2626" />}
                  <Text
                    style={[
                      styles.statusPillLabel,
                      booking.status === 'active' && styles.statusLabelActive,
                      booking.status === 'completed' && styles.statusLabelCompleted,
                      booking.status === 'cancelled' && styles.statusLabelCancelled,
                    ]}
                  >
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Booking Title */}
              <Text style={styles.bookingTitle}>{booking.title}</Text>

              {/* Info Rows */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <MapPin size={14} color="#64748B" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {booking.location}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Calendar size={14} color="#64748B" />
                  <Text style={styles.infoText}>
                    {booking.date} • {booking.time}
                  </Text>
                  <View style={styles.durationBadge}>
                    <Clock size={11} color="#4F46E5" />
                    <Text style={styles.durationBadgeText}>{booking.duration}</Text>
                  </View>
                </View>
              </View>

              {/* Price & Actions Row */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.amountLabel}>Total Escrow</Text>
                  <Text style={styles.amountValue}>{booking.amount}</Text>
                </View>

                <View style={styles.actionsGroup}>
                  {booking.status === 'active' && (
                    <>
                      <TouchableOpacity
                        style={styles.callSmallBtn}
                        onPress={() => handleAction(booking, 'call')}
                        activeOpacity={0.8}
                      >
                        <Phone size={14} color="#4F46E5" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={() => handleAction(booking, 'track')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.primaryActionBtnText}>Track Work</Text>
                        <ChevronRight size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  )}

                  {booking.status === 'completed' && (
                    <TouchableOpacity
                      style={[styles.primaryActionBtn, { backgroundColor: '#059669' }]}
                      onPress={() => handleAction(booking, 'review')}
                      activeOpacity={0.85}
                    >
                      <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.primaryActionBtnText}>Rate Mistri</Text>
                    </TouchableOpacity>
                  )}

                  {booking.status === 'cancelled' && (
                    <TouchableOpacity
                      style={styles.rebookBtn}
                      onPress={() => handleAction(booking, 'rebook')}
                      activeOpacity={0.85}
                    >
                      <RotateCcw size={14} color="#EA580C" />
                      <Text style={styles.rebookBtnText}>Rebook</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeftCol: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 22,
    color: '#0F172A',
  },
  headerSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    flexShrink: 0,
  },
  newBookingBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabItemActive: {
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
    fontFamily: 'Satoshi-Bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  workerMeta: {
    flex: 1,
    minWidth: 0,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  workerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    flexShrink: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    flexShrink: 0,
  },
  kycText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#15803D',
  },
  categoryPillText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  statusPillActive: {
    backgroundColor: '#EEF2FF',
  },
  statusPillCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusPillCancelled: {
    backgroundColor: '#FEE2E2',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  statusPillLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statusLabelActive: {
    color: '#4F46E5',
  },
  statusLabelCompleted: {
    color: '#15803D',
  },
  statusLabelCancelled: {
    color: '#DC2626',
  },
  bookingTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#4F46E5',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  amountValue: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: '#0F172A',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
  },
  primaryActionBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
  },
  rebookBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#EA580C',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
