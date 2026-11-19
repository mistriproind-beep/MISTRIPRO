import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { generateGoogleMapPickerHtml } from '../services/googleMapsService';
import {
  MapPin,
  CheckCircle2,
  X,
  Navigation,
  Building,
  User,
  Phone,
  Compass,
} from 'lucide-react-native';

export default function SiteAddressPickerModal({
  visible,
  onClose,
  initialLocation = { text: 'Sawai Madhopur, Rajasthan', lat: 25.9928, lng: 76.3712 },
  customerName = '',
  customerPhone = '',
  lang = 'en',
  onConfirmSiteAddress,
}) {
  const [selectedCoords, setSelectedCoords] = useState({
    lat: initialLocation.lat || 25.9928,
    lng: initialLocation.lng || 76.3712,
  });
  const [houseStreet, setHouseStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areaCity, setAreaCity] = useState(initialLocation.text || 'Sawai Madhopur, Rajasthan');
  const [contactPerson, setContactPerson] = useState(customerName || '');
  const [contactPhone, setContactPhone] = useState(customerPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      if (initialLocation.lat && initialLocation.lng) {
        setSelectedCoords({ lat: initialLocation.lat, lng: initialLocation.lng });
      }
      if (initialLocation.text) {
        setAreaCity(initialLocation.text);
      }
    }
    if (customerName) setContactPerson(customerName);
    if (customerPhone) setContactPhone(customerPhone);
  }, [initialLocation, customerName, customerPhone]);

  // Official Google Maps HTML Map with interactive pinpointing
  const mapHtml = generateGoogleMapPickerHtml({
    lat: selectedCoords.lat,
    lng: selectedCoords.lng,
    label: lang === 'hi' ? 'साइट की सटीक स्थिति चुनने के लिए मैप खिसकाएं' : 'Drag map to pinpoint work site',
  });

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MOVE') {
        setSelectedCoords({ lat: data.lat, lng: data.lng });
      } else if (data.type === 'GEOCODE_ADDRESS' && data.formatted_address) {
        if (!houseStreet) {
          setAreaCity(data.formatted_address);
        }
      }
    } catch (e) {}
  };

  const handleConfirm = () => {
    if (!houseStreet.trim()) {
      Alert.alert(
        lang === 'hi' ? 'पता दर्ज करें' : 'Address Required',
        lang === 'hi'
          ? 'कृपया मकान / दुकान / गली का पूरा पता दर्ज करें।'
          : 'Please enter the house / plot / street address for the mistri to reach.'
      );
      return;
    }

    setIsSubmitting(true);
    const fullSiteAddress = `${houseStreet.trim()}${landmark.trim() ? `, Near ${landmark.trim()}` : ''}, ${areaCity.trim()}`;
    
    onConfirmSiteAddress({
      siteAddress: fullSiteAddress,
      siteLocation: areaCity.trim(),
      siteCoordinates: selectedCoords,
      siteContactPerson: contactPerson.trim() || customerName,
      siteContactPhone: contactPhone.trim() || customerPhone,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {lang === 'hi' ? 'कार्य स्थल का सटीक पता' : 'Select Work Site Location'}
            </Text>
            <Text style={styles.headerSub}>
              {lang === 'hi' ? 'कारीगर के सही समय पर पहुंचने के लिए' : 'For accurate arrival of your mistri'}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Interactive Leaflet Pinpoint Map */}
          <View style={styles.mapCard}>
            <View style={styles.mapWrap}>
              <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={styles.mapWebview}
                onMessage={handleMessage}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
              />
            </View>
            <View style={styles.mapFooterRow}>
              <Navigation size={13} color="#4F46E5" />
              <Text style={styles.mapCoordsText}>
                {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)} • {lang === 'hi' ? 'सटीक पिन' : 'Exact GPS Pin'}
              </Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>
              {lang === 'hi' ? 'पूरा पता और संपर्क' : 'Complete Address & Contact'}
            </Text>

            {/* House / Street / Building */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'hi' ? 'मकान नं. / बिल्डिंग / गली *' : 'House / Flat / Street / Plot *'}
              </Text>
              <View style={styles.inputRow}>
                <Building size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={lang === 'hi' ? 'उदा. मकान 42, ब्लॉक B, मुख्य रोड' : 'e.g. House #42, Block B, Main Road'}
                  placeholderTextColor="#94A3B8"
                  value={houseStreet}
                  onChangeText={setHouseStreet}
                />
              </View>
            </View>

            {/* Landmark */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'hi' ? 'नजदीकी लैंडमार्क (वैकल्पिक)' : 'Nearby Landmark (Optional)'}
              </Text>
              <View style={styles.inputRow}>
                <Compass size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={lang === 'hi' ? 'उदा. शिव मंदिर के पास / पानी की टंकी' : 'e.g. Near Shiv Temple / Water Tank'}
                  placeholderTextColor="#94A3B8"
                  value={landmark}
                  onChangeText={setLandmark}
                />
              </View>
            </View>

            {/* Area / City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'hi' ? 'क्षेत्र / शहर' : 'Area / City'}
              </Text>
              <View style={styles.inputRow}>
                <MapPin size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={lang === 'hi' ? 'शहर व क्षेत्र' : 'Area, City'}
                  placeholderTextColor="#94A3B8"
                  value={areaCity}
                  onChangeText={setAreaCity}
                />
              </View>
            </View>

            {/* Contact Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'hi' ? 'साइट संपर्क नंबर' : 'Site Contact Phone'}
              </Text>
              <View style={styles.inputRow}>
                <Phone size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />
              </View>
            </View>
          </View>

          {/* Guarantee banner */}
          <View style={styles.guaranteeCard}>
            <CheckCircle2 size={16} color="#16A34A" />
            <Text style={styles.guaranteeText}>
              {lang === 'hi'
                ? 'साइट पते की पुष्टि होते ही निकटतम सत्यापित कारीगर को आपकी बुकिंग भेजी जाएगी।'
                : 'Your verified mistri will receive this exact navigation point for instant arrival.'}
            </Text>
          </View>
        </ScrollView>

        {/* Footer Confirm Button */}
        <View style={styles.footerBar}>
          <TouchableOpacity
            style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>
                  {lang === 'hi' ? 'पता सुरक्षित करें और मिस्त्री बुलाएं' : 'Confirm Site & Dispatch Mistri 🚀'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  headerSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mapWrap: {
    height: 190,
    width: '100%',
    position: 'relative',
  },
  mapWebview: {
    flex: 1,
  },
  mapFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mapCoordsText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#475569',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  formSectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#334155',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 10,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  guaranteeText: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  confirmBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});
