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
  Modal,
  TextInput,
  ActivityIndicator,
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
  X,
  KeyRound,
  ShieldAlert,
} from 'lucide-react-native';
import { DeviceFeedback } from '../services/deviceFeedback';
import { LiveBackend } from '../services/liveBackend';
import { tw } from '../data/workerTranslations';

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
  lang = 'en',
  t = {},
}) {
  const [tab, setTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
  const [localBookings, setLocalBookings] = useState(Array.isArray(bookings) ? bookings : []);

  // OTP Verification Modal State
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpType, setOtpType] = useState('ARRIVAL'); // 'ARRIVAL' | 'COMPLETION' | 'CANCELLATION'
  const [targetBooking, setTargetBooking] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  React.useEffect(() => {
    setLocalBookings(Array.isArray(bookings) ? bookings : []);
  }, [bookings]);

  const safeBookings = Array.isArray(localBookings) ? localBookings : [];

  const activeBookings = safeBookings.filter((b) => {
    if (!b) return false;
    const s = (b.status || '').toLowerCase();
    const step = Number(b.step || b.progress_step || 1);
    if (s === 'completed' || step === 4) return false;
    if (s === 'cancelled' || s === 'cancelled_on_site' || s === 'rejected' || s === 'refunded') return false;
    return s === 'active' || s === 'confirmed' || s === 'in_progress' || s === 'reached_site' || s === 'waiting_confirmation' || step < 4;
  });

  const historyBookings = safeBookings.filter((b) => {
    if (!b) return false;
    const s = (b.status || '').toLowerCase();
    const step = Number(b.step || b.progress_step || 1);
    return s === 'completed' || step === 4;
  });

  // Phone Call
  const handleCall = (phoneNumber, customerName) => {
    const name = customerName || 'Customer';
    if (!phoneNumber || !String(phoneNumber).trim()) {
      Alert.alert('Call Customer', `Contact number for ${name} is not available.`);
      return;
    }
    const cleaned = String(phoneNumber).replace(/[^0-9+]/g, '');
    if (!cleaned || cleaned.replace(/[^0-9]/g, '').length < 5) {
      Alert.alert('Call Customer', `Valid contact number for ${name} is not available.`);
      return;
    }
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert('Call Customer', `Calling ${name} at ${phoneNumber}`);
    });
  };

  // WhatsApp
  const handleWhatsApp = (phoneNumber, customerName, title) => {
    const name = customerName || 'Sir';
    const jobTitle = title || 'Work';
    if (!phoneNumber || !String(phoneNumber).trim()) {
      Alert.alert('WhatsApp', `Customer contact number is not available for WhatsApp.`);
      return;
    }
    const cleaned = String(phoneNumber).replace(/[^0-9]/g, '');
    if (!cleaned || cleaned.length < 5) {
      Alert.alert('WhatsApp', `Valid WhatsApp number is not available.`);
      return;
    }
    const text = encodeURIComponent(
      `Namaste ${name}! I am your verified Mistri from Mistri Pro regarding your booking "${jobTitle}".`
    );
    Linking.openURL(`whatsapp://send?phone=${cleaned}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Opening WhatsApp chat with ${name} (${phoneNumber}).`);
    });
  };

  // Google Maps navigation
  const handleOpenMap = (locationAddress) => {
    const location = locationAddress || 'Sawai Madhopur, Rajasthan';
    const query = encodeURIComponent(location);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
        Alert.alert('Navigation', 'Unable to open maps application.');
      });
    });
  };

  // Open OTP verification modal
  const handleOpenOtpModal = (booking, type) => {
    setTargetBooking(booking);
    setOtpType(type);
    setInputOtp('');
    setOtpError('');
    setOtpModalVisible(true);
  };

  // Submit OTP Verification
  const handleSubmitOtp = async () => {
    if (!targetBooking || !inputOtp.trim()) {
      setOtpError(lang === 'hi' ? 'कृपया 4-अंकीय OTP दर्ज करें' : 'Please enter 4-digit OTP');
      return;
    }
    setIsVerifying(true);
    setOtpError('');

    try {
      if (otpType === 'ARRIVAL') {
        const res = await LiveBackend.verifyArrivalOtp(targetBooking, inputOtp);
        if (!res.success) {
          setOtpError(res.error || (lang === 'hi' ? 'अमान्य OTP! ग्राहक से आगमन OTP पूछें।' : 'Invalid OTP! Ask customer for Arrival OTP.'));
          setIsVerifying(false);
          return;
        }
        updateBookingStep(targetBooking.id, 2);
        DeviceFeedback?.triggerSuccessHaptics?.();
        setOtpModalVisible(false);
        Alert.alert(
          lang === 'hi' ? 'आगमन सत्यापित! 📍' : 'Arrival Verified! 📍',
          lang === 'hi'
            ? 'आप सफलतापूर्वक साइट पर पहुंच चुके हैं। ग्राहक को सूचित कर दिया गया है। अब साइट देखकर काम का मूल्य तय करें।'
            : 'You have arrived at the work site. The customer has been notified. You can now inspect the work and agree on the final quote directly.'
        );
      } else if (otpType === 'COMPLETION') {
        const res = await LiveBackend.verifyCompletionOtp(targetBooking, inputOtp);
        if (!res.success) {
          setOtpError(res.error || (lang === 'hi' ? 'अमान्य OTP! ग्राहक से कार्य समापन OTP पूछें।' : 'Invalid OTP! Ask customer for Completion OTP.'));
          setIsVerifying(false);
          return;
        }
        updateBookingStep(targetBooking.id, 4);
        if (onCompleteBooking) {
          onCompleteBooking(targetBooking);
        }
        DeviceFeedback?.triggerSuccessHaptics?.();
        setOtpModalVisible(false);
        Alert.alert(
          lang === 'hi' ? 'काम पूरा हुआ! 🎉' : 'Job Completed! 🎉',
          lang === 'hi'
            ? 'कार्य समापन सफलतापूर्वक दर्ज किया गया है। यह काम आपके माइलस्टोन रिवॉर्ड में जोड़ दिया गया है!'
            : 'Job completion verified! This booking has been added to your Milestone Reward progress.',
          [
            { text: lang === 'hi' ? 'कमाई देखें' : 'View Earnings', onPress: () => onNavigateTab && onNavigateTab('EARNINGS') },
            { text: 'OK' },
          ]
        );
      } else if (otpType === 'CANCELLATION') {
        const res = await LiveBackend.verifyCancellationOtp(targetBooking, inputOtp);
        if (!res.success) {
          setOtpError(res.error || (lang === 'hi' ? 'अमान्य Cancellation OTP! ग्राहक से रद्दीकरण कोड पूछें।' : 'Invalid Cancellation OTP! Ask customer for cancellation code.'));
          setIsVerifying(false);
          return;
        }
        setLocalBookings((prev) =>
          prev.map((b) => (b.id === targetBooking.id ? { ...b, status: 'cancelled_on_site', step: 0 } : b))
        );
        DeviceFeedback?.triggerAlertHaptics?.();
        setOtpModalVisible(false);
        Alert.alert(
          lang === 'hi' ? 'साइट विजिट रद्द' : 'Site Visit Cancelled',
          lang === 'hi'
            ? 'ग्राहक के साथ आपसी OTP सत्यापन के बाद साइट विजिट रद्द कर दी गई है।'
            : 'Site visit cancelled after mutual OTP verification with customer.'
        );
      }
    } catch (e) {
      setOtpError(e.message || (lang === 'hi' ? 'OTP सत्यापन में त्रुटि' : 'OTP verification error'));
    } finally {
      setIsVerifying(false);
    }
  };

  // Advance step progress via OTP or in-progress toggle
  const handleAdvanceStep = (booking) => {
    if (!booking) return;
    const currentStep = Number(booking.step || booking.progress_step || 1);

    if (currentStep === 1) {
      // Step 1: Must enter customer's Arrival OTP
      handleOpenOtpModal(booking, 'ARRIVAL');
    } else if (currentStep === 2) {
      // Step 2: Site visited -> Start Work
      updateBookingStep(booking.id, 3);
      DeviceFeedback?.triggerSuccessHaptics?.();
      Alert.alert('काम चालू 🔨', 'काम शुरू हो चुका है। काम समाप्त होने पर ग्राहक से Completion OTP प्राप्त करें।');
    } else if (currentStep === 3) {
      // Step 3: Must enter customer's Work Completion OTP
      handleOpenOtpModal(booking, 'COMPLETION');
    }
  };

  const updateBookingStep = (bookingId, nextStep) => {
    setLocalBookings((prev) =>
      prev.map((b) => {
        if (b && b.id === bookingId) {
          const isDone = nextStep === 4;
          return {
            ...b,
            step: nextStep,
            progress_step: nextStep,
            status: isDone ? 'completed' : (nextStep === 3 ? 'in_progress' : b.status || 'confirmed'),
            payoutStatus: isDone ? 'PAID_TO_WALLET' : (b.payoutStatus || 'SECURED'),
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
            activeBookings.map((booking, index) => {
              if (!booking) return null;
              const currentStep = Number(booking.step || booking.progress_step || 1);
              const stepIndex = Math.min(Math.max(currentStep, 1), 4) - 1;
              const currentStepObj = STEPS[stepIndex] || STEPS[0];
              const progressPct = ((currentStep - 1) / 3) * 100;

              const customerName = booking.customerName || booking.customer_name || 'Customer';
              const customerAvatar = booking.customerAvatar || (typeof customerName === 'string' && customerName.trim().length >= 2 ? customerName.trim().slice(0, 2).toUpperCase() : 'CU');
              const customerColor = booking.customerColor || '#0284C7';
              const category = booking.category || booking.skill || 'General Mistri';
              const title = booking.title || `${category} Service`;
              const location = booking.location || booking.site_location || 'Sawai Madhopur, Rajasthan';
              const rawAmt = booking.bookingFee || booking.booking_fee || 99;
              const amount = `₹${rawAmt}`;
              const customerPhone = booking.customerPhone || booking.customer_phone || '';
              const bookingKey = booking.id || `active-${index}`;

              return (
                <View key={bookingKey} style={styles.bookingCard}>
                  {/* Card Header: Customer Info */}
                  <View style={styles.cardHeader}>
                    <View style={styles.customerRow}>
                      <View style={[styles.avatar, { backgroundColor: customerColor }]}>
                        <Text style={styles.avatarText}>{customerAvatar}</Text>
                      </View>
                      <View style={styles.customerMeta}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {customerName}
                        </Text>
                        <View style={styles.categorySubRow}>
                          <Text style={styles.categoryText}>{category}</Text>
                          <View style={styles.subDot} />
                          <View style={styles.verifiedBadge}>
                            <ShieldCheck size={10} color="#15803D" />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.payoutBadge}>
                      <Text style={[styles.payoutAmount, { fontSize: 13, color: '#15803D' }]}>
                        {lang === 'hi' ? 'सीधा भुगतान' : 'Direct Payment'}
                      </Text>
                      <Text style={styles.payoutSub}>
                        {lang === 'hi' ? 'ऑन-साइट तय करें' : 'Quote On-Site'}
                      </Text>
                    </View>
                  </View>

                  {/* Job Title & Timing */}
                  <Text style={styles.jobTitle}>{title}</Text>

                  {/* Customer Location & Contact Details */}
                  <View style={styles.locationContactCard}>
                    {/* Location with Google Map direct navigation */}
                    <TouchableOpacity
                      style={styles.locRow}
                      onPress={() => handleOpenMap(location)}
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
                        <Text style={styles.locAddress}>{location}</Text>
                        <Text style={styles.locDistance}>Distance: {booking.distance || '2.4 km'} from your location</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.locDivider} />

                    {/* Contact Number & Quick Action Buttons */}
                    <View style={styles.contactRow}>
                      <View style={styles.phoneCol}>
                        <Text style={styles.contactLabel}>Customer Contact Number:</Text>
                        <Text style={styles.phoneText}>{customerPhone || 'Not available'}</Text>
                      </View>

                      <View style={styles.contactActions}>
                        {/* 1-Tap Phone Call */}
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => handleCall(customerPhone, customerName)}
                          activeOpacity={0.8}
                        >
                          <Phone size={14} color="#FFFFFF" />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>

                        {/* 1-Tap WhatsApp */}
                        <TouchableOpacity
                          style={styles.whatsappBtn}
                          onPress={() => handleWhatsApp(customerPhone, customerName, title)}
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
                        Step {currentStep} of 4 • {currentStepObj.hindi}
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

                    {/* Action button to advance step via OTP */}
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
                          <Text style={styles.advanceBtnText}>Enter Arrival OTP (साइट आगमन OTP)</Text>
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
                          <Text style={styles.advanceBtnText}>Enter Completion OTP (काम पूरा हुआ)</Text>
                        </>
                      )}
                      {currentStep === 4 && (
                        <>
                          <CheckCircle2 size={16} color="#15803D" />
                          <Text style={[styles.advanceBtnText, { color: '#15803D' }]}>Completed & Paid ✓</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* On-Site Mutual Cancellation Button (Available after arrival) */}
                    {(currentStep === 2 || currentStep === 3) && (
                      <TouchableOpacity
                        style={styles.workerCancelBtn}
                        onPress={() => handleOpenOtpModal(booking, 'CANCELLATION')}
                        activeOpacity={0.8}
                      >
                        <ShieldAlert size={14} color="#DC2626" />
                        <Text style={styles.workerCancelBtnText}>Cancel Visit (Enter Customer Cancel OTP)</Text>
                      </TouchableOpacity>
                    )}
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
            historyBookings.map((item, index) => {
              if (!item) return null;
              const itemKey = item.id || `history-${index}`;
              const customerName = item.customerName || item.customer_name || 'Customer';
              const customerAvatar = item.customerAvatar || (typeof customerName === 'string' && customerName.trim().length >= 2 ? customerName.trim().slice(0, 2).toUpperCase() : 'CU');
              const customerColor = item.customerColor || '#10B981';
              const location = item.location || item.site_location || 'Sawai Madhopur, Rajasthan';
              const title = item.title || 'Completed Service';
              const rawAmt = item.amount;
              const amount = rawAmt ? (String(rawAmt).startsWith('₹') ? rawAmt : `₹${rawAmt}`) : (lang === 'hi' ? 'ऑन-साइट तय' : 'Direct Quote');
              const customerPhone = item.customerPhone || item.customer_phone || '';

              return (
                <View key={itemKey} style={styles.historyCard}>
                  <View style={styles.historyTopRow}>
                    <View style={styles.customerRow}>
                      <View style={[styles.avatar, { backgroundColor: customerColor }]}>
                        <Text style={styles.avatarText}>{customerAvatar}</Text>
                      </View>
                      <View style={styles.customerMeta}>
                        <Text style={styles.customerName}>{customerName}</Text>
                        <Text style={styles.locText} numberOfLines={1}>{location}</Text>
                      </View>
                    </View>

                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={11} color="#15803D" />
                      <Text style={styles.completedBadgeText}>COMPLETED</Text>
                    </View>
                  </View>

                  <Text style={styles.historyJobTitle}>{title}</Text>

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
                    <TouchableOpacity
                      style={styles.phoneSnippet}
                      onPress={() => customerPhone && handleCall(customerPhone, customerName)}
                      activeOpacity={customerPhone ? 0.7 : 1}
                    >
                      <Phone size={11} color="#64748B" />
                      <Text style={styles.phoneSnippetText}>{customerPhone || 'Contact Customer'}</Text>
                    </TouchableOpacity>

                    <View style={styles.paidPill}>
                      <Text style={styles.paidLabel}>Earnings Credited:</Text>
                      <Text style={styles.paidAmount}>{amount}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )
        )}
      </ScrollView>

      {/* ─── WORKER OTP VERIFICATION MODAL ─── */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.otpModalBackdrop}>
          <View style={styles.otpModalCard}>
            <View style={styles.otpModalHeader}>
              <View style={styles.otpIconBadge}>
                <KeyRound size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.otpModalTitle}>
                  {otpType === 'ARRIVAL'
                    ? '📍 ग्राहक का Arrival OTP दर्ज करें'
                    : otpType === 'COMPLETION'
                    ? '✅ कार्य समापन OTP दर्ज करें'
                    : '❌ साइट रद्दीकरण OTP दर्ज करें'}
                </Text>
                <Text style={styles.otpModalSub}>
                  {otpType === 'ARRIVAL'
                    ? 'ग्राहक के MistriPro ऐप में दिख रहा 4-अंकीय Arrival OTP लेकर दर्ज करें।'
                    : otpType === 'COMPLETION'
                    ? 'काम पूरा होने पर ग्राहक से 4-अंकीय Work Completion OTP प्राप्त करें।'
                    : 'ग्राहक से साइट रद्दीकरण कोड (Cancellation OTP) प्राप्त करें।'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)} style={styles.otpCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.otpInputWrap}>
              <TextInput
                style={styles.otpInput}
                value={inputOtp}
                onChangeText={(val) => {
                  setInputOtp(val.replace(/[^0-9]/g, '').slice(0, 4));
                  if (otpError) setOtpError('');
                }}
                placeholder="• • • •"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={4}
                autoFocus
              />
            </View>

            {!!otpError && (
              <View style={styles.otpErrorWrap}>
                <ShieldAlert size={14} color="#DC2626" />
                <Text style={styles.otpErrorText}>{otpError}</Text>
              </View>
            )}

            <View style={styles.otpModalActions}>
              <TouchableOpacity
                style={styles.otpCancelBtn}
                onPress={() => setOtpModalVisible(false)}
                disabled={isVerifying}
              >
                <Text style={styles.otpCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.otpSubmitBtn, inputOtp.length < 4 && styles.otpSubmitBtnDisabled]}
                onPress={handleSubmitOtp}
                disabled={inputOtp.length < 4 || isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.otpSubmitBtnText}>Verify OTP ✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  workerCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  workerCancelBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#DC2626',
  },

  /* OTP Verification Modal Styles */
  otpModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  otpModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  otpModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  otpIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpModalTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  otpModalSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  otpCloseBtn: {
    padding: 4,
  },
  otpInputWrap: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  otpInput: {
    fontFamily: 'Satoshi-Black',
    fontSize: 32,
    letterSpacing: 12,
    textAlign: 'center',
    color: '#0F172A',
    width: '100%',
  },
  otpErrorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  otpErrorText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  otpModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  otpCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  otpCancelBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#64748B',
  },
  otpSubmitBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otpSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  otpSubmitBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
