import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Bell,
  MapPin,
  Clock,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { DeviceFeedback } from '../services/deviceFeedback';

export default function WorkerAlertsScreen({
  insets,
  alerts = [],
  onApproveAlert,
  onRejectAlert,
  onNavigateTab,
  lang = 'en',
  t = {},
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'UPCOMING'
  const [localAlerts, setLocalAlerts] = useState(alerts);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    setLocalAlerts(alerts);
    setCountdowns((prev) => {
      const next = { ...prev };
      (alerts || []).forEach((a) => {
        if (next[a.id] === undefined) {
          next[a.id] = a.expiresInSeconds || 300; // 5-minute countdown (300s)
        }
      });
      return next;
    });

    if (alerts && alerts.length > 0) {
      DeviceFeedback.triggerAlertHaptics();
    }
  }, [alerts]);

  // Live 5-Minute Countdown Timer & Ring/Buzz Alert Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) => {
        let hasChanges = false;
        const next = { ...prev };

        Object.keys(next).forEach((id) => {
          if (next[id] > 0) {
            next[id] -= 1;
            hasChanges = true;

            // Trigger ring/buzz vibration every 30 seconds to alert worker like Uber
            if (next[id] % 30 === 0 && next[id] > 0) {
              DeviceFeedback.triggerAlertHaptics();
            }
          } else if (next[id] === 0) {
            // 5 Minutes Elapsed: Automatically decline & forward to next worker
            next[id] = -1;
            hasChanges = true;
            DeviceFeedback.triggerAlertHaptics();
            setLocalAlerts((prevAlerts) => prevAlerts.filter((item) => item.id !== id));
            if (onRejectAlert) {
              onRejectAlert(id, true); // true = timed out
            }
          }
        });

        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRejectAlert]);

  const filteredAlerts = localAlerts.filter((a) => {
    if (filter === 'TODAY') return a.date.toLowerCase().includes('today');
    if (filter === 'UPCOMING') return !a.date.toLowerCase().includes('today');
    return true;
  });

  const handleApprove = (alertItem) => {
    Alert.alert(
      'Approve Booking Request? ✅',
      `Accept ${alertItem.customerName}'s request for ${alertItem.title} at ${alertItem.offeredRate}?\n\nThis will add it to your Bookings tab and unlock the customer's direct phone number.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Move to Bookings',
          style: 'default',
          onPress: () => {
            DeviceFeedback.triggerSuccessHaptics();
            setLocalAlerts((prev) => prev.filter((item) => item.id !== alertItem.id));
            if (onApproveAlert) {
              onApproveAlert(alertItem);
            }
            Alert.alert(
              'Booking Accepted! 🎉',
              'The job is now in your Bookings tab with customer contact details and progress tracker.',
              [
                {
                  text: 'View in Bookings',
                  onPress: () => onNavigateTab && onNavigateTab('BOOKINGS'),
                },
                { text: 'OK' },
              ]
            );
          },
        },
      ]
    );
  };

  const handleReject = (alertItem) => {
    Alert.alert(
      'Decline Request?',
      `Are you sure you want to decline this job from ${alertItem.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setLocalAlerts((prev) => prev.filter((item) => item.id !== alertItem.id));
            if (onRejectAlert) {
              onRejectAlert(alertItem.id);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 10 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>
            {lang === 'hi' ? 'जॉब अलर्ट और अनुरोध' : 'Job Alerts & Requests'}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{localAlerts.length} {lang === 'hi' ? 'नए' : 'New'}</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>
          {lang === 'hi'
            ? 'ग्राहक के काम के अनुरोध स्वीकार या अस्वीकार करें'
            : 'Accept or decline real-time work requests from nearby customers'}
        </Text>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {[
            { key: 'ALL', label: lang === 'hi' ? `सभी अनुरोध (${localAlerts.length})` : `All Requests (${localAlerts.length})` },
            { key: 'TODAY', label: lang === 'hi' ? 'आज के कार्य' : 'Immediate Today' },
            { key: 'UPCOMING', label: lang === 'hi' ? 'आगामी कार्य' : 'Upcoming' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, filter === tab.key && styles.filterChipActive]}
              onPress={() => setFilter(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filter === tab.key && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets?.bottom ? insets.bottom + 90 : 100 }]}
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Bell size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Pending Alerts</Text>
            <Text style={styles.emptySub}>
              You have responded to all incoming requests! Keep your Availability set to ON to receive more alerts from nearby customers.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => onNavigateTab && onNavigateTab('HOME')}
            >
              <Text style={styles.emptyActionText}>Check Availability on Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAlerts.map((alertItem) => {
            const sec = countdowns[alertItem.id] ?? 300;
            const min = Math.floor(sec / 60);
            const remainSec = String(sec % 60).padStart(2, '0');

            return (
              <View key={alertItem.id} style={styles.alertCard}>
                {/* Uber-Style 5-Minute Countdown & Auto-Forward Banner */}
                <View style={styles.countdownBanner}>
                  <View style={styles.countdownHeaderRow}>
                    <View style={styles.countdownPill}>
                      <Clock size={12} color="#DC2626" />
                      <Text style={styles.countdownPillText}>
                        {lang === 'hi' ? `समय शेष: ${min}:${remainSec}` : `Time Left: ${min}:${remainSec}`}
                      </Text>
                    </View>
                    <Text style={styles.countdownNotice}>
                      {lang === 'hi' ? '5 मिनट में अगले मिस्त्री को ट्रांसफर होगा' : 'Auto-forwards in 5 mins'}
                    </Text>
                  </View>
                </View>

                {/* Card Header */}
                <View style={styles.cardTopRow}>
                  <View style={styles.customerRow}>
                    <View style={[styles.customerAvatar, { backgroundColor: alertItem.customerColor || '#0284C7' }]}>
                      <Text style={styles.avatarText}>{alertItem.customerAvatar || 'CU'}</Text>
                    </View>
                    <View style={styles.customerMeta}>
                      <View style={styles.customerNameRow}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {alertItem.customerName}
                        </Text>
                        <View style={styles.clientBadge}>
                          <Text style={styles.clientBadgeText}>Customer</Text>
                        </View>
                      </View>
                      <View style={styles.locRow}>
                        <MapPin size={11} color="#64748B" />
                        <Text style={styles.locText} numberOfLines={1}>
                          {alertItem.location} • {alertItem.distance}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Direct On-Site Agreement Pill */}
                  <View style={styles.ratePill}>
                    <Text style={[styles.ratePillAmount, { fontSize: 13, color: '#16A34A' }]}>
                      {lang === 'hi' ? 'सीधा भुगतान' : 'Direct Pay'}
                    </Text>
                    <Text style={styles.ratePillUnit}>
                      {lang === 'hi' ? 'ऑन-साइट तय करें' : 'Quote On-Site'}
                    </Text>
                  </View>
                </View>

                {/* Job Title & Details */}
                <View style={styles.jobBox}>
                  <View style={styles.categoryBadge}>
                    <Briefcase size={10} color="#4F46E5" />
                    <Text style={styles.categoryBadgeText}>{alertItem.category}</Text>
                  </View>
                  <Text style={styles.jobTitle}>{alertItem.title}</Text>
                  <Text style={{ fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 3 }}>
                    {lang === 'hi'
                      ? '• वास्तविक काम का रेट आप साइट विजिट करके तय करेंगे'
                      : '• Final work rate is decided directly by you upon site inspection'}
                  </Text>
                  {alertItem.description ? (
                    <Text style={styles.jobDesc} numberOfLines={2}>
                      "{alertItem.description}"
                    </Text>
                  ) : null}
                </View>

              {/* Timing & Escrow Guarantee */}
              <View style={styles.metaRow}>
                <View style={styles.timeTag}>
                  <Clock size={11} color="#475569" />
                  <Text style={styles.timeTagText}>{alertItem.date} ({alertItem.duration})</Text>
                </View>

                {(alertItem.escrowProtected || alertItem.paymentLocked) && (
                  <View style={styles.escrowBadge}>
                    <ShieldCheck size={11} color="#15803D" />
                    <Text style={styles.escrowBadgeText}>Payment Protected</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons: Approve or Reject */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(alertItem)}
                  activeOpacity={0.7}
                >
                  <X size={15} color="#DC2626" />
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(alertItem)}
                  activeOpacity={0.85}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.approveBtnText}>Approve & Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
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
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  countBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#4F46E5',
  },
  headerSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
  },
  filterChipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },

  /* Scroll list */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  countdownBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  countdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countdownPillText: {
    fontFamily: 'Satoshi-Black',
    fontSize: 12,
    color: '#DC2626',
  },
  countdownNotice: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#B91C1C',
    flexShrink: 1,
    textAlign: 'right',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  customerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  customerMeta: {
    flex: 1,
    minWidth: 0,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  customerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14.5,
    color: '#0F172A',
    flexShrink: 1,
  },
  clientBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  clientBadgeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 9,
    color: '#64748B',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  ratePill: {
    alignItems: 'flex-end',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexShrink: 0,
  },
  ratePillAmount: {
    fontFamily: 'Satoshi-Black',
    fontSize: 16,
    color: '#15803D',
  },
  ratePillUnit: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 9,
    color: '#166534',
  },

  /* Job Box */
  jobBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#4F46E5',
  },
  jobTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  jobDesc: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },

  /* Meta Row */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeTagText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#475569',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  escrowBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9.5,
    color: '#15803D',
  },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 11,
    borderRadius: 12,
  },
  rejectBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#DC2626',
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  approveBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
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
