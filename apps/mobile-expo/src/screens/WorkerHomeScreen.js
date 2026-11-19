import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  X,
  Radio,
  Zap,
  Clock,
} from 'lucide-react-native';
import { WORKER_TUTORIALS } from '../data/workerData';
import { supabase } from '../services/supabase';
import { LiveBackend } from '../services/liveBackend';
import { DeviceFeedback } from '../services/deviceFeedback';
import { StorageService } from '../services/storage';
import * as Location from 'expo-location';
import { translateWorkerSkill, translateLocationName } from '../data/categories';
import { tw } from '../data/workerTranslations';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resolveWorkerTarget = (profile) => {
  if (!profile) return null;
  if (profile.user_id && UUID_REGEX.test(String(profile.user_id).trim())) {
    return String(profile.user_id).trim();
  }
  if (profile.id && UUID_REGEX.test(String(profile.id).trim())) {
    return String(profile.id).trim();
  }
  const rawPhone = profile.phone || profile.mobile;
  if (rawPhone && String(rawPhone).replace(/[^0-9]/g, '').length >= 10) {
    return String(rawPhone).trim();
  }
  if (profile.id && profile.id !== 'w-me') {
    return profile.id;
  }
  return null;
};

export default function WorkerHomeScreen({
  insets,
  lang = 'en',
  t,
  workerProfile,
  onUpdateProfile,
  alertsCount = 0,
  activeBookingsCount = 0,
  walletBalance = 0,
  onNavigateTab,
  onOpenNotifications,
  notificationsCount,
  trainingVideos = [],
}) {
  const [isAvailable, setIsAvailable] = useState(() => {
    if (workerProfile?.isAvailable !== undefined) return Boolean(workerProfile.isAvailable);
    if (workerProfile?.is_available !== undefined) return Boolean(workerProfile.is_available);
    return true;
  });
  const [isSyncingAvailability, setIsSyncingAvailability] = useState(false);

  // Keep state in sync if parent prop workerProfile changes
  useEffect(() => {
    const nextAvail = workerProfile?.isAvailable ?? workerProfile?.is_available;
    if (nextAvail !== undefined) {
      setIsAvailable(Boolean(nextAvail));
    }
  }, [workerProfile?.isAvailable, workerProfile?.is_available]);

  // Sync real-time database availability on mount/profile load
  useEffect(() => {
    let isMounted = true;
    const fetchLiveAvailability = async () => {
      try {
        const target = resolveWorkerTarget(workerProfile);
        const liveAvail = await LiveBackend.getWorkerAvailability(target);
        if (liveAvail !== null && isMounted) {
          setIsAvailable(liveAvail);
          if (onUpdateProfile) {
            onUpdateProfile({ isAvailable: liveAvail, is_available: liveAvail });
          }
        }
      } catch (err) {
        console.log('WorkerHomeScreen live availability fetch error:', err);
      }
    };
    fetchLiveAvailability();
    return () => {
      isMounted = false;
    };
  }, [workerProfile?.id, workerProfile?.user_id, workerProfile?.phone]);

  // Auto-detect & broadcast live worker GPS location to Supabase on mount and periodically
  useEffect(() => {
    let isMounted = true;
    const syncLiveGps = async () => {
      try {
        let target = resolveWorkerTarget(workerProfile);
        if (!target) {
          try {
            const sess = await StorageService.getSession();
            target = sess?.id || sess?.mobile || sess?.phone;
          } catch (_) {}
        }
        if (!target) return;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc?.coords?.latitude && loc?.coords?.longitude && isMounted) {
            await LiveBackend.updateWorkerLiveLocation(target, loc.coords.latitude, loc.coords.longitude);
          }
        }
      } catch (e) {
        console.log('Worker auto GPS broadcast notice:', e?.message);
      }
    };

    syncLiveGps();
    const interval = setInterval(syncLiveGps, 20000); // refresh every 20s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [workerProfile?.id, workerProfile?.user_id, workerProfile?.phone]);

  // Toggle Availability
  const handleToggleAvailability = async (val) => {
    if (isSyncingAvailability) return;
    setIsSyncingAvailability(true);
    const previousVal = isAvailable;
    setIsAvailable(val);
    if (onUpdateProfile) {
      onUpdateProfile({ isAvailable: val, is_available: val });
    }

    try {
      let target = resolveWorkerTarget(workerProfile);
      if (!target) {
        try {
          const sess = await StorageService.getSession();
          if (sess?.id && UUID_REGEX.test(sess.id)) {
            target = sess.id;
          } else if (sess?.mobile || sess?.phone) {
            target = sess.mobile || sess.phone;
          }
        } catch (e) {}
      }

      const res = await LiveBackend.updateWorkerAvailability(target, val);
      DeviceFeedback.triggerAlertHaptics?.();

      if (res && res.success === false && res.error) {
        console.warn('Worker availability sync notice:', res.error);
      }

      if (val) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (loc?.coords?.latitude && loc?.coords?.longitude) {
              LiveBackend.updateWorkerLiveLocation(target, loc.coords.latitude, loc.coords.longitude);
            }
          }
        } catch (locE) {}

        Alert.alert(
          'Online & Available! 🟢',
          'Your profile is now marked ONLINE on customer live maps and directory. Nearby clients can book you now.'
        );
      } else {
        Alert.alert(
          'Offline / Busy 🔴',
          'Your profile will show as "Not Available Right Now" to customers until you turn this back on.'
        );
      }
    } catch (err) {
      console.log('Worker availability toggle error:', err);
      setIsAvailable(previousVal);
      if (onUpdateProfile) {
        onUpdateProfile({ isAvailable: previousVal, is_available: previousVal });
      }
      Alert.alert('Status Update Failed', 'Unable to update availability status. Please try again.');
    } finally {
      setIsSyncingAvailability(false);
    }
  };

  // Open YouTube tutorial
  const handleOpenVideo = (video) => {
    if (video?.url) {
      Linking.openURL(video.url).catch(() => {
        Alert.alert('Video Tutorial', `Opening "${video.title || 'Tutorial'}" on YouTube.`);
      });
    }
  };

  const avatarText =
    workerProfile?.avatar ||
    (workerProfile?.name
      ? workerProfile.name
          .trim()
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'RS');

  const unreadAlertCount =
    notificationsCount !== undefined ? notificationsCount : alertsCount;

  return (
    <View style={[styles.container, { paddingTop: insets?.top || 10 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets?.bottom ? insets.bottom + 90 : 100 }]}
      >
        {/* 1. Header Profile Banner */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={[styles.avatarBox, { backgroundColor: workerProfile?.color || '#4F46E5' }]}
              onPress={() => onNavigateTab && onNavigateTab('PROFILE')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.avatarText}>{avatarText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerTextCol}
              onPress={() => onNavigateTab && onNavigateTab('PROFILE')}
              activeOpacity={0.7}
            >
              <View style={styles.nameRow}>
                <Text style={styles.workerName} numberOfLines={1}>
                  {workerProfile?.name || 'Ram Singh Mistri'}
                </Text>
                <View style={styles.kycBadge}>
                  <ShieldCheck size={11} color="#15803D" />
                  <Text style={styles.kycText}>
                    {lang === 'hi' ? 'सत्यापित' : lang === 'gu' ? 'વેરિફાઇડ' : lang === 'mr' ? 'सत्यापित' : 'Verified'}
                  </Text>
                </View>
              </View>
              <View style={styles.locRow}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.locText}>
                  {translateLocationName(workerProfile?.location || 'Sawai Madhopur, Rajasthan', lang)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => {
              if (onOpenNotifications) {
                onOpenNotifications();
              } else if (onNavigateTab) {
                onNavigateTab('ALERTS');
              }
            }}
            activeOpacity={0.8}
          >
            <Bell size={20} color="#0F172A" />
            {unreadAlertCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadAlertCount}</Text>
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
                  {isAvailable ? tw('onlineTitle', lang) : tw('offlineTitle', lang)}
                </Text>
              </View>
              <Text style={styles.availSubText}>
                {isAvailable ? tw('onlineDesc', lang) : tw('offlineDesc', lang)}
              </Text>
            </View>

            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              disabled={isSyncingAvailability}
              trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
              thumbColor={isAvailable ? '#16A34A' : '#F1F5F9'}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>

          <View style={[styles.availBadgeRow, isAvailable ? styles.availBadgeOn : styles.availBadgeOff]}>
            <Radio size={12} color={isAvailable ? '#15803D' : '#64748B'} />
            <Text style={[styles.availBadgeText, isAvailable ? styles.badgeTextOn : styles.badgeTextOff]}>
              {isAvailable ? tw('gpsBroadcasting', lang) : tw('profilePaused', lang)}
            </Text>
          </View>
        </View>

        {/* 3. Trade & Verified Skill Card (Direct On-Site Quote Model - Zero Daily Rate) */}
        <View style={styles.skillTradeCard}>
          <View style={styles.skillCardHeader}>
            <View style={styles.skillIconCircle}>
              <Briefcase size={20} color="#4F46E5" />
            </View>
            <View style={styles.skillTextCol}>
              <Text style={styles.skillCardLabel}>
                {tw('registeredTrades', lang)}
              </Text>
              <Text style={styles.skillCardTitle}>
                {Array.isArray(workerProfile?.skills) && workerProfile.skills.length > 0
                  ? translateWorkerSkill(workerProfile.skills[0], lang)
                  : translateWorkerSkill(workerProfile?.skill || 'Mason', lang)}
              </Text>
            </View>
            <View style={styles.verifiedSkillBadge}>
              <ShieldCheck size={13} color="#15803D" />
              <Text style={styles.verifiedSkillText}>
                {tw('verified', lang)}
              </Text>
            </View>
          </View>

          {/* Multiple Selected Trade Skills Chips */}
          {Array.isArray(workerProfile?.skills) && workerProfile.skills.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {workerProfile.skills.map((sk) => (
                <View
                  key={sk}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: '#EEF2FF',
                    borderWidth: 1,
                    borderColor: '#C7D2FE',
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: 'Satoshi-Bold', color: '#4338CA' }}>
                    {translateWorkerSkill(sk, lang)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Edit / Manage Skills Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#F1F5F9',
            }}
            onPress={() => onNavigateTab && onNavigateTab('PROFILE')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 11.5, fontFamily: 'Satoshi-Bold', color: '#4F46E5' }}>
              {tw('manageSkillsBtn', lang)}
            </Text>
            <Text style={{ fontSize: 11, fontFamily: 'Satoshi-Medium', color: '#64748B' }}>
              {Array.isArray(workerProfile?.skills) ? `${workerProfile.skills.length} ${tw('active', lang)}` : `1 ${tw('active', lang)}`}
            </Text>
          </TouchableOpacity>

          <View style={styles.tradeDivider} />

          <View style={styles.pricingModelRow}>
            <View style={styles.pricingModelBadge}>
              <Text style={styles.pricingModelBadgeText}>
                {tw('directQuoteModel', lang)}
              </Text>
            </View>
            <Text style={styles.pricingModelExplanation}>
              {tw('directQuoteDesc', lang)}
            </Text>
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
            <Text style={styles.statTitle}>
              {tw('newAlerts', lang)}
            </Text>
            <Text style={styles.statSub}>
              {tw('tapToView', lang)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigateTab && onNavigateTab('BOOKINGS')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Briefcase size={16} color="#4F46E5" />
            </View>
            <Text style={styles.statCount}>{activeBookingsCount} {tw('active', lang)}</Text>
            <Text style={styles.statTitle}>
              {tw('ongoingJobs', lang)}
            </Text>
            <Text style={styles.statSub}>
              {tw('trackProgress', lang)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigateTab && onNavigateTab('EARNINGS')}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <Wallet size={16} color="#15803D" />
            </View>
            <Text style={styles.statCount}>₹{Number(walletBalance || 0).toLocaleString('en-IN')}</Text>
            <Text style={styles.statTitle}>
              {tw('walletBalance', lang)}
            </Text>
            <Text style={styles.statSub}>
              {tw('withdrawNow', lang)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Mistri Academy - High-Quality Training Videos */}
        {(() => {
          const activeVideos = Array.isArray(trainingVideos) && trainingVideos.length > 0
            ? trainingVideos
            : WORKER_TUTORIALS;

          return (
            <View style={styles.tutorialsSection}>
              <View style={styles.sectionTitleRow}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {tw('academyTitle', lang)}
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {tw('academyDesc', lang)}
                  </Text>
                </View>
                <View style={styles.ytPill}>
                  <Play size={11} color="#DC2626" fill="#DC2626" />
                  <Text style={styles.ytPillText}>YouTube</Text>
                </View>
              </View>

              {/* Featured Hero Lesson */}
              {activeVideos.length > 0 && (
                <TouchableOpacity
                  style={styles.featuredVideoCard}
                  onPress={() => handleOpenVideo(activeVideos[0])}
                  activeOpacity={0.9}
                >
                  <View style={styles.featuredThumbnailWrap}>
                    <Image
                      source={{ uri: activeVideos[0].thumbnail || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80' }}
                      style={styles.featuredThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.featuredGradientOverlay} />
                    <View style={styles.featuredPlayCircle}>
                      <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
                    </View>
                    <View style={styles.featuredDurationPill}>
                      <Clock size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.featuredDurationText}>{activeVideos[0].duration || '4:20 min'}</Text>
                    </View>
                    <View style={styles.featuredTagPill}>
                      <Text style={styles.featuredTagText}>⭐ {activeVideos[0].tag || 'Featured Lesson'}</Text>
                    </View>
                  </View>

                  <View style={styles.featuredContent}>
                    <View style={styles.featuredMetaRow}>
                      <Text style={styles.featuredViewsText}>{activeVideos[0].views || '15K+ views'}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.featuredChannelText}>{activeVideos[0].channel || 'MistriPro Academy'}</Text>
                    </View>
                    <Text style={styles.featuredTitle}>
                      {lang === 'en' ? activeVideos[0].title : (activeVideos[0].hindiTitle || activeVideos[0].title)}
                    </Text>
                    <View style={styles.watchNowActionRow}>
                      <Text style={styles.watchNowActionText}>
                        {tw('watchLesson', lang)}
                      </Text>
                      <ExternalLink size={14} color="#DC2626" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Additional Video Lessons */}
              {activeVideos.length > 1 && (
                <View style={styles.videoList}>
                  {activeVideos.slice(1).map((video) => (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.videoCard}
                      onPress={() => handleOpenVideo(video)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.videoThumbnailContainer}>
                        <Image
                          source={{ uri: video.thumbnail || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80' }}
                          style={styles.videoThumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.playOverlay}>
                          <View style={styles.playCircleSmall}>
                            <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                          </View>
                        </View>
                        <View style={styles.durationPill}>
                          <Text style={styles.durationText}>{video.duration || 'Video'}</Text>
                        </View>
                      </View>

                      <View style={styles.videoContent}>
                        <View style={styles.videoTagRow}>
                          <View style={styles.videoTag}>
                            <Text style={styles.videoTagText}>{video.tag || 'Academy'}</Text>
                          </View>
                          <Text style={styles.videoViews}>{video.views || 'Verified'}</Text>
                        </View>
                        <Text style={styles.videoMainTitle} numberOfLines={2}>
                          {lang === 'en' ? video.title : (video.hindiTitle || video.title)}
                        </Text>
                        <View style={styles.watchRow}>
                          <Text style={styles.watchNowText}>
                            {tw('watchOnYoutube', lang)}
                          </Text>
                          <ExternalLink size={11} color="#DC2626" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })()}
      </ScrollView>
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
  skillTradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillCardTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginTop: 2,
  },
  verifiedSkillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedSkillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#15803D',
  },
  tradeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  pricingModelRow: {
    gap: 6,
  },
  pricingModelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  pricingModelBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#166534',
  },
  pricingModelExplanation: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
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
    fontSize: 14,
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

  /* Tutorials Section (Mistri Academy) */
  tutorialsSection: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  ytPillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#DC2626',
  },

  /* Featured Lesson Card */
  featuredVideoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featuredThumbnailWrap: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  featuredThumbnail: {
    width: '100%',
    height: '100%',
  },
  featuredGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  featuredPlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  featuredDurationPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredDurationText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  featuredTagPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredTagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: '#FBBF24',
  },
  featuredContent: {
    padding: 16,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  featuredViewsText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#DC2626',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  featuredChannelText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  featuredTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 10,
  },
  watchNowActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  watchNowActionText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#DC2626',
  },

  /* Secondary Video List */
  videoList: {
    gap: 10,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    height: 96,
  },
  videoThumbnailContainer: {
    width: 120,
    height: '100%',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playCircleSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    position: 'absolute',
    bottom: 5,
    right: 5,
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
    fontSize: 12,
    color: '#0F172A',
    lineHeight: 16,
  },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  watchNowText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#DC2626',
  },
});
