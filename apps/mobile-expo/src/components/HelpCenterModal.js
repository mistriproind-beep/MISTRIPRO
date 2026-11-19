import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import {
  HelpCircle,
  Phone,
  Mail,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  ChevronRight,
  Headphones,
} from 'lucide-react-native';
import { DeviceFeedback } from '../services/deviceFeedback';

export default function HelpCenterModal({
  visible,
  onClose,
  supportPhone = '+919057631403',
  supportEmail = 'mistripro.ind@gmail.com',
  lang = 'en',
  insets = { top: 0, bottom: 0 },
}) {
  const cleanPhone = (supportPhone || '+919057631403').replace(/\s+/g, '');
  const displayPhone = supportPhone || '+91 90576 31403';
  const cleanEmail = supportEmail || 'mistripro.ind@gmail.com';

  const handleCall = async () => {
    DeviceFeedback.triggerSuccessHaptics();
    const url = `tel:${cleanPhone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url).catch(() => {
          Alert.alert('Phone Helpline', `Call directly: ${displayPhone}`);
        });
      }
    } catch (e) {
      Alert.alert('Phone Helpline', `Call directly: ${displayPhone}`);
    }
  };

  const handleEmail = async () => {
    DeviceFeedback.triggerSuccessHaptics();
    const subject = encodeURIComponent('MistriPro Support Request & Inquiry');
    const url = `mailto:${cleanEmail}?subject=${subject}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Email Support', `Please write to: ${cleanEmail}`);
    }
  };

  const texts = {
    en: {
      title: 'Help Center & Support Desk',
      sub: 'Need assistance? Reach our support team 24/7 directly.',
      callTitle: 'Call Support Helpline',
      callSub: 'Immediate phone support for bookings, payments & KYC.',
      callBtn: 'Call Now 📞',
      emailTitle: 'Email Official Desk',
      emailSub: 'Send queries, payment receipts, disputes & feedback.',
      emailBtn: 'Send Email ✉️',
      hoursTitle: 'Support Timing',
      hoursSub: '24 Hours • 7 Days a week • All India',
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'How does 100% Escrow Protection work?',
          a: 'Your booking fee is held in verified escrow and only paid when the worker is confirmed and arrives.',
        },
        {
          q: 'How do workers receive job payment?',
          a: 'Workers quote and receive their actual wage directly on-site from the customer.',
        },
        {
          q: 'How long does Aadhaar KYC approval take?',
          a: 'Admin desk approves verified Aadhaar profiles usually within 5 to 15 minutes.',
        },
      ],
      close: 'Close',
    },
    hi: {
      title: 'सहायता केंद्र एवं हेल्पलाइन',
      sub: 'कोई समस्या है? हमारी सहायता टीम से सीधे संपर्क करें।',
      callTitle: 'हेल्पलाइन पर कॉल करें',
      callSub: 'बुकिंग, पेमेंट एवं केवाईसी सहायता के लिए तुरंत बात करें।',
      callBtn: 'अभी कॉल करें 📞',
      emailTitle: 'ईमेल सहायता डेस्क',
      emailSub: 'प्रश्न, रसीदें, शिकायतें या सुझाव हमें ईमेल करें।',
      emailBtn: 'ईमेल भेजें ✉️',
      hoursTitle: 'सहायता समय',
      hoursSub: '24 घंटे • सातों दिन • अखिल भारतीय हेल्पलाइन',
      faqTitle: 'अक्सर पूछे जाने वाले सवाल',
      faqs: [
        {
          q: '100% एस्क्रो सुरक्षा कैसे काम करती है?',
          a: 'आपकी बुकिंग राशि एस्क्रो में सुरक्षित रहती है और कारीगर के साइट पर पहुंचने के बाद ही मान्य होती है।',
        },
        {
          q: 'कारीगरों को भुगतान कैसे मिलता है?',
          a: 'कारीगर काम देखकर ग्राहक से सीधे ऑन-साइट मजदूरी तय करके प्राप्त करते हैं।',
        },
        {
          q: 'आधार केवाईसी अप्रूवल में कितना समय लगता है?',
          a: 'एडमिन डेस्क द्वारा आमतौर पर 5 से 15 मिनट में प्रोफाइल सत्यापित कर दी जाती है।',
        },
      ],
      close: 'बंद करें',
    },
    gu: {
      title: 'હેલ્પ સેન્ટર અને સહાયતા ડેસ્ક',
      sub: 'કોઈ સમસ્યા છે? અમારી સહાયતા ટીમનો સીધો સંપર્ક કરો.',
      callTitle: 'હેલ્પલાઇન પર કૉલ કરો',
      callSub: 'બુકિંગ, પેમેન્ટ અને કેવાયસી સહાય માટે તરત વાત કરો.',
      callBtn: 'હમણાં કૉલ કરો 📞',
      emailTitle: 'ઇમેઇલ સહાયતા ડેસ્ક',
      emailSub: 'પ્રશ્નો, રસીદો અથવા ફરિયાદો માટે અમને ઇમેઇલ કરો.',
      emailBtn: 'ઇમેઇલ મોકલો ✉️',
      hoursTitle: 'સહાયતા સમય',
      hoursSub: '24 કલાક • સાતેય દિવસ • ઓલ ઇન્ડિયા હેલ્પલાઇન',
      faqTitle: 'વારંવાર પૂછાતા પ્રશ્નો',
      faqs: [
        {
          q: '100% એસ્ક્રો સુરક્ષા કેવી રીતે કામ કરે છે?',
          a: 'તમારી બુકિંગ ફી એસ્ક્રોમાં સુરક્ષિત રહે છે અને કારીગર પહોંચ્યા પછી જ માન્ય ગણાય છે.',
        },
        {
          q: 'કારીગરોને પેમેન્ટ કેવી રીતે મળે છે?',
          a: 'કારીગર કામ જોઈને ગ્રાહક પાસેથી સીધી ઓન-સાઇટ મજૂરી મેળવે છે.',
        },
        {
          q: 'આધાર કેવાયસી મંજૂરીમાં કેટલો સમય લાગે છે?',
          a: 'એડમિન ડેસ્ક સામાન્ય રીતે 5 થી 15 મિનિટમાં પ્રોફાઇલ મંજૂર કરે છે.',
        },
      ],
      close: 'બંધ કરો',
    },
    mr: {
      title: 'मदत केंद्र आणि सपोर्ट डेस्क',
      sub: 'काही अडचण आहे? आमच्या सपोर्ट टीमशी थेट संपर्क साधा.',
      callTitle: 'हेल्पलाइनवर कॉल करा',
      callSub: 'बुकिंग, पेमेंट आणि केवायसी मदतीसाठी त्वरित बोला.',
      callBtn: 'आता कॉल करा 📞',
      emailTitle: 'ईमेल सपोर्ट डेस्क',
      emailSub: 'प्रश्न, पावत्या किंवा तक्रारींसाठी आम्हाला ईमेल करा.',
      emailBtn: 'ईमेल पाठवा ✉️',
      hoursTitle: 'सपोर्ट वेळ',
      hoursSub: '24 तास • सातही दिवस • अखिल भारतीय हेल्पलाइन',
      faqTitle: 'वारंवार विचारले जाणारे प्रश्न',
      faqs: [
        {
          q: '100% एस्क्रो सुरक्षा कशी कार्य करते?',
          a: 'आपली बुकिंग रक्कम सुरक्षित एस्क्रोमध्ये असते आणि कारागीर आल्यावरच मान्य केली जाते.',
        },
        {
          q: 'कारागिरांना पेमेंट कसे मिळते?',
          a: 'कारागीर प्रत्यक्ष काम पाहून ग्राहकाकडून थेट जागेवर मजुरी ठरवून घेतात.',
        },
        {
          q: 'आधार केवायसी मंजुरीसाठी किती वेळ लागतो?',
          a: 'प्रशासक डेस्कद्वारे साधारणपणे 5 ते 15 मिनिटांत प्रोफाइल मंजूर केली जाते.',
        },
      ],
      close: 'बंद करा',
    },
  };

  const t = texts[lang] || texts.en;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Headphones size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.title}>{t.title}</Text>
                <Text style={styles.sub}>{t.sub}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. Phone Helpline Card */}
            <View style={styles.contactCard}>
              <View style={styles.contactCardTop}>
                <View style={[styles.contactIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Phone size={20} color="#15803D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactCardTitle}>{t.callTitle}</Text>
                  <Text style={styles.contactValueText}>{displayPhone}</Text>
                  <Text style={styles.contactSubText}>{t.callSub}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.callActionBtn} onPress={handleCall} activeOpacity={0.85}>
                <Phone size={16} color="#FFFFFF" />
                <Text style={styles.callActionBtnText}>{t.callBtn}</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Email Desk Card */}
            <View style={styles.contactCard}>
              <View style={styles.contactCardTop}>
                <View style={[styles.contactIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Mail size={20} color="#4F46E5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactCardTitle}>{t.emailTitle}</Text>
                  <Text style={styles.contactValueText}>{cleanEmail}</Text>
                  <Text style={styles.contactSubText}>{t.emailSub}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.emailActionBtn} onPress={handleEmail} activeOpacity={0.85}>
                <Mail size={16} color="#FFFFFF" />
                <Text style={styles.emailActionBtnText}>{t.emailBtn}</Text>
              </TouchableOpacity>
            </View>

            {/* Support Timing Notice */}
            <View style={styles.timingNotice}>
              <Clock size={16} color="#0369A1" />
              <View style={{ flex: 1 }}>
                <Text style={styles.timingNoticeTitle}>{t.hoursTitle}</Text>
                <Text style={styles.timingNoticeSub}>{t.hoursSub}</Text>
              </View>
            </View>

            {/* FAQs Accordion Section */}
            <View style={styles.faqSection}>
              <Text style={styles.faqSectionHeading}>{t.faqTitle}</Text>
              {t.faqs.map((f, idx) => (
                <View key={idx} style={styles.faqCard}>
                  <Text style={styles.faqQ}>❓ {f.q}</Text>
                  <Text style={styles.faqA}>{f.a}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
  },
  sub: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  scrollBody: {
    paddingTop: 14,
    gap: 14,
  },
  contactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  contactCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCardTitle: {
    fontSize: 11,
    fontFamily: 'Satoshi-Bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  contactValueText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
    marginTop: 2,
  },
  contactSubText: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 15,
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 11,
    borderRadius: 12,
  },
  callActionBtnText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
  emailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 11,
    borderRadius: 12,
  },
  emailActionBtnText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },
  timingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  timingNoticeTitle: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#0369A1',
  },
  timingNoticeSub: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    color: '#0284C7',
  },
  faqSection: {
    gap: 8,
    marginTop: 4,
  },
  faqSectionHeading: {
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  faqQ: {
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    color: '#1E293B',
  },
  faqA: {
    fontSize: 11.5,
    fontFamily: 'Satoshi-Regular',
    color: '#64748B',
    lineHeight: 16,
  },
});
