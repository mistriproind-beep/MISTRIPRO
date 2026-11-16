import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  Calendar,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Check,
  Navigation,
  ExternalLink,
} from 'lucide-react-native';
import { DeviceFeedback } from '../services/deviceFeedback';

const STEPS = [
  { step: 1, title: 'Approved', hindi: 'स्वीकृत' },
  { step: 2, title: 'Visited Site', hindi: 'साइट पहुंचे' },
  { step: 3, title: 'Work in Progress', hindi: 'काम चालू' },
  { step: 4, title: 'Work Done', hindi: 'काम पूरा हुआ' },
];

export default function WorkerBookingsScreen({
  insets,
  bookings = [],
  onUpdateBookingStep,
  onCompleteBooking,
  onNavigateTab,
}) {
  const [tab, setTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
  const [localBookings, setLocalBookings] = useState(bookings || []);

  React.useEffect(() => {
    setLocalBookings(bookings || []);
  }, [bookings]);

  const activeBookings = localBookings.filter((b) => b.status === 'active');
  const historyBookings = localBookings.filter((b) => b.status === 'completed');

  // Phone Call
  const handleCall = (phoneNumber, customerName) => {
    if (!phoneNumber) return;
    const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert('Call Customer', `Calling ${customerName} at ${phoneNumber}`);
    });
  };

  // WhatsApp
  const handleWhatsApp = (phoneNumber, customerName, title) => {
    if (!phoneNumber) return;
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Namaste ${customerName} ji! I am Ram Singh Mistri from Mistri Pro regarding your booking "${title}".`
    );
    Linking.openURL(`whatsapp://send?phone=${cleaned}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp chat with ${customerName} (${phoneNumber}).`);
    });
  };

  // Google Maps navigation
  const handleOpenMap = (locationAddress) => {
    const query = encodeURIComponent(locationAddress || 'Sawai Madhopur, Rajasthan');
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  // Advance step progress
  const handleAdvanceStep = (booking) => {
    const currentStep = booking.step || 1;
    if (currentStep === 1) {
      // Step 1 -> Step 2
      Alert.alert(
        'Mark Site Visited? 📍',
        `Confirm that you have arrived at ${booking.customerName}'s work location (${booking.location})?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Reached Site',
            onPress: () => {
              updateBookingStep(booking.id, 2);
              Alert.alert('Status Updated', 'Site Visit recorded! Customer has been notified.');
            },
          },
        ]
      );
    } else if (currentStep === 2) {
      // Step 2 -> Step 3
      Alert.alert(
        'Start Work? 🔨',
        `Start working on "${booking.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Work',
            onPress: () => {
              updateBookingStep(booking.id, 3);
              Alert.alert('Work in Progress', 'Timer & work tracker active.');
            },
          },
        ]
      );
    } else if (currentStep === 3) {
      // Step 3 -> Step 4 (Work Done / Completed)
      Alert.alert(
        'Mark Work Done? 🎉',
        `Have you completed all tasks for "${booking.title}"?\n\nThis will send a completion notification to ${booking.customerName} and transfer ${booking.amount} into your Wallet balance.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Work Completed',
            onPress: () => {
              updateBookingStep(booking.id, 4);
              if (onCompleteBooking) {
                onCompleteBooking(booking);
              }
              Alert.alert(
                'Job Completed! 💰',
                `Congratulations! ${booking.amount} has been released as payment into your Wallet.\n\nMoved to Previous Bookings History.`,
                [
                  {
                    text: 'View Wallet',
                    onPress: () => onNavigateTab && onNavigateTab('EARNINGS'),
                  },
                  { text: 'OK' },
                ]
              );
            },
          },
        ]
      );
    }
  };

  const updateBookingStep = (bookingId, nextStep) => {
    setLocalBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const isDone = nextStep === 4;
          return {
            ...b,
            step: nextStep,
            status: isDone ? 'completed' : b.status,
            payoutStatus: isDone ? 'PAID_TO_WALLET' : b.payoutStatus,
          };
        }
        return b;
      })
    );
    if (onUpdateBookingStep) {
      onUpdateBookingStep(bookingId, nextStep);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>My Bookings & Site Progress</Text>
        </View>
        <Text style={styles.headerSub}>ग्राहक का पता, संपर्क नंबर और काम की प्रगति (Progress Tracker)</Text>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'ACTIVE' && styles.tabBtnActive]}
            onPress={() => setTab('ACTIVE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, tab === 'ACTIVE' && styles.tabBtnTextActive]}>
              Active Jobs ({activeBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'HISTORY' && styles.tabBtnActive]}
            onPress={() => setTab('HISTORY')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, tab === 'HISTORY' && styles.tabBtnTextActive]}>
              Booking History ({historyBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets?.bottom ? insets.bottom + 90 : 100 }]}
      >
        {tab === 'ACTIVE' ? (
          activeBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Calendar size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Active Bookings Right Now</Text>
              <Text style={styles.emptySub}>
                When you approve a customer request from the Alerts tab, it will appear here with full customer contact & location details.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => onNavigateTab && onNavigateTab('ALERTS')}
              >
                <Text style={styles.emptyActionText}>View Incoming Alerts →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            activeBookings.map((booking) => {
              const currentStep = booking.step || 1;
              const progressPct = ((currentStep - 1) / 3) * 100;

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  {/* Card Header: Customer Info */}
                  <View style={styles.cardHeader}>
                    <View style={styles.customerRow}>
                      <View style={[styles.avatar, { backgroundColor: booking.customerColor || '#0284C7' }]}>
                        <Text style={styles.avatarText}>{booking.customerAvatar || 'CU'}</Text>
                      </View>
                      <View style={styles.customerMeta}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {booking.customerName}
                        </Text>
                        <View style={styles.categorySubRow}>
                          <Text style={styles.categoryText}>{booking.category}</Text>
                          <View style={styles.subDot} />
                          <View style={styles.verifiedBadge}>
                            <ShieldCheck size={10} color="#15803D" />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.payoutBadge}>
                      <Text style={styles.payoutAmount}>{booking.amount}</Text>
                      <Text style={styles.payoutSub}>Payment Secured</Text>
                    </View>
                  </View>

                  {/* Job Title & Timing */}
                  <Text style={styles.jobTitle}>{booking.title}</Text>

                  {/* Customer Location & Contact Details */}
                  <View style={styles.locationContactCard}>
                    {/* Location with Google Map direct navigation */}
                    <TouchableOpacity
                      style={styles.locRow}
                      onPress={() => handleOpenMap(booking.location)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={16} color="#DC2626" style={{ marginTop: 2 }} />
                      <View style={styles.locTextCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.locLabel}>Working Site Location:</Text>
                          <View style={styles.openMapLink}>
                            <Text style={styles.openMapLinkText}>Open Google Map</Text>
                            <ExternalLink size={11} color="#2563EB" />
                          </View>
                        </View>
                        <Text style={styles.locAddress}>{booking.location}</Text>
                        <Text style={styles.locDistance}>Distance: {booking.distance || '2.4 km'} from your location</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.locDivider} />

                    {/* Contact Number & Quick Action Buttons */}
                    <View style={styles.contactRow}>
                      <View style={styles.phoneCol}>
                        <Text style={styles.contactLabel}>Customer Contact Number:</Text>
                        <Text style={styles.phoneText}>{booking.customerPhone}</Text>
                      </View>

                      <View style={styles.contactActions}>
                        {/* 1-Tap Phone Call */}
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => handleCall(booking.customerPhone, booking.customerName)}
                          activeOpacity={0.8}
                        >
                          <Phone size={14} color="#FFFFFF" />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>

                        {/* 1-Tap WhatsApp */}
                        <TouchableOpacity
                          style={styles.whatsappBtn}
                          onPress={() => handleWhatsApp(booking.customerPhone, booking.customerName, booking.title)}
                          activeOpacity={0.8}
                        >
                          <MessageSquare size={14} color="#FFFFFF" />
                          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* ─── 4-Step Interactive Progress Bar ─── */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeaderRow}>
                      <Text style={styles.progressSectionTitle}>Work Progress Tracker</Text>
                      <Text style={styles.progressStepCount}>
                        Step {currentStep} of 4 • {STEPS[currentStep - 1].hindi}
                      </Text>
                    </View>

                    {/* Progress Bar Line */}
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.max(progressPct, 8)}%` }]} />
                    </View>

                    {/* Milestones */}
                    <View style={styles.stepsRow}>
                      {STEPS.map((s) => {
                        const isDone = currentStep >= s.step;
                        const isCurrent = currentStep === s.step;
                        return (
                          <View key={s.step} style={styles.stepItem}>
                            <View
                              style={[
                                styles.stepCircle,
                                isDone && styles.stepCircleDone,
                                isCurrent && styles.stepCircleCurrent,
                              ]}
                            >
                              {isDone ? (
                                <Check size={11} color="#FFFFFF" strokeWidth={3} />
                              ) : (
                                <Text style={styles.stepNum}>{s.step}</Text>
                              )}
                            </View>
                            <Text
                              style={[
                                styles.stepTitle,
                                isDone && styles.stepTitleDone,
                                isCurrent && styles.stepTitleCurrent,
                              ]}
                            >
                              {s.title}
                            </Text>
                            <Text style={styles.stepHindi}>{s.hindi}</Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Action button to advance step */}
                    <TouchableOpacity
                      style={[
                        styles.advanceBtn,
                        currentStep === 3 ? styles.advanceBtnFinal : styles.advanceBtnNormal,
                      ]}
                      onPress={() => handleAdvanceStep(booking)}
                      activeOpacity={0.85}
                    >
                      {currentStep === 1 && (
                        <>
                          <Navigation size={16} color="#FFFFFF" />
                          <Text style={styles.advanceBtnText}>I Have Reached Site (साइट पहुंचे)</Text>
                        </>
                      )}
                      {currentStep === 2 && (
                        <>
                          <ArrowRight size={16} color="#FFFFFF" />
                          <Text style={styles.advanceBtnText}>Start Work (काम शुरू करें)</Text>
                        </>
                      )}
                      {currentStep === 3 && (
                        <>
                          <CheckCircle2 size={18} color="#FFFFFF" />
                          <Text style={styles.advanceBtnText}>Mark Work Completed (काम पूरा हुआ)</Text>
                        </>
                      )}
                      {currentStep === 4 && (
                        <>
                          <CheckCircle2 size={16} color="#15803D" />
                          <Text style={[styles.advanceBtnText, { color: '#15803D' }]}>Completed & Paid ✓</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )
        ) : (
          /* HISTORY TAB */
          historyBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Clock size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Completed Bookings Yet</Text>
              <Text style={styles.emptySub}>
                Jobs you finish will be stored here with customer reviews, ratings, and payout receipts.
              </Text>
            </View>
          ) : (
            historyBookings.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyTopRow}>
                  <View style={styles.customerRow}>
                    <View style={[styles.avatar, { backgroundColor: item.customerColor || '#10B981' }]}>
                      <Text style={styles.avatarText}>{item.customerAvatar || 'CU'}</Text>
                    </View>
                    <View style={styles.customerMeta}>
                      <Text style={styles.customerName}>{item.customerName}</Text>
                      <Text style={styles.locText} numberOfLines={1}>{item.location}</Text>
                    </View>
                  </View>

                  <View style={styles.completedBadge}>
                    <CheckCircle2 size={11} color="#15803D" />
                    <Text style={styles.completedBadgeText}>COMPLETED</Text>
                  </View>
                </View>

                <Text style={styles.historyJobTitle}>{item.title}</Text>

                {/* Rating & Review */}
                {item.rating ? (
                  <View style={styles.reviewBox}>
                    <View style={styles.ratingStarsRow}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingNum}>{item.rating} / 5.0</Text>
                    </View>
                    {item.reviewText ? (
                      <Text style={styles.reviewComment}>"{item.reviewText}"</Text>
                    ) : null}
                  </View>
                ) : null}

                {/* Payout Footer */}
                <View style={styles.historyFooter}>
                  <View style={styles.phoneSnippet}>
                    <Phone size={11} color="#64748B" />
                    <Text style={styles.phoneSnippetText}>{item.customerPhone}</Text>
                  </View>

                  <View style={styles.paidPill}>
                    <Text style={styles.paidLabel}>Earnings Credited:</Text>
                    <Text style={styles.paidAmount}>{item.amount}</Text>
                  </View>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  headerSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  tabBtnTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  avatar: {
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
  customerMeta: {
    flex: 1,
    minWidth: 0,
  },
  categorySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  subDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  customerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    flexShrink: 0,
  },
  verifiedText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#15803D',
  },
  categoryText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
  },
  payoutBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexShrink: 0,
  },
  payoutAmount: {
    fontFamily: 'Satoshi-Black',
    fontSize: 16,
    color: '#15803D',
  },
  payoutSub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 9,
    color: '#166534',
  },
  jobTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 12,
  },

  /* Location & Contact Box */
  locationContactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  openMapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  openMapLinkText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#2563EB',
  },
  locTextCol: {
    flex: 1,
  },
  locLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#64748B',
  },
  locAddress: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
  },
  locDistance: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  locDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  phoneCol: {
    flex: 1,
  },
  contactLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 10.5,
    color: '#64748B',
  },
  phoneText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13.5,
    color: '#0F172A',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  callBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  whatsappBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  /* Progress Section */
  progressContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressSectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#3730A3',
  },
  progressStepCount: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#4F46E5',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#C7D2FE',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stepItem: {
    alignItems: 'center',
    width: '24%',
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleDone: {
    backgroundColor: '#4F46E5',
  },
  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: '#3730A3',
  },
  stepNum: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  stepTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepTitleDone: {
    color: '#3730A3',
  },
  stepTitleCurrent: {
    color: '#4F46E5',
  },
  stepHindi: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  advanceBtnNormal: {
    backgroundColor: '#4F46E5',
  },
  advanceBtnFinal: {
    backgroundColor: '#16A34A',
  },
  advanceBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    flexShrink: 1,
    textAlign: 'center',
  },

  /* History Card */
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  locText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  completedBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9.5,
    color: '#15803D',
  },
  historyJobTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
  },
  reviewBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingNum: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#92400E',
  },
  reviewComment: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11.5,
    color: '#78350F',
    fontStyle: 'italic',
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  phoneSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneSnippetText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  paidAmount: {
    fontFamily: 'Satoshi-Black',
    fontSize: 14,
    color: '#15803D',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  emptySub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
