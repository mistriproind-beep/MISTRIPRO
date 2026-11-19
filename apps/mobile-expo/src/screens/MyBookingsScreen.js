import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Star,
  FileText,
  ChevronRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  ArrowRight,
  Check,
  Download,
  AlertCircle,
  UserCheck,
} from 'lucide-react-native';
import { InvoiceService } from '../services/invoiceService';
import { DeviceFeedback } from '../services/deviceFeedback';

const TRACK_STEPS = [
  { step: 1, title: 'Approved', hindi: 'स्वीकृत' },
  { step: 2, title: 'Arrived at Site', hindi: 'साइट पर पहुंचे' },
  { step: 3, title: 'Work in Progress', hindi: 'काम चालू' },
  { step: 4, title: 'Work Completed', hindi: 'काम पूरा हुआ' },
];

export default function MyBookingsScreen({
  insets,
  onNavigateTab,
  bookings = [],
  onAutoAssignAnother,
  onRefundBooking,
  onCancelPreVisit,
  onSubmitReview,
  onOpenNotifications,
  notificationsCount,
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'cancelled'
  
  // Track Work Modal
  const [trackingBooking, setTrackingBooking] = useState(null);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // Filter bookings based on active tab
  const filteredBookings = safeBookings.filter((b) => {
    if (!b) return false;
    const s = (b.status || '').toLowerCase();
    if (activeTab === 'active') {
      return s === 'active' || s === 'waiting_confirmation' || s === 'confirmed' || s === 'in_progress';
    }
    if (activeTab === 'completed') {
      return s === 'completed';
    }
    if (activeTab === 'cancelled') {
      return s === 'cancelled' || s === 'rejected' || s === 'refunded';
    }
    return true;
  });

  const getStatusCounts = () => {
    const active = safeBookings.filter((b) => {
      if (!b) return false;
      const s = (b.status || '').toLowerCase();
      return s === 'active' || s === 'waiting_confirmation' || s === 'confirmed' || s === 'in_progress';
    }).length;
    const completed = safeBookings.filter((b) => (b?.status || '').toLowerCase() === 'completed').length;
    const cancelled = safeBookings.filter((b) => {
      if (!b) return false;
      const s = (b.status || '').toLowerCase();
      return s === 'cancelled' || s === 'rejected' || s === 'refunded';
    }).length;
    return { active, completed, cancelled };
  };

  const counts = getStatusCounts();

  // Call Company Helpline (Worker personal phone is masked for privacy & platform safety)
  const handleCall = (booking) => {
    const companyPhone = '+91 98290 12345';
    Alert.alert(
      'MistriPro Support Helpline 📞',
      `Connecting to MistriPro Official Helpline (${companyPhone}) for booking assistance.\n\nWorker personal numbers are kept private for security and quality assurance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Helpline',
          onPress: () => {
            Linking.openURL('tel:+919829012345').catch(() => {
              Alert.alert('MistriPro Helpline', `Calling MistriPro Helpline at ${companyPhone}`);
            });
          },
        },
      ]
    );
  };

  // Submit Rating & Review
  const handleSendReview = () => {
    if (!reviewBooking) return;
    if (onSubmitReview) {
      onSubmitReview(reviewBooking.id, reviewRating, reviewText);
    }
    DeviceFeedback?.triggerSuccessHaptics?.();
    Alert.alert('Thank You! ⭐', 'Your verified rating and review have been saved.');
    setReviewBooking(null);
    setReviewText('');
    setReviewRating(5);
  };

  // Download PDF Invoice
  const handleDownloadInvoice = (booking) => {
    if (!booking) {
      Alert.alert('Download Invoice', 'Booking details are missing.');
      return;
    }
    try {
      InvoiceService.downloadInvoicePdf(booking);
    } catch (err) {
      console.log('Invoice download error:', err);
      Alert.alert('Invoice', 'Unable to generate invoice. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>
            Track all active jobs, site visits & secured payments
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newBookingBtn}
          onPress={() => onNavigateTab && onNavigateTab('FIND_WORKERS')}
          activeOpacity={0.85}
        >
          <Plus size={15} color="#FFFFFF" />
          <Text style={styles.newBookingBtnText}>Book Mistri</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'active', label: `Active (${counts.active})` },
          { key: 'completed', label: `Completed (${counts.completed})` },
          { key: 'cancelled', label: `Cancelled (${counts.cancelled})` },
        ].map((tabItem) => {
          const isActive = activeTab === tabItem.key;
          return (
            <TouchableOpacity
              key={tabItem.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tabItem.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tabItem.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
                ? 'You have no ongoing or upcoming bookings. Book a verified mistri today!'
                : `You don't have any ${activeTab} bookings.`}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => onNavigateTab && onNavigateTab('FIND_WORKERS')}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>Find Available Workers</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking, index) => {
            if (!booking) return null;
            const rawStatus = (booking.status || 'active').toLowerCase();
            const isWaiting = rawStatus === 'waiting_confirmation';
            const isConfirmed = rawStatus === 'confirmed' || rawStatus === 'active';
            const isRejected = rawStatus === 'rejected';
            const isCompleted = rawStatus === 'completed';
            const isRefunded = rawStatus === 'refunded';

            const workerName = booking.worker_name || booking.workerName || 'Assigned Mistri';
            const workerAvatar = booking.workerAvatar || (typeof workerName === 'string' && workerName.trim().length >= 2 ? workerName.trim().slice(0, 2).toUpperCase() : 'MP');
            const workerColor = booking.workerColor || '#4F46E5';
            const category = booking.worker_skill || booking.category || 'General Labour';
            const title = booking.title || `${category} Service`;
            const location = booking.site_location || booking.location || 'Sawai Madhopur, Rajasthan';
            const date = booking.scheduled_date || booking.date || 'Today, Immediate';
            const rawAmt = booking.total_amount || booking.amount || '₹1,098';
            const amount = String(rawAmt).startsWith('₹') ? rawAmt : `₹${rawAmt}`;
            const currentStep = Number(booking.progress_step || booking.step || 1);
            const bookingKey = booking.id || booking.booking_code || `booking-${index}`;

            return (
              <View key={bookingKey} style={styles.bookingCard}>
                {/* Card Top */}
                <View style={styles.cardHeader}>
                  <View style={styles.workerRow}>
                    <View style={[styles.workerAvatar, { backgroundColor: workerColor }]}>
                      <Text style={styles.avatarText}>{workerAvatar}</Text>
                    </View>
                    <View style={styles.workerMeta}>
                      <Text style={styles.workerName} numberOfLines={1}>
                        {workerName}
                      </Text>
                      <View style={styles.categorySubRow}>
                        <Text style={styles.categoryPillText}>{category}</Text>
                        <View style={styles.subDot} />
                        <View style={styles.kycBadge}>
                          <ShieldCheck size={10} color="#15803D" />
                          <Text style={styles.kycText}>Verified</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Status Indicator Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      isWaiting && styles.statusPillWaiting,
                      isConfirmed && styles.statusPillActive,
                      isCompleted && styles.statusPillCompleted,
                      (isRejected || rawStatus === 'cancelled') && styles.statusPillCancelled,
                      isRefunded && styles.statusPillRefunded,
                    ]}
                  >
                    {isWaiting && <Clock size={11} color="#D97706" />}
                    {isConfirmed && <View style={styles.activeDot} />}
                    {isCompleted && <CheckCircle2 size={12} color="#15803D" />}
                    {(isRejected || rawStatus === 'cancelled') && <XCircle size={12} color="#DC2626" />}
                    {isRefunded && <RotateCcw size={12} color="#7C3AED" />}
                    <Text
                      style={[
                        styles.statusPillLabel,
                        isWaiting && { color: '#B45309' },
                        isConfirmed && styles.statusLabelActive,
                        isCompleted && styles.statusLabelCompleted,
                        (isRejected || rawStatus === 'cancelled') && styles.statusLabelCancelled,
                        isRefunded && { color: '#6D28D9' },
                      ]}
                    >
                      {isWaiting
                        ? 'WAITING CONFIRMATION'
                        : isConfirmed
                        ? 'CONFIRMED'
                        : isRejected
                        ? 'MISTRI BUSY'
                        : isRefunded
                        ? 'REFUNDED'
                        : rawStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Booking Title */}
                <Text style={styles.bookingTitle}>{title}</Text>

                {/* Waiting confirmation notice */}
                {isWaiting && (
                  <View style={styles.waitingBanner}>
                    <Clock size={14} color="#D97706" />
                    <Text style={styles.waitingBannerText}>
                      {workerName.includes('Searching')
                        ? 'Broadcasting to nearby verified workers... Waiting for worker assignment.'
                        : `Waiting for ${workerName} to confirm request. Payment is secured safely.`}
                    </Text>
                  </View>
                )}

                {/* Rejected Banner with 2 Options */}
                {isRejected && (
                  <View style={styles.rejectedBanner}>
                    <AlertCircle size={15} color="#DC2626" />
                    <View style={styles.rejectedTextCol}>
                      <Text style={styles.rejectedTitle}>Mistri is Currently Busy</Text>
                      <Text style={styles.rejectedSub}>
                        {workerName} cannot take this job right now. Choose how you would like to proceed:
                      </Text>

                      <View style={styles.rejectedActionsRow}>
                        <TouchableOpacity
                          style={styles.autoAssignBtn}
                          onPress={() => onAutoAssignAnother && onAutoAssignAnother(booking)}
                          activeOpacity={0.85}
                        >
                          <UserCheck size={14} color="#FFFFFF" />
                          <Text style={styles.autoAssignBtnText}>Auto-Assign Nearby Mistri</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.refundBtn}
                          onPress={() => onRefundBooking && onRefundBooking(booking)}
                          activeOpacity={0.85}
                        >
                          <RotateCcw size={14} color="#B91C1C" />
                          <Text style={styles.refundBtnText}>Instant 100% Refund</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {/* Info Rows */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.infoText}>
                      {date} • {booking.duration || '1 Day'}
                    </Text>
                    <View style={styles.durationBadge}>
                      <ShieldCheck size={11} color="#4F46E5" />
                      <Text style={styles.durationBadgeText}>Payment Secured</Text>
                    </View>
                  </View>
                </View>

                {/* OTP Verification Cards for Customer */}
                {!isCompleted && !isRejected && rawStatus !== 'cancelled' && (
                  <View style={styles.otpSectionWrap}>
                    {/* Arrival OTP: Show when worker is on the way (step < 2) */}
                    {currentStep < 2 ? (
                      <View style={styles.otpBoxArrival}>
                        <View style={styles.otpTopRow}>
                          <View style={styles.otpBadgeTitleWrap}>
                            <MapPin size={14} color="#4F46E5" />
                            <Text style={styles.otpBoxTitle}>मिस्त्री आगमन OTP (Arrival Code)</Text>
                          </View>
                          <View style={styles.otpValueBadge}>
                            <Text style={styles.otpValueText}>
                              {booking.arrival_otp || booking.arrivalOtp || '4821'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.otpExplainerText}>
                          📍 जब मिस्त्री आपकी साइट पर पहुंचे, तो उन्हें यह 4-अंकीय कोड दें ताकि वे उपस्थिति दर्ज कर सकें।
                        </Text>

                        {/* Pre-Arrival Cancellation (Instant ₹99 Wallet Refund) */}
                        <TouchableOpacity
                          style={styles.cancelPreArrivalBtn}
                          onPress={() => {
                            Alert.alert(
                              'बुकिंग रद्द करें? (Cancel Booking)',
                              'कारीगर के साइट पर पहुंचने से पहले रद्द करने पर आपका ₹99 बुकिंग शुल्क आपके MistriPro वर्चुअल वॉलेट में तुरंत रिफंड कर दिया जाएगा।\n\nइस वॉलेट बैलेंस का उपयोग आप अगली किसी भी बुकिंग के लिए कर सकते हैं। (निकासी उपलब्ध नहीं)',
                              [
                                { text: 'वापस जाएं (Back)', style: 'cancel' },
                                {
                                  text: 'हाँ, रद्द करें और ₹99 रिफंड पाएं',
                                  style: 'destructive',
                                  onPress: () => {
                                    if (onCancelPreVisit) {
                                      onCancelPreVisit(booking);
                                    }
                                  },
                                },
                              ]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <XCircle size={13} color="#DC2626" />
                          <Text style={styles.cancelPreArrivalText}>
                            रद्द करें और ₹99 वॉलेट रिफंड पाएं (Instant ₹99 Wallet Refund)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Completion OTP: Show once worker is at site (step >= 2) */
                      <View style={styles.otpBoxCompletion}>
                        <View style={styles.otpTopRow}>
                          <View style={styles.otpBadgeTitleWrap}>
                            <CheckCircle2 size={14} color="#15803D" />
                            <Text style={[styles.otpBoxTitle, { color: '#15803D' }]}>कार्य समापन OTP (Completion Code)</Text>
                          </View>
                          <View style={[styles.otpValueBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                            <Text style={[styles.otpValueText, { color: '#15803D' }]}>
                              {booking.completion_otp || booking.completionOtp || '7934'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.otpExplainerText}>
                          🔒 यह कोड मिस्त्री को केवल तभी दें जब काम पूरी तरह समाप्त और संतोषजनक हो जाए।
                        </Text>
                      </View>
                    )}

                    {/* On-Site Visit Cancellation Option */}
                    {currentStep >= 2 && (
                      <TouchableOpacity
                        style={styles.cancelVisitRow}
                        onPress={() => {
                          Alert.alert(
                            'विजिट रद्द करना चाहते हैं? (Cancel Visit)',
                            `यदि साइट देखने के बाद काम नहीं कराना है, तो मिस्त्री को यह Cancellation OTP दें:\n\n🔑 ${booking.cancellation_otp || booking.cancellationOtp || '1592'}\n\nमिस्त्री अपने ऐप में यह कोड डालकर साइट विजिट रद्द कर देंगे।`,
                            [{ text: 'समझ गया (OK)' }]
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <AlertCircle size={13} color="#DC2626" />
                        <Text style={styles.cancelVisitLink}>
                          साइट विजिट रद्द करने का OTP (Cancel OTP: {booking.cancellation_otp || booking.cancellationOtp || '1592'})
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Price & Actions Row */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.amountLabel}>Paid Booking Fee</Text>
                    <Text style={styles.amountValue}>₹99 <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600' }}>(Quote On-Site)</Text></Text>
                  </View>

                  <View style={styles.actionsGroup}>
                    {/* Confirmed / Active Actions */}
                    {isConfirmed && (
                      <>
                        <TouchableOpacity
                          style={styles.callSmallBtn}
                          onPress={() => handleCall(booking)}
                          activeOpacity={0.8}
                        >
                          <Phone size={14} color="#4F46E5" />
                          <Text style={styles.callSmallText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.primaryActionBtn}
                          onPress={() => setTrackingBooking(booking)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.primaryActionBtnText}>Track Work</Text>
                          <ChevronRight size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Waiting actions */}
                    {isWaiting && (
                      <TouchableOpacity
                        style={styles.primaryActionBtn}
                        onPress={() => setTrackingBooking(booking)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.primaryActionBtnText}>View Status</Text>
                        <ChevronRight size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}

                    {/* Completed actions: Rate + Invoice */}
                    {isCompleted && (
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.invoiceBtn}
                          onPress={() => handleDownloadInvoice(booking)}
                          activeOpacity={0.85}
                        >
                          <Download size={13} color="#4F46E5" />
                          <Text style={styles.invoiceBtnText}>Invoice</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.primaryActionBtn, { backgroundColor: '#059669' }]}
                          onPress={() => setReviewBooking(booking)}
                          activeOpacity={0.85}
                        >
                          <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
                          <Text style={styles.primaryActionBtnText}>Rate Mistri</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Cancelled / Rejected action: Rebook */}
                    {(isRejected || rawStatus === 'cancelled') && (
                      <TouchableOpacity
                        style={styles.rebookBtn}
                        onPress={() => onNavigateTab && onNavigateTab('FIND_WORKERS')}
                        activeOpacity={0.85}
                      >
                        <RotateCcw size={13} color="#EA580C" />
                        <Text style={styles.rebookBtnText}>Rebook</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ─── LIVE WORK PROGRESS TRACKER MODAL ─── */}
      <Modal
        visible={!!trackingBooking}
        transparent
        animationType="fade"
        onRequestClose={() => setTrackingBooking(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setTrackingBooking(null)}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e?.stopPropagation?.()}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>Live Job Progress Tracker</Text>
                <Text style={styles.modalSub} numberOfLines={1}>
                  {(trackingBooking?.worker_name || trackingBooking?.workerName || 'Mistri')} • {(trackingBooking?.category || trackingBooking?.worker_skill || 'Service')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setTrackingBooking(null)}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Stepper Display */}
            <View style={styles.trackerBox}>
              {TRACK_STEPS.map((s, idx) => {
                const current = Number(trackingBooking?.progress_step || trackingBooking?.step || 1);
                const isPassed = current >= s.step;
                const isCurrent = current === s.step;

                return (
                  <View key={s.step} style={styles.trackerStepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepCircle,
                          isPassed && styles.stepCirclePassed,
                          isCurrent && styles.stepCircleCurrent,
                        ]}
                      >
                        {isPassed ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Text style={styles.stepNum}>{s.step}</Text>
                        )}
                      </View>
                      {idx < TRACK_STEPS.length - 1 && (
                        <View style={[styles.stepLine, isPassed && styles.stepLinePassed]} />
                      )}
                    </View>

                    <View style={styles.stepTextCol}>
                      <Text style={[styles.stepTitleText, isPassed && styles.stepTitlePassed]}>
                        {s.title} ({s.hindi})
                      </Text>
                      <Text style={styles.stepDescText}>
                        {s.step === 1 && 'Mistri has accepted your booking and is assigned to the site.'}
                        {s.step === 2 && 'Mistri has arrived at your location and is inspecting the work.'}
                        {s.step === 3 && 'Active construction & repair in progress onsite.'}
                        {s.step === 4 && 'Work successfully completed. Payment released.'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Contact Call Button */}
            <TouchableOpacity
              style={styles.modalCallBtn}
              onPress={() => {
                const b = trackingBooking;
                setTrackingBooking(null);
                if (b) {
                  handleCall(b);
                }
              }}
              activeOpacity={0.85}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.modalCallBtnText}>Call {trackingBooking?.worker_name || trackingBooking?.workerName || 'Mistri'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── RATE & REVIEW MODAL ─── */}
      <Modal
        visible={!!reviewBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewBooking(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setReviewBooking(null)}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={(e) => e?.stopPropagation?.()}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>Rate Your Mistri Experience</Text>
                <Text style={styles.modalSub} numberOfLines={1}>{(reviewBooking?.worker_name || reviewBooking?.workerName || 'Worker')} • {(reviewBooking?.category || reviewBooking?.worker_skill || 'Service')}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setReviewBooking(null)}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Star Selector */}
            <View style={styles.starsSelectorRow}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setReviewRating(num)}>
                  <Star
                    size={32}
                    color={num <= reviewRating ? '#EAB308' : '#CBD5E1'}
                    fill={num <= reviewRating ? '#EAB308' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>{reviewRating} out of 5 Stars</Text>

            {/* Comment */}
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your feedback regarding punctuality, skill quality, and cleanliness..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSendReview} activeOpacity={0.85}>
              <Text style={styles.submitReviewBtnText}>Submit Verified Review</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeftCol: {
    flex: 1,
    marginRight: 10,
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexShrink: 0,
  },
  newBookingBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#0F172A',
  },
  tabButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#64748B',
  },
  tabButtonTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  rebookBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#EA580C',
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
  statusPillWaiting: {
    backgroundColor: '#FEF3C7',
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
  statusPillRefunded: {
    backgroundColor: '#EDE9FE',
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
    letterSpacing: 0.4,
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
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 10,
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  waitingBannerText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#92400E',
    flex: 1,
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rejectedTextCol: {
    flex: 1,
  },
  rejectedTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#B91C1C',
  },
  rejectedSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11.5,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 16,
  },
  rejectedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  autoAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  autoAssignBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  refundBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11.5,
    color: '#B91C1C',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
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
  otpSectionWrap: {
    marginBottom: 12,
    gap: 8,
  },
  otpBoxArrival: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    padding: 12,
  },
  otpBoxCompletion: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
  },
  otpTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  otpBadgeTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpBoxTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#3730A3',
  },
  otpValueBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#818CF8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  otpValueText: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#4F46E5',
    letterSpacing: 3,
  },
  otpExplainerText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  cancelPreArrivalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignSelf: 'stretch',
  },
  cancelPreArrivalText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11.5,
    color: '#DC2626',
  },
  cancelVisitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignSelf: 'flex-start',
  },
  cancelVisitLink: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#DC2626',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  amountValue: {
    fontFamily: 'Satoshi-Black',
    fontSize: 17,
    color: '#0F172A',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callSmallText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11.5,
    color: '#4F46E5',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  invoiceBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11.5,
    color: '#4F46E5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    marginTop: 4,
    lineHeight: 18,
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  modalDoneBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12.5,
    color: '#4F46E5',
  },
  trackerBox: {
    marginVertical: 10,
  },
  trackerStepRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCirclePassed: {
    backgroundColor: '#16A34A',
  },
  stepCircleCurrent: {
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  stepNum: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#64748B',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stepLinePassed: {
    backgroundColor: '#16A34A',
  },
  stepTextCol: {
    flex: 1,
    paddingBottom: 14,
  },
  stepTitleText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#64748B',
  },
  stepTitlePassed: {
    color: '#0F172A',
  },
  stepDescText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  modalCallBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  starsSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 14,
  },
  ratingLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 14,
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: '#059669',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
