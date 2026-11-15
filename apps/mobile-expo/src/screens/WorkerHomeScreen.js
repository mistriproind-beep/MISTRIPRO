import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Image,
  Alert,
  Linking,
} from 'react-native';
import {
  ShieldCheck,
  MapPin,
  Edit3,
  Play,
  CheckCircle2,
  Bell,
  Briefcase,
  Wallet,
  Star,
  Sparkles,
  ExternalLink,
  X,
  Radio,
  Zap,
} from 'lucide-react-native';
import { WORKER_TUTORIALS } from '../data/workerData';
import { supabase } from '../services/supabase';

export default function WorkerHomeScreen({
  insets,
  workerProfile,
  onUpdateProfile,
  alertsCount = 3,
  walletBalance = 4850,
  onNavigateTab,
}) {
  const [isAvailable, setIsAvailable] = useState(
    workerProfile?.isAvailable !== undefined ? workerProfile.isAvailable : true
  );
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editPrice, setEditPrice] = useState(String(workerProfile?.price || 950));
  const [editRateType, setEditRateType] = useState(workerProfile?.priceType || 'day');
  const [activeVideo, setActiveVideo] = useState(null);

  // Toggle Availability
  const handleToggleAvailability = async (val) => {
    setIsAvailable(val);
    if (onUpdateProfile) {
      onUpdateProfile({ isAvailable: val });
    }
    try {
      await supabase
        .from('worker_profiles')
        .update({ is_available: val, updated_at: new Date().toISOString() })
        .eq('phone', workerProfile?.phone || '+91 94140 88990');
    } catch (e) {
      console.log('Worker availability sync error:', e);
    }
    if (val) {
      Alert.alert(
        'Online & Available! 🟢',
        'Your profile is now VISIBLE to all customers within a 15 km radius. You will receive live hire alerts.'
      );
    } else {
      Alert.alert(
        'Offline / Busy 🔴',
        'Your profile is now HIDDEN from customer searches. You will not receive new hire requests until you turn this back on.'
      );
    }
  };

  // Save new price
  const handleSavePrice = () => {
    const num = parseInt(editPrice, 10);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid rate in Rupees (₹).');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile({ price: num, priceType: editRateType });
    }
    setShowPriceModal(false);
    Alert.alert('Price Updated ✓', `Your daily rate is now ₹${num}/${editRateType}. Saved successfully!`);
  };

  // Open YouTube tutorial
  const handleOpenVideo = (video) => {
    if (video.url) {
      Linking.openURL(video.url).catch(() => {
        Alert.alert('Video Tutorial', `Opening "${video.title}" on YouTube.`);
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 10 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets?.bottom ? insets.bottom + 90 : 100 }]}
      >
        {/* 1. Header Profile Banner */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarBox, { backgroundColor: workerProfile?.color || '#4F46E5' }]}>
              <Text style={styles.avatarText}>{workerProfile?.avatar || 'RS'}</Text>
            </View>
            <View style={styles.headerTextCol}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName} numberOfLines={1}>
                  {workerProfile?.name || 'Ram Singh Mistri'}
                </Text>
                <View style={styles.kycBadge}>
                  <ShieldCheck size={11} color="#15803D" />
                  <Text style={styles.kycText}>Verified</Text>
                </View>
              </View>
              <View style={styles.locRow}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.locText}>{workerProfile?.location || 'Sawai Madhopur, Rajasthan'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => onNavigateTab && onNavigateTab('ALERTS')}
            activeOpacity={0.8}
          >
            <Bell size={20} color="#0F172A" />
            {alertsCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{alertsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Availability Master Switch (Live Online / Offline Toggle) */}
        <View style={[styles.availabilityCard, isAvailable ? styles.availCardOn : styles.availCardOff]}>
          <View style={styles.availTopRow}>
            <View style={styles.availLeftCol}>
              <View style={styles.availStatusRow}>
                <View style={[styles.statusDot, isAvailable ? styles.statusDotOn : styles.statusDotOff]} />
                <Text style={[styles.availStatusTitle, isAvailable ? styles.availTitleOn : styles.availTitleOff]}>
                  {isAvailable ? 'You are ONLINE for Work' : 'You are OFFLINE / Busy'}
                </Text>
              </View>
              <Text style={styles.availSubText}>
                {isAvailable
                  ? 'Active in 15 km radius. Customers near you can find & hire you now.'
                  : 'Hidden from customer search. Turn ON when ready to take jobs.'}
              </Text>
            </View>

            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
              thumbColor={isAvailable ? '#16A34A' : '#F1F5F9'}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>

          <View style={[styles.availBadgeRow, isAvailable ? styles.availBadgeOn : styles.availBadgeOff]}>
            <Radio size={12} color={isAvailable ? '#15803D' : '#64748B'} />
            <Text style={[styles.availBadgeText, isAvailable ? styles.badgeTextOn : styles.badgeTextOff]}>
              {isAvailable ? 'Broadcasting live GPS location to nearby clients' : 'Profile paused • Not receiving calls'}
            </Text>
          </View>
        </View>

        {/* 3. Skill & Set Price Card (With Editable Button) */}
        <View style={styles.skillPriceCard}>
          <View style={styles.skillCardHeader}>
            <View style={styles.skillIconCircle}>
              <Briefcase size={18} color="#4F46E5" />
            </View>
            <View style={styles.skillTextCol}>
              <Text style={styles.skillCardLabel}>Selected Primary Trade</Text>
              <Text style={styles.skillCardTitle}>{workerProfile?.skill || 'Master Mason (राजमिस्त्री)'}</Text>
            </View>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Your Working Rate</Text>
              <View style={styles.priceValueRow}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.priceAmount}>{workerProfile?.price || 950}</Text>
                <Text style={styles.priceUnit}>/{workerProfile?.priceType || 'day'}</Text>
              </View>
              <Text style={styles.priceHint}>Shown to customers when booking</Text>
            </View>

            {/* Editable Button */}
            <TouchableOpacity
              style={styles.editPriceBtn}
              onPress={() => {
                setEditPrice(String(workerProfile?.price || 950));
                setEditRateType(workerProfile?.priceType || 'day');
                setShowPriceModal(true);
              }}
              activeOpacity={0.8}
            >
              <Edit3 size={15} color="#4F46E5" />
              <Text style={styles.editPriceBtnText}>Edit Price</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Quick Action Stats Bar */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigateTab && onNavigateTab('ALERTS')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={16} color="#D97706" />
            </View>
            <Text style={styles.statCount}>{alertsCount}</Text>
            <Text style={styles.statTitle}>New Alerts</Text>
            <Text style={styles.statSub}>Tap to view →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigateTab && onNavigateTab('BOOKINGS')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Briefcase size={16} color="#4F46E5" />
            </View>
            <Text style={styles.statCount}>2 Active</Text>
            <Text style={styles.statTitle}>Ongoing Jobs</Text>
            <Text style={styles.statSub}>Track progress →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigateTab && onNavigateTab('EARNINGS')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Wallet size={16} color="#15803D" />
            </View>
            <Text style={styles.statCount}>₹{walletBalance.toLocaleString()}</Text>
            <Text style={styles.statTitle}>Wallet Cash</Text>
            <Text style={styles.statSub}>Withdraw now →</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Mistri Academy - YouTube Tutorial Video Section */}
        <View style={styles.tutorialsSection}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.sectionTitle}>Mistri Academy • Training Videos</Text>
              <Text style={styles.sectionSubtitle}>यूट्यूब वीडियो से काम सीखें और ज्यादा कमाई करें</Text>
            </View>
            <View style={styles.ytPill}>
              <Play size={10} color="#DC2626" fill="#DC2626" />
              <Text style={styles.ytPillText}>YouTube</Text>
            </View>
          </View>

          {WORKER_TUTORIALS.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              onPress={() => handleOpenVideo(video)}
              activeOpacity={0.85}
            >
              <View style={styles.videoThumbnailContainer}>
                <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
                <View style={styles.playOverlay}>
                  <View style={styles.playCircle}>
                    <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
                  </View>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>

              <View style={styles.videoContent}>
                <View style={styles.videoTagRow}>
                  <View style={styles.videoTag}>
                    <Text style={styles.videoTagText}>{video.tag}</Text>
                  </View>
                  <Text style={styles.videoViews}>{video.views}</Text>
                </View>
                <Text style={styles.videoMainTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.videoHindiTitle} numberOfLines={1}>
                  {video.hindiTitle}
                </Text>

                <View style={styles.watchRow}>
                  <Text style={styles.watchNowText}>Watch on YouTube</Text>
                  <ExternalLink size={12} color="#DC2626" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Edit Price Modal ── */}
      <Modal visible={showPriceModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Set Your Daily / Hourly Rate</Text>
                <Text style={styles.modalSub}>अपनी मजदूरी या दर तय करें</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowPriceModal(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Rate Type Selector */}
            <View style={styles.rateTypeRow}>
              <TouchableOpacity
                style={[styles.rateTypeBtn, editRateType === 'day' && styles.rateTypeBtnActive]}
                onPress={() => setEditRateType('day')}
              >
                <Text style={[styles.rateTypeText, editRateType === 'day' && styles.rateTypeTextActive]}>
                  Per Day (प्रति दिन)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rateTypeBtn, editRateType === 'hour' && styles.rateTypeBtnActive]}
                onPress={() => setEditRateType('hour')}
              >
                <Text style={[styles.rateTypeText, editRateType === 'hour' && styles.rateTypeTextActive]}>
                  Per Hour (प्रति घंटा)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputCurrency}>₹</Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="950"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.inputSuffix}>/{editRateType}</Text>
            </View>

            {/* Recommended Rates */}
            <Text style={styles.presetsLabel}>Common Rates in Rajasthan:</Text>
            <View style={styles.presetsRow}>
              {[700, 850, 950, 1100, 1400].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.presetChip}
                  onPress={() => setEditPrice(String(val))}
                >
                  <Text style={styles.presetChipText}>₹{val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.savePriceBtn} onPress={handleSavePrice} activeOpacity={0.85}>
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.savePriceBtnText}>Save & Update Price</Text>
            </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  workerName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
    flexShrink: 1,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    flexShrink: 0,
  },
  kycText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9.5,
    color: '#15803D',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexShrink: 0,
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },

  /* Availability Card */
  availabilityCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  availCardOn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  availCardOff: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  availTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  availLeftCol: {
    flex: 1,
  },
  availStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOn: {
    backgroundColor: '#16A34A',
  },
  statusDotOff: {
    backgroundColor: '#94A3B8',
  },
  availStatusTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
  },
  availTitleOn: {
    color: '#15803D',
  },
  availTitleOff: {
    color: '#64748B',
  },
  availSubText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  availBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  availBadgeOn: {
    borderTopColor: '#DCFCE7',
  },
  availBadgeOff: {
    borderTopColor: '#E2E8F0',
  },
  availBadgeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
  },
  badgeTextOn: {
    color: '#166534',
  },
  badgeTextOff: {
    color: '#94A3B8',
  },

  /* Skill & Price Card */
  skillPriceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  skillCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillTextCol: {
    flex: 1,
  },
  skillCardLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  skillCardTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    marginTop: 1,
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceSymbol: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#4F46E5',
    marginRight: 2,
  },
  priceAmount: {
    fontFamily: 'Satoshi-Black',
    fontSize: 26,
    color: '#0F172A',
  },
  priceUnit: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#64748B',
    marginLeft: 2,
  },
  priceHint: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  editPriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  editPriceBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#4F46E5',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  statTitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statSub: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#4F46E5',
    marginTop: 6,
  },

  /* Tutorials Section */
  tutorialsSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  ytPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ytPillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#DC2626',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
  },
  videoThumbnailContainer: {
    width: 120,
    height: 100,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.88,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  durationPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  videoContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  videoTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoTagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 9,
    color: '#475569',
  },
  videoViews: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  videoMainTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
    marginTop: 4,
    lineHeight: 16,
  },
  videoHindiTitle: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  watchNowText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#DC2626',
  },

  /* Modal */
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
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
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
  modalCloseBtn: {
    padding: 4,
  },
  rateTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rateTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  rateTypeBtnActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  rateTypeText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  rateTypeTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#4F46E5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F8FAFF',
    marginBottom: 14,
  },
  inputCurrency: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    color: '#4F46E5',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontFamily: 'Satoshi-Black',
    fontSize: 24,
    color: '#0F172A',
    padding: 0,
  },
  inputSuffix: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#64748B',
  },
  presetsLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#334155',
  },
  savePriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
  },
  savePriceBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
