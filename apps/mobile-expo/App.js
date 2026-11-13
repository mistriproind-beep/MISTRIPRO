import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Briefcase,
  Plus,
  Star,
  User,
  Bell,
  Search,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  Calendar,
  ThumbsUp,
  CreditCard,
  Check,
  RotateCcw,
  LogOut,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// 1. Multilingual Dictionary
const I18N = {
  en: {
    appName: 'MISTRI PRO',
    tagline: 'Skilled Hands. Trusted Work.',
    hello: 'Good morning',
    location: 'Vaishali Nagar, Jaipur',
    activeProject: 'ACTIVE REQUIREMENT',
    postRequirement: '+ Post Tender',
    trackShipping: 'Track Progress →',
    searchPlaceholder: 'Search masons, carpenters, plumbers...',
    currentTracking: 'Current Work Progress',
    trackingId: 'Tender ID',
    statusInTransit: 'IN PROGRESS',
    recentActivities: 'Top Verified Workers Nearby',
    seeAll: 'View all',
    vacanciesLeft: 'vacancies left',
    bidNow: 'Apply for Job',
    selectWorker: 'Hire Worker',
    hired: 'Worker Hired',
    balance: 'RECORDED EARNINGS',
    topUp: 'Ledger',
    findJobs: 'Find Jobs',
    trackBids: 'My Bids (4)',
    weeklyStatus: 'Weekly Site Performance',
    hoursWorked: '36 hrs',
    homeTab: 'Home',
    workTab: 'Work',
    postTab: 'Post',
    reviewTab: 'Reviews',
    profileTab: 'Profile',
    customerRole: 'Customer',
    workerRole: 'Skilled Worker',
    switchRole: 'Switch Persona',
    verifiedBadge: 'Verified Worker',
    logOut: 'Log Out',
  },
  hi: {
    appName: 'मिस्त्री प्रो',
    tagline: 'कुशल हाथ। विश्वसनीय कार्य।',
    hello: 'शुभ प्रभात',
    location: 'वैशाली नगर, जयपुर',
    activeProject: 'सक्रिय कार्य आवश्यकता',
    postRequirement: '+ नया काम पोस्ट',
    trackShipping: 'कार्य प्रगति देखें →',
    searchPlaceholder: 'राजमिस्त्री, बढ़ई, प्लंबर खोजें...',
    currentTracking: 'चल रही कार्य प्रगति',
    trackingId: 'टेंडर आईडी',
    statusInTransit: 'कार्य प्रगति पर',
    recentActivities: 'सत्यापित नजदीकी कारीगर',
    seeAll: 'सभी देखें',
    vacanciesLeft: 'पद रिक्त',
    bidNow: 'आवेदन करें',
    selectWorker: 'कारीगर चुनें',
    hired: 'चयनित कारीगर',
    balance: 'कुल दर्ज कमाई',
    topUp: 'लेजर',
    findJobs: 'काम खोजें',
    trackBids: 'मेरे आवेदन (4)',
    weeklyStatus: 'साप्ताहिक कार्य प्रदर्शन',
    hoursWorked: '36 घंटे',
    homeTab: 'होम',
    workTab: 'काम',
    postTab: 'पोस्ट',
    reviewTab: 'समीक्षा',
    profileTab: 'प्रोफ़ाइल',
    customerRole: 'ग्राहक',
    workerRole: 'कारीगर / मजदूर',
    switchRole: 'भूमिका बदलें',
    verifiedBadge: 'सत्यापित कारीगर',
    logOut: 'लॉग आउट',
  },
  gu: {
    appName: 'મિસ્ત્રી પ્રો',
    tagline: 'કુશળ હાથ. વિશ્વસનીય કામ.',
    hello: 'શુભ સવાર',
    location: 'જયપુર, રાજસ્થાન',
    activeProject: 'ચાલુ પ્રોજેક્ટ',
    postRequirement: '+ કામ પોસ્ટ',
    trackShipping: 'પ્રગતિ જુઓ →',
    searchPlaceholder: 'કડિયા, સુથાર, પ્લમ્બર શોધો...',
    currentTracking: 'કામ ની પ્રગતિ',
    trackingId: 'ટેન્ડર આઈડી',
    statusInTransit: 'કામ ચાલુ છે',
    recentActivities: 'ચકાસાયેલ કારીગરો',
    seeAll: 'બધા જુઓ',
    vacanciesLeft: 'જગ્યા ખાલી',
    bidNow: 'અરજી કરો',
    selectWorker: 'કારીગર પસંદ કરો',
    hired: 'પસંદ થયેલ',
    balance: 'કુલ કમાણી',
    topUp: 'લેજર',
    findJobs: 'કામ શોધો',
    trackBids: 'મારી અરજીઓ',
    weeklyStatus: 'સાપ્તાહિક પ્રદર્શન',
    hoursWorked: '36 કલાક',
    homeTab: 'હોમ',
    workTab: 'કામ',
    postTab: 'પોસ્ટ',
    reviewTab: 'રિવ્યુ',
    profileTab: 'પ્રોફાઇલ',
    customerRole: 'ગ્રાહક',
    workerRole: 'કારીગર',
    switchRole: 'ભૂમિકા બદલો',
    verifiedBadge: 'ચકાસાયેલ કારીગર',
    logOut: 'લૉગ આઉટ',
  },
  mr: {
    appName: 'मिस्त्री प्रो',
    tagline: 'कुशल हात. विश्वासार्ह काम.',
    hello: 'शुभ सकाळ',
    location: 'जयपूर, राजस्थान',
    activeProject: 'सक्रिय प्रकल्प',
    postRequirement: '+ काम पोस्ट',
    trackShipping: 'प्रगती तपासा →',
    searchPlaceholder: 'गवंडी, सुतार, प्लंबर शोधा...',
    currentTracking: 'कामाची सद्यस्थिती',
    trackingId: 'निविदा आयडी',
    statusInTransit: 'काम प्रगतीपथावर',
    recentActivities: 'सत्यापित स्थानिक कारागीर',
    seeAll: 'सर्व पहा',
    vacanciesLeft: 'जागा शिल्लक',
    bidNow: 'अर्ज करा',
    selectWorker: 'कारागीर निवडा',
    hired: 'निवड झाली',
    balance: 'एकूण नोंदवलेली कमाई',
    topUp: 'खातेवही',
    findJobs: 'कामे शोधा',
    trackBids: 'माझे अर्ज',
    weeklyStatus: 'साप्ताहिक कामगिरी',
    hoursWorked: '36 तास',
    homeTab: 'मुख्य',
    workTab: 'कामे',
    postTab: 'पोस्ट',
    reviewTab: 'अभिप्राय',
    profileTab: 'प्रोफाइल',
    customerRole: 'ग्राहक',
    workerRole: 'कारागीर / मजूर',
    switchRole: 'भूमिका बदला',
    verifiedBadge: 'सत्यापित कारागीर',
    logOut: 'लॉग आउट',
  },
};

const CATEGORIES = [
  { id: '1', name: 'Mason\nराजमिस्त्री', icon: '🧱', count: '32 verified', bg: '#EFF6FF', border: '#DBEAFE' },
  { id: '2', name: 'Labour\nमजदूर', icon: '👷', count: '54 verified', bg: '#FEF3C7', border: '#FDE68A' },
  { id: '3', name: 'Carpenter\nबढ़ई', icon: '🪚', count: '18 verified', bg: '#FDF2F8', border: '#FCE7F3' },
  { id: '4', name: 'Plumber\nप्लंबर', icon: '🔧', count: '21 verified', bg: '#F0FDF4', border: '#DCFCE7' },
  { id: '5', name: 'Electrician\nइलेक्ट्रीशियन', icon: '⚡', count: '29 verified', bg: '#FFFBEB', border: '#FEF3C7' },
  { id: '6', name: 'Tiles\nफ्लोरिंग', icon: '◻️', count: '14 verified', bg: '#F5F3FF', border: '#EDE9FE' },
  { id: '7', name: 'Painter\nपेंटर', icon: '🎨', count: '25 verified', bg: '#F1F5F9', border: '#E2E8F0' },
  { id: '8', name: 'False Ceiling\nपीओपी', icon: '🏛️', count: '11 verified', bg: '#FEF2F2', border: '#FEE2E2' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState('MAIN'); // 'MAIN' | 'AUTH'
  const [activeTab, setActiveTab] = useState('HOME'); // HOME, WORK, POST, REVIEWS, PROFILE
  const [role, setRole] = useState('CUSTOMER'); // CUSTOMER vs WORKER
  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [phone, setPhone] = useState('');

  // Post Work Modal & Step
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postStep, setPostStep] = useState(1);
  const [tenderTitle, setTenderTitle] = useState('Bathroom Renovation & Wall Plastering');
  const [tenderAddress, setTenderAddress] = useState('Plot 42, Officers Campus, Sirsi Road, Jaipur');
  const [masonCount, setMasonCount] = useState(3);
  const [labourCount, setLabourCount] = useState(5);
  const [tenderBudget, setTenderBudget] = useState('50000');
  const [paymentSuccessModal, setPaymentSuccessModal] = useState(false);

  // Worker Bidding Modal
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidWorkerWage, setBidWorkerWage] = useState('900');

  // Customer Hired Workers State
  const [selectedWorkers, setSelectedWorkers] = useState(['Rajesh Kumar', 'Suresh Gurjar']);

  // Write Review Modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  const t = I18N[lang] || I18N.en;

  const toggleLang = () => {
    const list = ['en', 'hi', 'gu', 'mr'];
    const next = list[(list.indexOf(lang) + 1) % list.length];
    setLang(next);
  };

  const toggleRole = () => {
    const next = role === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER';
    setRole(next);
  };

  // Top App Bar: Ultra-Clean Apple Aesthetics
  // - No logo in header
  // - No role toggle in header (moved exclusively to Profile)
  const renderTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                role === 'CUSTOMER'
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            }}
            style={styles.avatarImg}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.greetingSub}>{t.hello},</Text>
          <Text style={styles.greetingName}>
            {role === 'CUSTOMER' ? 'Ramesh Sharma' : 'Rajesh Kumar'}
          </Text>
          <View style={styles.locationPill}>
            <MapPin size={12} color="#4F46E5" />
            <Text style={styles.locationText}>{t.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.topBarRight}>
        <TouchableOpacity style={styles.langPillBtn} onPress={toggleLang} activeOpacity={0.7}>
          <Text style={styles.langPillText}>{lang.toUpperCase()} 🌐</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.notifCircleBtn} activeOpacity={0.7}>
          <Bell size={18} color="#0F172A" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Floating Bottom Navigation Dock with Real Bottom Margin & Padding
  const renderFloatingBottomNav = () => (
    <View
      style={[
        styles.bottomNavContainer,
        { bottom: Math.max(insets.bottom + 8, 20) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.floatingNavBar}>
        {/* TAB 1: HOME */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'HOME' && styles.navItemActive]}
          onPress={() => setActiveTab('HOME')}
          activeOpacity={0.8}
        >
          <Home
            size={20}
            color={activeTab === 'HOME' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'HOME' ? 2.5 : 1.8}
          />
          <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>
            {t.homeTab}
          </Text>
        </TouchableOpacity>

        {/* TAB 2: WORK */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'WORK' && styles.navItemActive]}
          onPress={() => setActiveTab('WORK')}
          activeOpacity={0.8}
        >
          <Briefcase
            size={20}
            color={activeTab === 'WORK' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'WORK' ? 2.5 : 1.8}
          />
          <Text style={[styles.navLabel, activeTab === 'WORK' && styles.navLabelActive]}>
            {t.workTab}
          </Text>
        </TouchableOpacity>

        {/* CENTER ACTION: POST / TENDER */}
        <TouchableOpacity
          style={styles.navCenterBtn}
          onPress={() => {
            setPostStep(1);
            setPostModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
        </TouchableOpacity>

        {/* TAB 4: REVIEWS */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'REVIEWS' && styles.navItemActive]}
          onPress={() => setActiveTab('REVIEWS')}
          activeOpacity={0.8}
        >
          <Star
            size={20}
            color={activeTab === 'REVIEWS' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'REVIEWS' ? 2.5 : 1.8}
          />
          <Text style={[styles.navLabel, activeTab === 'REVIEWS' && styles.navLabelActive]}>
            {t.reviewTab}
          </Text>
        </TouchableOpacity>

        {/* TAB 5: PROFILE */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'PROFILE' && styles.navItemActive]}
          onPress={() => setActiveTab('PROFILE')}
          activeOpacity={0.8}
        >
          <User
            size={20}
            color={activeTab === 'PROFILE' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'PROFILE' ? 2.5 : 1.8}
          />
          <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]}>
            {t.profileTab}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // TAB 1: HOME SCREEN
  const renderHomeScreen = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 95, 115) }}
    >
      {/* Sleek Dark Hero Card */}
      <View style={styles.heroCard}>
        {role === 'CUSTOMER' ? (
          <>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroSubText}>{t.activeProject}</Text>
                <Text style={styles.heroMainText}>MISTRI-26110001</Text>
                <Text style={styles.heroProjectName}>Bathroom Renovation & Plastering</Text>
              </View>
              <TouchableOpacity
                style={styles.heroWhitePill}
                onPress={() => {
                  setPostStep(1);
                  setPostModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.heroWhitePillText}>+ New Tender</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>3 of 4</Text>
                <Text style={styles.heroStatLabel}>Workers Hired</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>₹50,000</Text>
                <Text style={styles.heroStatLabel}>Budget (Negotiable)</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: '#4ADE80' }]}>₹299 Paid</Text>
                <Text style={styles.heroStatLabel}>Listing Fee</Text>
              </View>
            </View>

            {/* Hero Action Buttons (Crisp & Well-Fitted) */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => {
                  setPostStep(1);
                  setPostModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#0F172A" strokeWidth={2.4} />
                <Text style={styles.heroActionText} numberOfLines={1}>
                  {t.postRequirement}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                onPress={() => setActiveTab('WORK')}
                activeOpacity={0.8}
              >
                <TrendingUp size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={[styles.heroActionText, { color: '#FFFFFF' }]} numberOfLines={1}>
                  {t.trackShipping}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroSubText}>{t.balance}</Text>
                <Text style={styles.heroMainText}>₹28,500.00</Text>
                <Text style={styles.heroProjectName}>Verified Mason & Team Leader</Text>
              </View>
              <TouchableOpacity
                style={styles.heroWhitePill}
                onPress={() => setActiveTab('WORK')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroWhitePillText}>{t.topUp}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>₹12,000</Text>
                <Text style={styles.heroStatLabel}>This Month</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>8 Jobs</Text>
                <Text style={styles.heroStatLabel}>Completed</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: '#4ADE80' }]}>★ 4.9</Text>
                <Text style={styles.heroStatLabel}>Reputation</Text>
              </View>
            </View>

            {/* Worker Action Buttons: Clean & Symmetrical */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => setActiveTab('WORK')}
                activeOpacity={0.8}
              >
                <Search size={16} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.heroActionText} numberOfLines={1}>
                  {t.findJobs}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                onPress={() => setActiveTab('WORK')}
                activeOpacity={0.8}
              >
                <Briefcase size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={[styles.heroActionText, { color: '#FFFFFF' }]} numberOfLines={1}>
                  {t.trackBids}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Clean Apple-Like Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#8E8E93" />
          <TextInput
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <SlidersHorizontal size={18} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      {/* Service Categories (Horizontal scroll) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Explore Services</Text>
          <TouchableOpacity onPress={() => setActiveTab('WORK')} activeOpacity={0.7}>
            <Text style={styles.sectionSeeAll}>{t.seeAll} →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catCard, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={() => {
                setPostStep(1);
                setPostModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 28 }}>{c.icon}</Text>
              <Text style={styles.catCardName}>{c.name}</Text>
              <Text style={styles.catCardCount}>{c.count}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Current Work Progress (Mathematically Aligned Horizontal Stepper) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.currentTracking}</Text>
          <TouchableOpacity onPress={() => setActiveTab('WORK')} activeOpacity={0.7}>
            <Text style={styles.sectionSeeAll}>{t.seeAll} →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackingCard}>
          <View style={styles.trackingTopRow}>
            <View>
              <Text style={styles.trackingLabel}>{t.trackingId}:</Text>
              <Text style={styles.trackingCode}>MISTRI-26110001</Text>
            </View>
            <View style={styles.statusPillBlue}>
              <Text style={styles.statusPillBlueText}>{t.statusInTransit}</Text>
            </View>
          </View>

          <View style={styles.projectInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.projectInfoLabel}>Project Requirement</Text>
              <Text style={styles.projectInfoTitle}>Bathroom Renovation</Text>
              <Text style={styles.projectInfoDate}>3 Masons, 5 Labourers needed</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.projectInfoLabel}>Site Location</Text>
              <Text style={styles.projectInfoTitle}>Vaishali Nagar, Jaipur</Text>
              <Text style={styles.projectInfoDate}>30 Days Duration</Text>
            </View>
          </View>

          {/* Stepper Timeline: Perfect Center Alignment */}
          <View style={styles.stepperContainer}>
            <View style={styles.connectorTrack}>
              <View style={[styles.connectorSegment, styles.connectorDone]} />
              <View style={[styles.connectorSegment, styles.connectorDone]} />
              <View style={[styles.connectorSegment, styles.connectorPending]} />
            </View>

            <View style={styles.nodesRow}>
              {/* Node 1: Posted */}
              <View style={styles.nodeColumn}>
                <View style={[styles.nodeCircle, styles.nodeCircleDone]}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.nodeTitle}>Posted</Text>
                <Text style={styles.nodeSub}>₹299 Paid</Text>
              </View>

              {/* Node 2: Matched */}
              <View style={styles.nodeColumn}>
                <View style={[styles.nodeCircle, styles.nodeCircleDone]}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={styles.nodeTitle}>Matched</Text>
                <Text style={styles.nodeSub}>Wave 1 (0-5km)</Text>
              </View>

              {/* Node 3: In Work (Active) */}
              <View style={styles.nodeColumn}>
                <View style={[styles.nodeCircle, styles.nodeCircleActive]}>
                  <View style={styles.nodePulseInner} />
                </View>
                <Text style={[styles.nodeTitle, { color: '#4F46E5', fontWeight: '700' }]}>
                  In Work
                </Text>
                <Text style={styles.nodeSub}>3 Hired</Text>
              </View>

              {/* Node 4: Completed */}
              <View style={styles.nodeColumn}>
                <View style={[styles.nodeCircle, styles.nodeCirclePending]}>
                  <View style={styles.nodePendingDot} />
                </View>
                <Text style={styles.nodeTitle}>Completed</Text>
                <Text style={styles.nodeSub}>Approval</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.manageTenderBtn}
            onPress={() => setActiveTab('WORK')}
            activeOpacity={0.8}
          >
            <Text style={styles.manageTenderBtnText}>
              Manage Vacancies & Site Appointments →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Verified Workers Nearby (Organized Layout) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.recentActivities}</Text>
          <TouchableOpacity onPress={() => setActiveTab('WORK')} activeOpacity={0.7}>
            <Text style={styles.sectionSeeAll}>{t.seeAll} →</Text>
          </TouchableOpacity>
        </View>

        {[
          {
            id: '1',
            name: 'Rajesh Kumar',
            skill: 'Mason (राजमिस्त्री)',
            exp: '8 Years Exp',
            dist: '4.5 km away',
            wage: '₹900 / day',
            rating: '4.9',
            reviews: '84 jobs done',
            img: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?w=240',
            specialties: 'Brickwork • Plaster • Granite Skirting',
          },
          {
            id: '2',
            name: 'Mohan Lal Suthar',
            skill: 'Carpenter / Furniture (बढ़ई)',
            exp: '12 Years Exp',
            dist: '6.0 km away',
            wage: '₹1,100 / day',
            rating: '4.8',
            reviews: '62 jobs done',
            img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=240',
            specialties: 'Modular Kitchen • Door & Window Framing',
          },
          {
            id: '3',
            name: 'Suresh Gurjar',
            skill: 'Construction Labour (मजदूर)',
            exp: '5 Years Exp',
            dist: '2.8 km away',
            wage: '₹600 / day',
            rating: '5.0',
            reviews: '41 jobs done',
            img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=240',
            specialties: 'Material Transport • Concrete Mixing Assistance',
          },
        ].map((worker) => {
          const isSelected = selectedWorkers.includes(worker.name);
          return (
            <View key={worker.id} style={styles.workerCardOrganized}>
              <View style={styles.workerCardTop}>
                <Image source={{ uri: worker.img }} style={styles.workerAvatarLarge} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.workerNameText}>{worker.name}</Text>
                    <ShieldCheck size={16} color="#16A34A" />
                  </View>
                  <Text style={styles.workerSkillText}>{worker.skill}</Text>
                  <View style={styles.workerRatingRow}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.workerRatingNum}>{worker.rating}</Text>
                    <Text style={styles.workerReviewsCount}>({worker.reviews})</Text>
                  </View>
                </View>

                <View style={styles.wageTag}>
                  <Text style={styles.wageTagLabel}>Rate</Text>
                  <Text style={styles.wageTagAmount}>{worker.wage}</Text>
                </View>
              </View>

              <View style={styles.chipsRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>⏱ {worker.exp}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>📍 {worker.dist}</Text>
                </View>
                <View style={[styles.metaChip, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={[styles.metaChipText, { color: '#4F46E5', fontWeight: '600' }]}>
                    Govt KYC Verified
                  </Text>
                </View>
              </View>

              <Text style={styles.workerSpecialtiesText}>{worker.specialties}</Text>

              <View style={styles.workerCardBottom}>
                {role === 'CUSTOMER' ? (
                  <TouchableOpacity
                    style={[styles.hireWorkerBtn, isSelected && styles.hireWorkerBtnSelected]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedWorkers(selectedWorkers.filter((w) => w !== worker.name));
                      } else {
                        setSelectedWorkers([...selectedWorkers, worker.name]);
                        Alert.alert(
                          'Worker Hired! 🎉',
                          `${worker.name} assigned to MISTRI-26110001. Private contact numbers unlocked.`
                        );
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.hireWorkerBtnText,
                        isSelected && { color: '#16A34A', fontWeight: '700' },
                      ]}
                    >
                      {isSelected ? '✓ ' + t.hired : t.selectWorker}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.hireWorkerBtn}
                    onPress={() => setBidModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.hireWorkerBtnText}>{t.bidNow}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  // TAB 2: WORK SCREEN
  const renderWorkScreen = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 95, 115) }}
    >
      <View style={styles.pageHeaderPad}>
        <Text style={styles.pageMainHeading}>Project Management</Text>
        <Text style={styles.pageSubHeading}>
          Manage construction tenders, vacancy quotas, site visits, and completion approvals.
        </Text>
      </View>

      <View style={styles.projectDetailCard}>
        <View style={styles.trackingTopRow}>
          <View>
            <Text style={styles.trackingLabel}>Tender Reference Code</Text>
            <Text style={styles.trackingCode}>MISTRI-26110001</Text>
          </View>
          <View style={styles.statusPillBlue}>
            <Text style={styles.statusPillBlueText}>IN PROGRESS</Text>
          </View>
        </View>

        <Text style={styles.projectDetailTitle}>Residential Bathroom Renovation & Plastering</Text>
        <Text style={styles.projectDetailLoc}>📍 Plot 42, Officers Campus, Sirsi Road, Jaipur</Text>

        <View style={styles.vacancyMatrixBox}>
          <Text style={styles.vacancyMatrixHeading}>VACANCY MANAGEMENT MATRIX</Text>

          <View style={styles.vacancyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vacancySkillTitle}>Mason (राजमिस्त्री)</Text>
              <Text style={styles.vacancyCounts}>3 Required • 2 Hired • 1 Vacancy Left</Text>
            </View>
            <View style={styles.vacancyBadgeYellow}>
              <Text style={styles.vacancyBadgeYellowText}>1 Vacancy Open</Text>
            </View>
          </View>

          <View style={[styles.vacancyRow, { borderBottomWidth: 0, marginTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vacancySkillTitle}>Construction Labour (मजदूर)</Text>
              <Text style={styles.vacancyCounts}>5 Required • 1 Hired • 4 Vacancies Left</Text>
            </View>
            <View style={styles.vacancyBadgeYellow}>
              <Text style={styles.vacancyBadgeYellowText}>4 Vacancies Open</Text>
            </View>
          </View>
        </View>

        <View style={styles.workUpdatesLog}>
          <Text style={styles.vacancyMatrixHeading}>ON-SITE ACTIVITY TIMELINE</Text>

          <View style={styles.logItem}>
            <View style={styles.logCheck}>
              <Check size={12} color="#16A34A" strokeWidth={3} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.logTime}>09:30 AM • 16 Nov 2026</Text>
              <Text style={styles.logDesc}>
                Rajesh Kumar (Mason) arrived on-site and initiated floor leveling.
              </Text>
            </View>
          </View>

          <View style={styles.logItem}>
            <View style={styles.logCheck}>
              <Check size={12} color="#16A34A" strokeWidth={3} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.logTime}>01:15 PM • 16 Nov 2026</Text>
              <Text style={styles.logDesc}>
                Wall plastering completed. 2 site inspection photos uploaded.
              </Text>
            </View>
          </View>

          <View style={[styles.logItem, { borderLeftWidth: 0 }]}>
            <View style={[styles.logCheck, { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' }]}>
              <Clock size={12} color="#4F46E5" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.logTime}>04:30 PM • 16 Nov 2026</Text>
              <Text style={styles.logDesc}>
                Vitrified tile laying in progress. Awaiting customer sign-off.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.projectActionsGrid}>
          <TouchableOpacity
            style={styles.projectPrimaryBtn}
            onPress={() => {
              Alert.alert('Site Visit Scheduled 📅', 'Visit proposed to Rajesh Kumar for 17 Nov, 10:00 AM.');
            }}
            activeOpacity={0.8}
          >
            <Calendar size={16} color="#FFFFFF" />
            <Text style={styles.projectPrimaryBtnText}>Schedule Site Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.projectSecondaryBtn}
            onPress={() => {
              Alert.alert(
                'Work Approved! ✅',
                'Task completed successfully. You can now leave a verified review.'
              );
              setActiveTab('REVIEWS');
            }}
            activeOpacity={0.8}
          >
            <ThumbsUp size={16} color="#0F172A" />
            <Text style={styles.projectSecondaryBtnText}>Approve Completion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // TAB 3: REVIEWS SCREEN
  const renderReviewsScreen = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 95, 115) }}
    >
      <View style={styles.pageHeaderPad}>
        <Text style={styles.pageMainHeading}>Ratings & Reviews</Text>
        <Text style={styles.pageSubHeading}>
          Verified customer feedback and worker reputation for completed jobs.
        </Text>
      </View>

      <View style={styles.scoreOverviewCard}>
        <View style={styles.scoreBigCol}>
          <Text style={styles.scoreBigNumber}>4.9</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} color="#F59E0B" fill="#F59E0B" />
            ))}
          </View>
          <Text style={styles.scoreBasedText}>148 Verified Ratings</Text>
        </View>

        <View style={styles.scoreBarsCol}>
          <View style={styles.barItem}>
            <Text style={styles.barLabel}>Quality</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '96%' }]} />
            </View>
            <Text style={styles.barScore}>4.9</Text>
          </View>
          <View style={styles.barItem}>
            <Text style={styles.barLabel}>Punctuality</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '92%' }]} />
            </View>
            <Text style={styles.barScore}>4.8</Text>
          </View>
          <View style={styles.barItem}>
            <Text style={styles.barLabel}>Behaviour</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '100%' }]} />
            </View>
            <Text style={styles.barScore}>5.0</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <TouchableOpacity
          style={styles.writeReviewBannerBtn}
          onPress={() => setReviewModalVisible(true)}
          activeOpacity={0.85}
        >
          <Star size={18} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.writeReviewBannerBtnText}>+ Rate & Review a Completed Job</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Recent Customer Reviews</Text>

        {[
          {
            id: '1',
            customer: 'Anita Sharma',
            worker: 'Rajesh Kumar (Mason)',
            project: 'Bathroom Renovation',
            rating: 5,
            date: '12 Nov 2026',
            comment:
              'Rajesh did an exceptional job with our bathroom tile alignment and wall plastering. Completed in 4 days with zero material wastage. Highly recommended!',
            tags: ['High Quality', 'Punctual', 'Polite'],
          },
          {
            id: '2',
            customer: 'Vikram Mehta',
            worker: 'Mohan Lal Suthar (Carpenter)',
            project: 'Modular Kitchen Cabinets',
            rating: 5,
            date: '8 Nov 2026',
            comment:
              'Very skilled furniture maker. Arrived with his own precision cutting tools and finished the trolley assembly cleanly.',
            tags: ['Expert Woodwork', 'Clean Finish'],
          },
        ].map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.revCustomerName}>{rev.customer}</Text>
                <Text style={styles.revWorkerName}>Hired: {rev.worker}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      color="#F59E0B"
                      fill={s <= rev.rating ? '#F59E0B' : 'transparent'}
                    />
                  ))}
                </View>
                <Text style={styles.revDate}>{rev.date}</Text>
              </View>
            </View>

            <Text style={styles.revComment}>{rev.comment}</Text>

            <View style={styles.tagsRow}>
              {rev.tags.map((tag, i) => (
                <View key={i} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>✓ {tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // TAB 4: PROFILE SCREEN (With Dedicated Role Switcher and LOG OUT Function)
  const renderProfileScreen = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 95, 115) }}
    >
      <View style={styles.pageHeaderPad}>
        <Text style={styles.pageMainHeading}>Account & Preferences</Text>
        <Text style={styles.pageSubHeading}>
          Manage verified profile, switch personas, and change language.
        </Text>
      </View>

      {/* Role Switcher Box (Placed specifically in Profile) */}
      <View style={styles.personaSwitchBox}>
        <View style={styles.personaSwitchTop}>
          <View style={styles.personaBadge}>
            <Text style={styles.personaBadgeText}>ACTIVE ACCOUNT MODE</Text>
          </View>
          <Text style={styles.personaTitle}>
            {role === 'CUSTOMER' ? 'Customer (Hiring Mode)' : 'Worker (Bidding Mode)'}
          </Text>
          <Text style={styles.personaDesc}>
            {role === 'CUSTOMER'
              ? 'You can post work requirements, review applicant profiles, and hire verified workers.'
              : 'You can discover nearby construction jobs, bid daily wages, and track earnings.'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.switchPersonaBtn}
          onPress={toggleRole}
          activeOpacity={0.85}
        >
          <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.switchPersonaBtnText}>
            Switch to {role === 'CUSTOMER' ? 'Worker Persona 👷' : 'Customer Persona 🏠'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Card */}
      <View style={styles.profileUserCard}>
        <Image
          source={require('./assets/logo.png')}
          style={{ width: 60, height: 60, borderRadius: 18 }}
        />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.profileName}>
              {role === 'CUSTOMER' ? 'Ramesh Sharma' : 'Rajesh Kumar'}
            </Text>
            <ShieldCheck size={18} color="#16A34A" />
          </View>
          <Text style={styles.profilePhone}>+91 98290 12345</Text>
          <View style={styles.roleTagPill}>
            <Text style={styles.roleTagPillText}>
              {role === 'CUSTOMER' ? 'Customer Profile' : 'Verified Professional Worker'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Rows */}
      <View style={styles.sectionWrap}>
        <View style={styles.settingsBlock}>
          {/* Language Selector */}
          <TouchableOpacity style={styles.settingsRow} onPress={toggleLang} activeOpacity={0.7}>
            <View style={styles.settingsIconBox}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.settingsTitle}>App Language / भाषा</Text>
              <Text style={styles.settingsSub}>
                Current: {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : lang === 'gu' ? 'ગુજરાતી (Gujarati)' : 'मराठी (Marathi)'}
              </Text>
            </View>
            <View style={styles.langPill}>
              <Text style={styles.langPillText}>CHANGE</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          {/* KYC Status Details */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconBox}>
              <ShieldCheck size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.settingsTitle}>Government ID & KYC Status</Text>
              <Text style={styles.settingsSub}>Aadhaar Masked: XXXX-XXXX-4912 • Approved</Text>
            </View>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusPillGreenText}>VERIFIED</Text>
            </View>
          </View>

          <View style={styles.settingsDivider} />

          {/* Platform Invoices */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconBox}>
              <CreditCard size={20} color="#0F172A" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.settingsTitle}>Platform Listing Fees (₹299)</Text>
              <Text style={styles.settingsSub}>Razorpay Order: order_mp_26110001 (Paid)</Text>
            </View>
            <ArrowUpRight size={18} color="#94A3B8" />
          </View>

          <View style={styles.settingsDivider} />

          {/* LOG OUT BUTTON (Clean Apple Style) */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out of MISTRI PRO?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => {
                      setScreen('AUTH');
                    },
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIconBox, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.settingsTitle, { color: '#DC2626' }]}>{t.logOut}</Text>
              <Text style={styles.settingsSub}>Sign out of your active session on this phone</Text>
            </View>
            <ChevronRight size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // AUTH / LOGIN SCREEN (When Logged Out)
  if (screen === 'AUTH') {
    return (
      <SafeAreaView style={styles.rootContainer} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ScrollView contentContainerStyle={styles.authContainer} showsVerticalScrollIndicator={false}>
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 84, height: 84, borderRadius: 24, alignSelf: 'center', marginTop: 32 }}
          />

          <Text style={styles.authTitle}>MISTRI PRO</Text>
          <Text style={styles.authTagline}>Skilled Hands. Trusted Work.</Text>

          {/* Dev Bypass Button */}
          <TouchableOpacity
            style={styles.devBypassCard}
            onPress={() => {
              Alert.alert('Dev Login Verified', 'Logged in as abc / 1234');
              setScreen('MAIN');
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#B45309' }}>
                ⚡ One-Click Dev Login
              </Text>
              <View style={{ backgroundColor: '#F59E0B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#0F172A' }}>TEST</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#78350F', marginTop: 4 }}>
              Username: <Text style={{ fontWeight: '700' }}>abc</Text> | Password:{' '}
              <Text style={{ fontWeight: '700' }}>1234</Text>
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309', marginTop: 6 }}>
              Tap to enter dashboard directly →
            </Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '500' }}>— OR MOBILE OTP —</Text>
          </View>

          <View style={styles.phoneInputRow}>
            <Text style={styles.phonePrefix}>+91 </Text>
            <TextInput
              style={styles.phoneInputBox}
              placeholder="98290 12345"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <TouchableOpacity
            style={styles.sendOtpBtn}
            onPress={() => {
              Alert.alert('OTP Sent', 'OTP sent to mobile.');
              setScreen('MAIN');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.sendOtpBtnText}>Send Verification OTP</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // MAIN DASHBOARD CONTAINER
  return (
    <SafeAreaView style={styles.rootContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Global Top App Bar */}
      {renderTopBar()}

      {/* Screen Tabs */}
      <View style={{ flex: 1 }}>
        {activeTab === 'HOME' && renderHomeScreen()}
        {activeTab === 'WORK' && renderWorkScreen()}
        {activeTab === 'REVIEWS' && renderReviewsScreen()}
        {activeTab === 'PROFILE' && renderProfileScreen()}
      </View>

      {/* Floating Bottom Nav Dock (Rock-Solid with Bottom Margin & Padding) */}
      {renderFloatingBottomNav()}

      {/* 6-STEP TENDER CREATION MODAL */}
      <Modal visible={postModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeading}>Create Work Tender</Text>
                <Text style={styles.modalStepBadge}>Step {postStep} of 6</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => setPostModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Step 1: Info */}
              {postStep === 1 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Project Title *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    value={tenderTitle}
                    onChangeText={setTenderTitle}
                  />
                  <Text style={[styles.stepLabel, { marginTop: 14 }]}>Work Description *</Text>
                  <TextInput
                    style={[styles.textInputBox, { height: 95 }]}
                    multiline
                    placeholder="Describe the renovation, wall dimensions, materials needed..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              {/* Step 2: Location */}
              {postStep === 2 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Site Address *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    value={tenderAddress}
                    onChangeText={setTenderAddress}
                  />
                  <View style={styles.gpsConfirmCard}>
                    <MapPin size={20} color="#4F46E5" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ fontWeight: '700', color: '#0F172A', fontSize: 14 }}>
                        GPS Location Attached
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        Jaipur (26.9124° N, 75.7873° E) • Matching Waves 0-5 km
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Step 3: Vacancies */}
              {postStep === 3 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Specify Required Workers *</Text>

                  <View style={styles.counterRow}>
                    <View>
                      <Text style={styles.counterTitle}>Mason (राजमिस्त्री)</Text>
                      <Text style={styles.counterSub}>Brickwork, plaster, tiles</Text>
                    </View>
                    <View style={styles.stepperPill}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setMasonCount(Math.max(1, masonCount - 1))}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepperNum}>{masonCount}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setMasonCount(masonCount + 1)}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.counterRow, { marginTop: 14 }]}>
                    <View>
                      <Text style={styles.counterTitle}>Construction Labour (मजदूर)</Text>
                      <Text style={styles.counterSub}>Material transport & mixing</Text>
                    </View>
                    <View style={styles.stepperPill}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setLabourCount(Math.max(1, labourCount - 1))}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepperNum}>{labourCount}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setLabourCount(labourCount + 1)}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Step 4: Budget */}
              {postStep === 4 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Estimated Project Budget (₹) *</Text>
                  <TextInput
                    style={styles.textInputBox}
                    value={tenderBudget}
                    onChangeText={setTenderBudget}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.stepLabel, { marginTop: 14 }]}>Expected Duration</Text>
                  <TextInput style={styles.textInputBox} placeholder="e.g. 30 days" />
                </View>
              )}

              {/* Step 5: Contact */}
              {postStep === 5 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Customer Contact Name *</Text>
                  <TextInput style={styles.textInputBox} placeholder="Ramesh Sharma" />
                  <Text style={[styles.stepLabel, { marginTop: 14 }]}>Verified Mobile *</Text>
                  <TextInput style={styles.textInputBox} placeholder="+91 98290 12345" />
                </View>
              )}

              {/* Step 6: Review & ₹299 Razorpay Listing Fee */}
              {postStep === 6 && (
                <View style={styles.stepContent}>
                  <View style={styles.summaryReviewCard}>
                    <Text style={styles.summaryReviewHeading}>TENDER SUMMARY</Text>
                    <Text style={styles.summaryLine}>📋 Project: {tenderTitle}</Text>
                    <Text style={styles.summaryLine}>📍 Address: {tenderAddress}</Text>
                    <Text style={styles.summaryLine}>
                      👷 Vacancies: {masonCount} Masons, {labourCount} Labourers
                    </Text>
                    <Text style={styles.summaryLine}>💰 Total Budget: ₹{tenderBudget}</Text>

                    <View style={styles.summaryDivider} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: '#0F172A' }}>
                        Platform Request Fee:
                      </Text>
                      <Text style={{ fontWeight: '800', fontSize: 24, color: '#4F46E5' }}>
                        ₹299
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                      Server-verified Razorpay signature required before publishing.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooterRow}>
              {postStep > 1 && (
                <TouchableOpacity
                  style={styles.modalPrevBtn}
                  onPress={() => setPostStep(postStep - 1)}
                >
                  <Text style={styles.modalPrevBtnText}>← Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalNextBtn}
                onPress={() => {
                  if (postStep < 6) {
                    setPostStep(postStep + 1);
                  } else {
                    setPostModalVisible(false);
                    setPaymentSuccessModal(true);
                  }
                }}
              >
                <Text style={styles.modalNextBtnText}>
                  {postStep === 6 ? 'Pay ₹299 & Publish 💳' : 'Continue →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PAYMENT SUCCESS MODAL */}
      <Modal visible={paymentSuccessModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.successDialogCard}>
            <View style={styles.successCircle}>
              <CheckCircle2 size={36} color="#16A34A" />
            </View>
            <Text style={styles.successHeading}>₹299 Payment Verified!</Text>
            <Text style={styles.successSub}>
              Tender <Text style={{ fontWeight: '700' }}>MISTRI-26110003</Text> is now published.
              Matching Wave 1 notifications have been dispatched to verified workers in Jaipur (0-5 km).
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setPaymentSuccessModal(false);
                setActiveTab('WORK');
              }}
            >
              <Text style={styles.successBtnText}>View in Work Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WORKER BID MODAL */}
      <Modal visible={bidModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Submit Daily Wage Proposal</Text>
              <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              Applying for: Mason (राजमिस्त्री) • MISTRI-26110001
            </Text>

            <Text style={[styles.stepLabel, { marginTop: 16 }]}>Proposed Daily Wage (₹/day) *</Text>
            <TextInput
              style={styles.textInputBox}
              value={bidWorkerWage}
              onChangeText={setBidWorkerWage}
              keyboardType="numeric"
            />

            <Text style={[styles.stepLabel, { marginTop: 14 }]}>Cover Message / Experience *</Text>
            <TextInput
              style={[styles.textInputBox, { height: 90 }]}
              multiline
              placeholder="8 years experience in brickwork and tile laying in Jaipur."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={[styles.modalNextBtn, { marginTop: 22 }]}
              onPress={() => {
                setBidModalVisible(false);
                Alert.alert(
                  'Bid Submitted! ✅',
                  'Your proposed wage of ₹' + bidWorkerWage + '/day was submitted to customer Ramesh Sharma.'
                );
              }}
            >
              <Text style={styles.modalNextBtnText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WRITE REVIEW MODAL */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Rate Worker Performance</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              Worker: Rajesh Kumar (Mason) • Bathroom Renovation
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginVertical: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                  <Star
                    size={32}
                    color="#F59E0B"
                    fill={star <= selectedRating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.stepLabel}>Review Comment *</Text>
            <TextInput
              style={[styles.textInputBox, { height: 95 }]}
              multiline
              placeholder="Share your experience regarding punctuality, masonry quality, and behaviour..."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={[styles.modalNextBtn, { marginTop: 22 }]}
              onPress={() => {
                setReviewModalVisible(false);
                Alert.alert('Review Submitted! ⭐', 'Thank you for building trusted worker reputation.');
              }}
            >
              <Text style={styles.modalNextBtnText}>Publish Verified Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// STYLESHEET (Refined Apple Aesthetics: Thin, Legible Fonts, Ample Breathing Room)
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 1. Top App Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 0.8,
    borderBottomColor: '#F1F5F9',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingSub: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  greetingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '400',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPillBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#E0E7FF',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  notifCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  // 2. Floating Bottom Navigation Dock (Apple-Like Capsule with Bottom Margin & Padding)
  bottomNavContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  floatingNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0.8,
    borderColor: '#F1F5F9',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    minWidth: 54,
  },
  navItemActive: {
    backgroundColor: '#0F172A',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  navCenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // 3. Dark Hero Card
  heroCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroSubText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroMainText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  heroProjectName: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '400',
  },
  heroWhitePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroWhitePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '400',
  },
  heroDivider: {
    width: 0.8,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroActionBtn: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    gap: 6,
    paddingHorizontal: 8,
  },
  heroActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  // 4. Search & Filter Bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '400',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 5. Section Headers
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSeeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // Categories Scroll
  catScroll: {
    gap: 10,
  },
  catCard: {
    width: 104,
    height: 110,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 0.8,
  },
  catCardName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  catCardCount: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },

  // 6. Current Tracking Card
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  trackingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trackingLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '400',
  },
  trackingCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  statusPillBlue: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPillBlueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  projectInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F1F5F9',
  },
  projectInfoLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '400',
  },
  projectInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  projectInfoDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },

  // Stepper Timeline: Perfect Mathematical Center Alignment
  stepperContainer: {
    marginTop: 18,
    position: 'relative',
    paddingHorizontal: 6,
  },
  connectorTrack: {
    position: 'absolute',
    top: 12, // Centers exactly with 24dp node circles
    left: 32,
    right: 32,
    height: 2,
    flexDirection: 'row',
  },
  connectorSegment: {
    flex: 1,
    height: 2,
  },
  connectorDone: {
    backgroundColor: '#0F172A',
  },
  connectorPending: {
    backgroundColor: '#E2E8F0',
  },
  nodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 68,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  nodeCircleDone: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  nodeCircleActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  nodeCirclePending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  nodePulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  nodePendingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  nodeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 6,
    textAlign: 'center',
  },
  nodeSub: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 1,
    textAlign: 'center',
  },

  manageTenderBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  manageTenderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // 7. Top Verified Workers Nearby
  workerCardOrganized: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  workerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  workerNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  workerSkillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 1,
  },
  workerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  workerRatingNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  workerReviewsCount: {
    fontSize: 10,
    color: '#8E8E93',
  },
  wageTag: {
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  wageTagLabel: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '400',
  },
  wageTagAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  metaChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  workerSpecialtiesText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 15,
  },
  workerCardBottom: {
    marginTop: 12,
  },
  hireWorkerBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hireWorkerBtnSelected: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  hireWorkerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 8. Persona Switcher Card
  personaSwitchBox: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    padding: 18,
  },
  personaSwitchTop: {
    marginBottom: 12,
  },
  personaBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  personaBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  personaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personaDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 16,
    fontWeight: '400',
  },
  switchPersonaBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  switchPersonaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 9. Work Detail & Matrix
  pageHeaderPad: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  pageMainHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubHeading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
    fontWeight: '400',
  },
  projectDetailCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    padding: 18,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  projectDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  projectDetailLoc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '400',
  },
  vacancyMatrixBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  vacancyMatrixHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  vacancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#E2E8F0',
  },
  vacancySkillTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  vacancyCounts: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },
  vacancyBadgeYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vacancyBadgeYellowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  workUpdatesLog: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 0.8,
    borderTopColor: '#F1F5F9',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderLeftWidth: 1.5,
    borderLeftColor: '#E2E8F0',
    marginLeft: 6,
    paddingLeft: 10,
  },
  logCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -21,
    marginTop: 2,
  },
  logTime: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  logDesc: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '400',
    marginTop: 1,
    lineHeight: 16,
  },
  projectActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  projectPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  projectPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  projectSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  projectSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // 10. Reviews Tab
  scoreOverviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  scoreBigCol: {
    alignItems: 'center',
    paddingRight: 18,
    borderRightWidth: 0.8,
    borderRightColor: '#E2E8F0',
  },
  scoreBigNumber: {
    fontSize: 38,
    fontWeight: '700',
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 3,
  },
  scoreBasedText: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 3,
    fontWeight: '400',
  },
  scoreBarsCol: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748B',
    width: 60,
    fontWeight: '400',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  barScore: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F172A',
    width: 22,
  },
  writeReviewBannerBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 6,
  },
  writeReviewBannerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revCustomerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  revWorkerName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '400',
  },
  revDate: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '400',
  },
  revComment: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 8,
    fontWeight: '400',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
  },

  // 11. Profile & Settings
  profileUserCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  profilePhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },
  roleTagPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleTagPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4F46E5',
  },
  settingsBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 6,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  settingsIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingsSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '400',
  },
  settingsDivider: {
    height: 0.8,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  statusPillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillGreenText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  langPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // 12. Auth Screen
  authContainer: {
    padding: 24,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  authTagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '400',
  },
  devBypassCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    marginTop: 28,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    width: '100%',
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
  phoneInputBox: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '400',
  },
  sendOtpBtn: {
    backgroundColor: '#0F172A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  sendOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCardLarge: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 34,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalStepBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 2,
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    paddingVertical: 4,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  textInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '400',
  },
  gpsConfirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 14,
    borderRadius: 16,
    marginTop: 12,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  counterSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '400',
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepperNum: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },
  summaryReviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  summaryReviewHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  summaryLine: {
    fontSize: 13,
    color: '#0F172A',
    marginTop: 8,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 0.8,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalPrevBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalPrevBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalNextBtn: {
    flex: 2,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalNextBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Success Dialog Card
  successDialogCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '400',
  },
  successBtn: {
    backgroundColor: '#0F172A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  successBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
