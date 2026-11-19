import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  LocateFixed,
  Briefcase,
  ShieldCheck,
  Camera,
  Check,
  X,
  FileText,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { DeviceFeedback } from '../services/deviceFeedback';

export default function EditProfileModal({
  visible,
  onClose,
  userName = '',
  userContact = '',
  userAddress = '',
  userEmail = '',
  role = 'CUSTOMER',
  workerExperienceYears = '5',
  onSaveProfile,
  lang = 'en',
  insets = { top: 0, bottom: 0 },
}) {
  const [name, setName] = useState(userName || '');
  const [contact, setContact] = useState(userContact || '');
  const [address, setAddress] = useState(userAddress || '');
  const [email, setEmail] = useState(userEmail || '');
  const [expYears, setExpYears] = useState(String(workerExperienceYears || '5'));
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    setName(userName || '');
    setContact(userContact || '');
    setAddress(userAddress || '');
    setEmail(userEmail || '');
    setExpYears(String(workerExperienceYears || '5'));
  }, [userName, userContact, userAddress, userEmail, workerExperienceYears, visible]);

  // Live GPS Fetch inside Edit Profile
  const fetchCurrentLocation = async () => {
    setIsFetchingLocation(true);
    DeviceFeedback.triggerLightTap();
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Needed',
          'Please allow location permission in Settings to auto-fetch your address.'
        );
        setIsFetchingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (loc && loc.coords) {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo) {
          const parts = [
            geo.streetNumber,
            geo.street,
            geo.district || geo.subregion,
            geo.city,
            geo.postalCode,
            geo.region || 'Rajasthan',
          ].filter(Boolean);
          const fullAddr = parts.join(', ');
          setAddress(fullAddr);
          DeviceFeedback.triggerSuccessHaptics();
        }
      }
    } catch (e) {
      console.log('Location fetch err:', e);
      Alert.alert('Location Notice', 'Could not fetch GPS automatically. Please type your address manually.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        lang === 'hi' ? 'नाम आवश्यक है' : 'Name Required',
        lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.'
      );
      return;
    }

    setIsSaving(true);
    DeviceFeedback.triggerSuccessHaptics();
    try {
      if (onSaveProfile) {
        await onSaveProfile({
          name: name.trim(),
          contact: contact.trim(),
          address: address.trim(),
          email: email.trim(),
          experienceYears: Number(expYears) || 5,
        });
      }
      setIsSaving(false);
      Alert.alert(
        lang === 'hi' ? 'प्रोफ़ाइल अपडेट हुई! ✓' : 'Profile Updated! ✓',
        lang === 'hi' ? 'आपके प्रोफ़ाइल विवरण क्लाउड और डिवाइस पर सुरक्षित हो गए हैं।' : 'Your profile details have been saved and synced with cloud.'
      );
      onClose();
    } catch (e) {
      setIsSaving(false);
      Alert.alert('Error', e?.message || 'Could not save profile details');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Top Bar Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.topBarCenter}>
              <Text style={styles.topBarTitle}>
                {lang === 'hi' ? 'प्रोफ़ाइल विवरण बदलें' : 'Edit Profile Details'}
              </Text>
              <Text style={styles.topBarSubtitle}>
                {role === 'WORKER'
                  ? (lang === 'hi' ? 'कारीगर प्रोफ़ाइल • क्लाउड सिंक' : 'Worker Profile • Cloud Synced')
                  : (lang === 'hi' ? 'ग्राहक प्रोफ़ाइल • क्लाउड सिंक' : 'Customer Profile • Cloud Synced')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Box 1: Personal Identity Card */}
            <View style={styles.formBoxCard}>
              <View style={styles.boxHeaderRow}>
                <View style={styles.boxIconWrap}>
                  <User size={16} color="#4F46E5" />
                </View>
                <Text style={styles.boxHeaderTitle}>
                  {lang === 'hi' ? 'व्यक्तिगत पहचान एवं नाम' : 'Personal Identity & Contact'}
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.inputFieldWrap}>
                <Text style={styles.inputFieldLabel}>
                  {lang === 'hi' ? 'पूरा नाम (पहचान पत्र के अनुसार) *' : 'Full Legal Name *'}
                </Text>
                <View style={styles.inputBoxRow}>
                  <User size={17} color="#94A3B8" style={styles.inputLeftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder={lang === 'hi' ? 'उदा. राम सिंह मिस्त्री' : 'e.g. Ram Singh Mistri'}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View style={styles.inputFieldWrap}>
                <Text style={styles.inputFieldLabel}>
                  {lang === 'hi' ? 'मोबाइल नंबर (प्राथमिक संपर्क) *' : 'Mobile Number (Primary Contact) *'}
                </Text>
                <View style={styles.inputBoxRow}>
                  <Phone size={17} color="#94A3B8" style={styles.inputLeftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={contact}
                    onChangeText={setContact}
                    placeholder="e.g. 98290 12345"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Secondary Email / Alt Contact */}
              <View style={styles.inputFieldWrap}>
                <Text style={styles.inputFieldLabel}>
                  {lang === 'hi' ? 'वैकल्पिक नंबर / ईमेल (वैकल्पिक)' : 'Alternate Contact / Email (Optional)'}
                </Text>
                <View style={styles.inputBoxRow}>
                  <Mail size={17} color="#94A3B8" style={styles.inputLeftIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="e.g. user@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Box 2: Work & Residence Address Card */}
            <View style={styles.formBoxCard}>
              <View style={styles.boxHeaderRow}>
                <View style={[styles.boxIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <MapPin size={16} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boxHeaderTitle}>
                    {lang === 'hi' ? 'साइट एवं निवास स्थान का पता' : 'Work Site & Living Address'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  style={styles.fetchGpsBtn}
                  activeOpacity={0.7}
                >
                  {isFetchingLocation ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : (
                    <LocateFixed size={13} color="#4F46E5" />
                  )}
                  <Text style={styles.fetchGpsBtnText}>
                    {lang === 'hi' ? 'लाइव GPS' : 'Fetch GPS'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputFieldWrap}>
                <Text style={styles.inputFieldLabel}>
                  {lang === 'hi' ? 'पूरा पता (गली, मोहल्ला, कस्बा, जिला, पिन कोड) *' : 'Complete Address & Landmark *'}
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={lang === 'hi' ? 'उदा. मकान नं. 45, रेलवे कॉलोनी, गंगापुर सिटी, 322201' : 'e.g. House #45, Main Road, Sawai Madhopur, 322001'}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Box 3: Worker Experience Selection (Only for Workers) */}
            {role === 'WORKER' && (
              <View style={styles.formBoxCard}>
                <View style={styles.boxHeaderRow}>
                  <View style={[styles.boxIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Briefcase size={16} color="#D97706" />
                  </View>
                  <Text style={styles.boxHeaderTitle}>
                    {lang === 'hi' ? 'कार्य में कुल अनुभव (वर्ष)' : 'Trade Work Experience (Years)'}
                  </Text>
                </View>

                <View style={styles.expPillsWrap}>
                  {[
                    { label: '1–2 Years', val: '2', hindi: '1–2 वर्ष' },
                    { label: '3–5 Years', val: '5', hindi: '3–5 वर्ष' },
                    { label: '6–8 Years', val: '8', hindi: '6–8 वर्ष' },
                    { label: '9–12 Years', val: '10', hindi: '9–12 वर्ष' },
                    { label: '12+ Years', val: '15', hindi: '12+ वर्ष (वरिष्ठ)' },
                  ].map((exp) => {
                    const isSel = String(expYears) === String(exp.val);
                    return (
                      <TouchableOpacity
                        key={exp.val}
                        onPress={() => {
                          DeviceFeedback.triggerLightTap();
                          setExpYears(exp.val);
                        }}
                        style={[styles.expPill, isSel && styles.expPillActive]}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.expPillText, isSel && styles.expPillTextActive]}>
                          {lang === 'hi' ? exp.hindi : exp.label}
                        </Text>
                        {isSel && <Check size={12} color="#166534" strokeWidth={3} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Save Bar */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <ShieldCheck size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {lang === 'hi' ? 'बदलाव सुरक्षित करें ✓' : 'Save Changes & Sync ✓'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  topBarCenter: {
    flex: 1,
    marginLeft: 12,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  topBarSubtitle: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  formBoxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 14,
  },
  boxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  boxIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxHeaderTitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  fetchGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  fetchGpsBtnText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Bold',
    color: '#4F46E5',
  },
  inputFieldWrap: {
    gap: 6,
  },
  inputFieldLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#334155',
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputLeftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#0F172A',
  },
  textAreaInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    minHeight: 76,
  },
  expPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  expPillActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  expPillText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#334155',
  },
  expPillTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#166534',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
});
