import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  Users,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Plus,
  Minus,
  ShieldCheck,
  Zap,
  Building,
  Check,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { DeviceFeedback } from '../services/deviceFeedback';
import RazorpayModal from '../components/RazorpayModal';

const CREW_ROLES = [
  { id: 'mason', name: 'Mason (Raj Mistri)', icon: '🧱', baseRate: 1100, unit: 'day' },
  { id: 'beldar', name: 'Mason Helper (Beldar)', icon: '👷', baseRate: 650, unit: 'day' },
  { id: 'labour', name: 'General Construction Labour', icon: '🏗️', baseRate: 600, unit: 'day' },
  { id: 'carpenter', name: 'Shuttering Carpenter', icon: '🪵', baseRate: 1050, unit: 'day' },
  { id: 'steelfixer', name: 'Steel Fixer / Bar Bender', icon: '⛓️', baseRate: 1000, unit: 'day' },
  { id: 'painter', name: 'Wall Painter', icon: '🎨', baseRate: 850, unit: 'day' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', baseRate: 900, unit: 'day' },
  { id: 'plumber', name: 'Plumber', icon: '🔧', baseRate: 950, unit: 'day' },
];

export default function ContractorScreen({ insets, onNavigateTab, onDeployContractorBooking, workers = [] }) {
  // Crew selection: { [roleId]: count }
  const [crewCounts, setCrewCounts] = useState({
    mason: 2,
    beldar: 3,
    labour: 1,
  });

  // Duration: 'hourly' | 'half' | 'full' | 'multi'
  const [durationType, setDurationType] = useState('full');
  const [hoursCount, setHoursCount] = useState(4);
  const [daysCount, setDaysCount] = useState(3);

  // Site Location
  const [siteLocation, setSiteLocation] = useState('Plot 42, Jagatpura Extension, Jaipur');
  const [siteLandmark, setSiteLandmark] = useState('Near Akshay Patra Temple');
  const [locLoading, setLocLoading] = useState(false);

  // Payment Method
  const [payMethod, setPayMethod] = useState('upi'); // 'upi' | 'card'
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayBookingData, setRazorpayBookingData] = useState(null);

  // Update crew counter
  const updateCount = (roleId, delta) => {
    setCrewCounts((prev) => {
      const current = prev[roleId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [roleId]: next };
    });
  };

  const totalWorkers = Object.values(crewCounts).reduce((sum, count) => sum + count, 0);

  // Fetch GPS location
  const handleUseGps = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permission to fetch GPS address.');
        setLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const rev = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (rev && rev.length > 0) {
        const place = rev[0];
        const addr = `${place.name || place.street || 'Site Area'}, ${place.subregion || place.city || 'Jaipur'}`;
        setSiteLocation(addr);
      }
    } catch (e) {
      console.log('GPS Error:', e);
    } finally {
      setLocLoading(false);
    }
  };

  // Pricing multiplier
  const getDurationMultiplier = () => {
    switch (durationType) {
      case 'hourly':
        return (hoursCount * 150) / 900; // hourly rate approx
      case 'half':
        return 0.55; // 55% of full day
      case 'full':
        return 1.0;
      case 'multi':
        return daysCount;
      default:
        return 1.0;
    }
  };

  // Calculate Subtotal
  const multiplier = getDurationMultiplier();
  let baseCrewCost = 0;
  CREW_ROLES.forEach((role) => {
    const count = crewCounts[role.id] || 0;
    baseCrewCost += count * role.baseRate * multiplier;
  });

  const subtotal = Math.round(baseCrewCost);
  const platformFee = Math.round(subtotal * 0.05);
  const gst = Math.round(platformFee * 0.18);
  const grandTotal = subtotal + platformFee + gst;

  // Confirm booking
  const handleConfirmBooking = () => {
    if (totalWorkers === 0) {
      Alert.alert('Select Workers', 'Please add at least 1 worker to your crew.');
      return;
    }
    if (!siteLocation.trim()) {
      Alert.alert('Site Location Required', 'Please enter your project site address.');
      return;
    }

    Alert.alert(
      'Confirm Group Booking',
      `Crew: ${totalWorkers} Workers\nDuration: ${
        durationType === 'hourly'
          ? `${hoursCount} Hours`
          : durationType === 'half'
          ? 'Half Day (4 hrs)'
          : durationType === 'full'
          ? 'Full Day (8 hrs)'
          : `${daysCount} Days`
      }\nSite: ${siteLocation}\nTotal: ₹${grandTotal.toLocaleString('en-IN')}`,
      [
        { text: 'Modify', style: 'cancel' },
        {
          text: 'Proceed to Payment →',
          onPress: () => {
            DeviceFeedback.triggerSuccessHaptics();
            const liveList = Array.isArray(workers) ? workers : [];
            const availableWorkers = liveList.filter((w) => w.available === true);
            const assigned = availableWorkers.slice(0, totalWorkers).map((w) => ({
              workerId: w.id,
              name: w.name,
              skill: w.skill,
              phone: w.phone,
              rate: w.rate,
              avatar: w.avatar,
              color: w.color,
            }));

            const contractorPayload = {
              totalWorkers,
              crewBreakdown: crewCounts,
              assignedWorkers: assigned,
              siteLocation,
              duration:
                durationType === 'hourly'
                  ? `${hoursCount} Hours`
                  : durationType === 'half'
                  ? 'Half Day (4 hrs)'
                  : durationType === 'full'
                  ? 'Full Day (8 hrs)'
                  : `${daysCount} Days`,
              subtotal,
              platformFee: 99,
              transactionFee: Math.round(subtotal * 0.05),
              totalAmount: subtotal + 99 + Math.round(subtotal * 0.05),
            };

            const bookingData = {
              workerName: `${totalWorkers} Worker Crew`,
              workerSkill: 'Contractor Crew Deployment',
              workerFee: subtotal,
              platformFee: 99,
              txnFee: Math.round(subtotal * 0.05),
              totalAmount: subtotal + 99 + Math.round(subtotal * 0.05),
              contractorPayload,
            };

            setRazorpayBookingData(bookingData);
            setShowRazorpayModal(true);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerBadge}>
            <Users size={14} color="#4F46E5" />
            <Text style={styles.headerBadgeText}>GROUP CREW BOOKING</Text>
          </View>
          <Text style={styles.headerTitle}>Contractor Mode</Text>
          <Text style={styles.headerSub}>Book multiple workers for full site execution</Text>
        </View>
        <View style={styles.crewCountBadge}>
          <Text style={styles.crewCountNum}>{totalWorkers}</Text>
          <Text style={styles.crewCountLabel}>Workers</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets?.bottom ? insets.bottom + 120 : 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── SECTION 1: SELECT WORKERS ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.sectionHeaderTitleCol}>
              <Text style={styles.sectionTitle}>Select Crew Requirements</Text>
              <Text style={styles.sectionSub}>Add the number of workers per skill</Text>
            </View>
          </View>

          {/* Worker Roles Stepper */}
          <View style={styles.rolesList}>
            {CREW_ROLES.map((role) => {
              const count = crewCounts[role.id] || 0;
              return (
                <View key={role.id} style={styles.roleItem}>
                  <View style={styles.roleLeft}>
                    <View style={styles.roleEmojiWrap}>
                      <Text style={styles.roleEmoji}>{role.icon}</Text>
                    </View>
                    <View style={styles.roleTextCol}>
                      <Text style={styles.roleName} numberOfLines={1}>{role.name}</Text>
                      <Text style={styles.roleRate}>
                        ₹{role.baseRate} / {role.unit}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepperWrap}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, count === 0 && styles.stepperBtnDisabled]}
                      onPress={() => updateCount(role.id, -1)}
                      disabled={count === 0}
                      activeOpacity={0.7}
                    >
                      <Minus size={14} color={count === 0 ? '#CBD5E1' : '#0F172A'} />
                    </TouchableOpacity>

                    <Text style={styles.stepperCount}>{count}</Text>

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateCount(role.id, 1)}
                      activeOpacity={0.7}
                    >
                      <Plus size={14} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ─── SECTION 2: BOOKING DURATION ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={styles.sectionHeaderTitleCol}>
              <Text style={styles.sectionTitle}>Shift Duration</Text>
              <Text style={styles.sectionSub}>Select working hours or multiple days</Text>
            </View>
          </View>

          <View style={styles.durationGrid}>
            {/* Hourly */}
            <TouchableOpacity
              style={[
                styles.durationOption,
                durationType === 'hourly' && styles.durationOptionActive,
              ]}
              onPress={() => setDurationType('hourly')}
              activeOpacity={0.8}
            >
              <Clock size={20} color={durationType === 'hourly' ? '#4F46E5' : '#64748B'} />
              <Text
                style={[
                  styles.durationTitle,
                  durationType === 'hourly' && styles.durationTitleActive,
                ]}
              >
                Hourly
              </Text>
              <Text style={styles.durationSub}>₹150/hr/worker</Text>
            </TouchableOpacity>

            {/* Half Day */}
            <TouchableOpacity
              style={[
                styles.durationOption,
                durationType === 'half' && styles.durationOptionActive,
              ]}
              onPress={() => setDurationType('half')}
              activeOpacity={0.8}
            >
              <Zap size={20} color={durationType === 'half' ? '#4F46E5' : '#64748B'} />
              <Text
                style={[
                  styles.durationTitle,
                  durationType === 'half' && styles.durationTitleActive,
                ]}
              >
                Half Day
              </Text>
              <Text style={styles.durationSub}>4 Hours shift</Text>
            </TouchableOpacity>

            {/* Full Day */}
            <TouchableOpacity
              style={[
                styles.durationOption,
                durationType === 'full' && styles.durationOptionActive,
              ]}
              onPress={() => setDurationType('full')}
              activeOpacity={0.8}
            >
              <Building size={20} color={durationType === 'full' ? '#4F46E5' : '#64748B'} />
              <Text
                style={[
                  styles.durationTitle,
                  durationType === 'full' && styles.durationTitleActive,
                ]}
              >
                Full Day
              </Text>
              <Text style={styles.durationSub}>8 Hours (9-5)</Text>
            </TouchableOpacity>

            {/* Multiple Days */}
            <TouchableOpacity
              style={[
                styles.durationOption,
                durationType === 'multi' && styles.durationOptionActive,
              ]}
              onPress={() => setDurationType('multi')}
              activeOpacity={0.8}
            >
              <Calendar size={20} color={durationType === 'multi' ? '#4F46E5' : '#64748B'} />
              <Text
                style={[
                  styles.durationTitle,
                  durationType === 'multi' && styles.durationTitleActive,
                ]}
              >
                Multiple Days
              </Text>
              <Text style={styles.durationSub}>Weekly / Monthly</Text>
            </TouchableOpacity>
          </View>

          {/* Stepper for Multiple Days */}
          {durationType === 'multi' && (
            <View style={styles.multiDaysCard}>
              <View style={styles.multiDaysTextCol}>
                <Text style={styles.multiDaysLabel}>Number of Working Days:</Text>
                <Text style={styles.multiDaysSub}>Crew will report for {daysCount} consecutive days</Text>
              </View>
              <View style={styles.stepperWrap}>
                <TouchableOpacity
                  style={[styles.stepperBtn, daysCount <= 1 && styles.stepperBtnDisabled]}
                  onPress={() => setDaysCount(Math.max(1, daysCount - 1))}
                  disabled={daysCount <= 1}
                >
                  <Minus size={14} color="#0F172A" />
                </TouchableOpacity>
                <Text style={[styles.stepperCount, { minWidth: 32 }]}>{daysCount} d</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setDaysCount(daysCount + 1)}
                >
                  <Plus size={14} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stepper for Hourly */}
          {durationType === 'hourly' && (
            <View style={styles.multiDaysCard}>
              <View style={styles.multiDaysTextCol}>
                <Text style={styles.multiDaysLabel}>Hours Required:</Text>
                <Text style={styles.multiDaysSub}>Short shift: {hoursCount} hours per worker</Text>
              </View>
              <View style={styles.stepperWrap}>
                <TouchableOpacity
                  style={[styles.stepperBtn, hoursCount <= 2 && styles.stepperBtnDisabled]}
                  onPress={() => setHoursCount(Math.max(2, hoursCount - 1))}
                  disabled={hoursCount <= 2}
                >
                  <Minus size={14} color="#0F172A" />
                </TouchableOpacity>
                <Text style={[styles.stepperCount, { minWidth: 32 }]}>{hoursCount} h</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setHoursCount(hoursCount + 1)}
                >
                  <Plus size={14} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ─── SECTION 3: SITE LOCATION ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <View style={styles.sectionHeaderTitleCol}>
              <Text style={styles.sectionTitle}>Working Site Location</Text>
              <Text style={styles.sectionSub}>Where should the crew report?</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Site Address / Plot Number</Text>
            <TextInput
              style={styles.textInput}
              value={siteLocation}
              onChangeText={setSiteLocation}
              placeholder="e.g. Plot 15, Vaishali Nagar, Jaipur"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity
            style={styles.gpsAutoBtn}
            onPress={handleUseGps}
            activeOpacity={0.8}
            disabled={locLoading}
          >
            {locLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <>
                <MapPin size={15} color="#4F46E5" />
                <Text style={styles.gpsAutoBtnText}>Use Current GPS Location</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Landmark / Gate Instructions</Text>
            <TextInput
              style={styles.textInput}
              value={siteLandmark}
              onChangeText={setSiteLandmark}
              placeholder="e.g. Opposite Main Water Tank"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* ─── SECTION 4: COST BREAKDOWN & SUMMARY ─── */}
        <View style={[styles.sectionCard, styles.summaryCard]}>
          <Text style={styles.summaryTitle}>COST SUMMARY & PAYMENT</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Crew Wage ({totalWorkers} workers ×{' '}
              {durationType === 'multi' ? `${daysCount}d` : durationType})
            </Text>
            <Text style={styles.summaryVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Service Fee (5%)</Text>
            <Text style={styles.summaryVal}>₹{platformFee.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18% on fee)</Text>
            <Text style={styles.summaryVal}>₹{gst.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total Payable</Text>
            <Text style={styles.summaryTotalVal}>₹{grandTotal.toLocaleString('en-IN')}</Text>
          </View>

          {/* Payment Method Pills */}
          <Text style={[styles.inputLabel, { marginTop: 16, marginBottom: 8 }]}>
            Payment Mode (Razorpay Secure)
          </Text>
          <View style={styles.paymentMethodRow}>
            <TouchableOpacity
              style={[styles.payPill, payMethod === 'upi' && styles.payPillActive]}
              onPress={() => setPayMethod('upi')}
            >
              <Text style={[styles.payPillText, payMethod === 'upi' && styles.payPillTextActive]}>
                UPI / QR / GPay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.payPill, payMethod === 'card' && styles.payPillActive]}
              onPress={() => setPayMethod('card')}
            >
              <Text style={[styles.payPillText, payMethod === 'card' && styles.payPillTextActive]}>
                Cards & NetBanking
              </Text>
            </TouchableOpacity>
          </View>

          {/* Guarantees */}
          <View style={styles.guaranteeRow}>
            <ShieldCheck size={16} color="#15803D" />
            <Text style={styles.guaranteeText}>
              100% Verified Aadhaar Mistris • Razorpay Protected
            </Text>
          </View>

          {/* Deploy Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmBooking}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>
              Deploy Crew Now • ₹{grandTotal.toLocaleString('en-IN')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── RAZORPAY CHECKOUT MODAL ─── */}
      <RazorpayModal
        visible={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        bookingData={razorpayBookingData}
        onPaymentSuccess={(completedDetails) => {
          setShowRazorpayModal(false);
          if (onDeployContractorBooking && razorpayBookingData?.contractorPayload) {
            onDeployContractorBooking({
              ...razorpayBookingData.contractorPayload,
              paymentId: completedDetails.paymentId,
              paymentMethod: completedDetails.paymentMethod,
              totalAmount: completedDetails.totalAmount,
            });
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  headerBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#4F46E5',
    letterSpacing: 0.8,
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
  crewCountBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 64,
    flexShrink: 0,
  },
  crewCountNum: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#4F46E5',
  },
  crewCountLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 10,
    color: '#64748B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionHeaderTitleCol: {
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  sectionSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rolesList: {
    gap: 10,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  roleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  roleEmojiWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleEmoji: {
    fontSize: 20,
  },
  roleTextCol: {
    flex: 1,
  },
  roleName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  roleRate: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexShrink: 0,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperCount: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationOption: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 4,
  },
  durationOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  durationTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  durationTitleActive: {
    color: '#4F46E5',
  },
  durationSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  multiDaysCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  multiDaysTextCol: {
    flex: 1,
    marginRight: 10,
  },
  multiDaysLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
  },
  multiDaysSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#0F172A',
  },
  gpsAutoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    borderRadius: 10,
  },
  gpsAutoBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#4F46E5',
  },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  summaryTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#818CF8',
    letterSpacing: 1,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
    marginRight: 10,
  },
  summaryVal: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryTotalLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  summaryTotalVal: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 22,
    color: '#10B981',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  payPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  payPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1',
  },
  payPillText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  payPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  guaranteeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#86EFAC',
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
