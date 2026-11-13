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
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Home,
  Briefcase,
  Plus,
  Star,
  User,
  Bell,
  Search,
  Filter,
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
  Phone,
  MessageSquare,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// 1. Multilingual Dictionary (English, Hindi, Gujarati, Marathi)
const I18N = {
  en: {
    appName: 'MISTRI PRO',
    tagline: 'Skilled Hands. Trusted Work.',
    hello: 'Hello',
    location: 'Jaipur, Rajasthan',
    activeProject: 'Active Project',
    postRequirement: 'Post Requirement',
    trackShipping: 'Track Site Progress',
    searchPlaceholder: 'Search masons, carpenters, plumbers...',
    currentTracking: 'Current Work Progress',
    trackingId: 'Tender ID',
    statusInTransit: 'Work In Progress',
    recentActivities: 'Top Verified Workers Nearby',
    seeAll: 'See all',
    vacanciesLeft: 'vacancies left',
    bidNow: 'View & Apply',
    selectWorker: 'Select Worker',
    hired: 'Hired',
    balance: 'Total Recorded Earnings',
    topUp: 'Ledger',
    findJobs: 'Find Nearby Jobs',
    trackBids: 'Track My Bids',
    weeklyStatus: 'Weekly Site Performance',
    hoursWorked: '36 hrs',
    homeTab: 'Home',
    workTab: 'Work',
    postTab: 'Post',
    reviewTab: 'Reviews',
    profileTab: 'Profile',
    customerRole: 'Customer',
    workerRole: 'Worker (मिस्त्री)',
    switchRole: 'Switch Persona',
    verifiedBadge: 'KYC Verified',
  },
  hi: {
    appName: 'मिस्त्री प्रो',
    tagline: 'कुशल हाथ। विश्वसनीय कार्य।',
    hello: 'नमस्ते',
    location: 'जयपुर, राजस्थान',
    activeProject: 'सक्रिय कार्य',
    postRequirement: '+ नया काम पोस्ट करें',
    trackShipping: 'साइट प्रगति देखें',
    searchPlaceholder: 'कारीगर, बढ़ई, प्लंबर खोजें...',
    currentTracking: 'चल रही कार्य प्रगति',
    trackingId: 'टेंडर आईडी',
    statusInTransit: 'कार्य प्रगति पर',
    recentActivities: 'सत्यापित नजदीकी कारीगर',
    seeAll: 'सभी देखें',
    vacanciesLeft: 'पद रिक्त',
    bidNow: 'आवेदन करें',
    selectWorker: 'कारीगर चुनें',
    hired: 'चयनित',
    balance: 'कुल दर्ज कमाई',
    topUp: 'लेजर',
    findJobs: 'आसपास काम खोजें',
    trackBids: 'मेरे आवेदन',
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
  },
  gu: {
    appName: 'મિસ્ત્રી પ્રો',
    tagline: 'કુશળ હાથ. વિશ્વસનીય કામ.',
    hello: 'નમસ્તે',
    location: 'જયપુર, રાજસ્થાન',
    activeProject: 'ચાલુ પ્રોજેક્ટ',
    postRequirement: '+ કામ પોસ્ટ કરો',
    trackShipping: 'કામની પ્રગતિ',
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
  },
  mr: {
    appName: 'मिस्त्री प्रो',
    tagline: 'कुशल हात. विश्वासार्ह काम.',
    hello: 'नमस्कार',
    location: 'जयपूर, राजस्थान',
    activeProject: 'सक्रिय प्रकल्प',
    postRequirement: '+ काम पोस्ट करा',
    trackShipping: 'प्रगती तपासा',
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
  },
};

const CATEGORIES = [
  { id: '1', name: 'Mason\nराजमिस्त्री', icon: '🧱', count: '32 nearby', bg: '#EFF6FF' },
  { id: '2', name: 'Labour\nमजदूर', icon: '👷', count: '54 nearby', bg: '#FEF3C7' },
  { id: '3', name: 'Carpenter\nबढ़ई', icon: '🪚', count: '18 nearby', bg: '#FDF2F8' },
  { id: '4', name: 'Plumber\nप्लंबर', icon: '🔧', count: '21 nearby', bg: '#F0FDF4' },
  { id: '5', name: 'Electrician\nइलेक्ट्रीशियन', icon: '⚡', count: '29 nearby', bg: '#FFFBEB' },
  { id: '6', name: 'Tiles\nफ्लोरिंग', icon: '◻️', count: '14 nearby', bg: '#F5F3FF' },
  { id: '7', name: 'Painter\nपेंटर', icon: '🎨', count: '25 nearby', bg: '#F1F5F9' },
  { id: '8', name: 'False Ceiling\nपीओपी', icon: '🏛️', count: '11 nearby', bg: '#FEF2F2' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME'); // HOME, WORK, POST, REVIEWS, PROFILE
  const [role, setRole] = useState('CUSTOMER'); // CUSTOMER vs WORKER
  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Top App Bar (Victogramm / Fionix reference)
  const renderTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.userProfileRow}>
        <Image
          source={require('./assets/logo.png')}
          style={{ width: 38, height: 38, borderRadius: 12, marginRight: 10 }}
        />
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
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.greetingText}>
            {t.hello}, <Text style={styles.userNameText}>{role === 'CUSTOMER' ? 'RAMESH' : 'RAJESH'}</Text>
          </Text>
          <View style={styles.locationPill}>
            <MapPin size={11} color="#6366F1" />
            <Text style={styles.locationText}>{t.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.topRightActions}>
        <TouchableOpacity style={styles.langPill} onPress={toggleLang}>
          <Text style={styles.langPillText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roleToggleBadge}
          onPress={toggleRole}
          activeOpacity={0.8}
        >
          <Text style={styles.roleToggleText}>
            {role === 'CUSTOMER' ? '👷 Worker' : '🏠 Customer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCircleBtn}>
          <Bell size={18} color="#0F172A" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Bottom Floating Dock Menu Navigation (Victogramm Reference 1)
  const renderBottomDock = () => (
    <View style={styles.dockContainer}>
      <View style={styles.dockBar}>
        {/* 1. HOME TAB */}
        <TouchableOpacity
          style={[styles.dockItem, activeTab === 'HOME' && styles.dockItemActive]}
          onPress={() => setActiveTab('HOME')}
        >
          <Home
            size={20}
            color={activeTab === 'HOME' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'HOME' ? 2.5 : 2}
          />
          {activeTab === 'HOME' && <Text style={styles.dockLabelActive}>{t.homeTab}</Text>}
        </TouchableOpacity>

        {/* 2. WORK / PROJECTS TAB */}
        <TouchableOpacity
          style={[styles.dockItem, activeTab === 'WORK' && styles.dockItemActive]}
          onPress={() => setActiveTab('WORK')}
        >
          <Briefcase
            size={20}
            color={activeTab === 'WORK' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'WORK' ? 2.5 : 2}
          />
          {activeTab === 'WORK' && <Text style={styles.dockLabelActive}>{t.workTab}</Text>}
        </TouchableOpacity>

        {/* 3. POST / TENDER CENTER ACTION */}
        <TouchableOpacity
          style={styles.dockCenterBtn}
          onPress={() => {
            setPostStep(1);
            setPostModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* 4. REVIEWS TAB */}
        <TouchableOpacity
          style={[styles.dockItem, activeTab === 'REVIEWS' && styles.dockItemActive]}
          onPress={() => setActiveTab('REVIEWS')}
        >
          <Star
            size={20}
            color={activeTab === 'REVIEWS' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'REVIEWS' ? 2.5 : 2}
          />
          {activeTab === 'REVIEWS' && <Text style={styles.dockLabelActive}>{t.reviewTab}</Text>}
        </TouchableOpacity>

        {/* 5. PROFILE TAB */}
        <TouchableOpacity
          style={[styles.dockItem, activeTab === 'PROFILE' && styles.dockItemActive]}
          onPress={() => setActiveTab('PROFILE')}
        >
          <User
            size={20}
            color={activeTab === 'PROFILE' ? '#FFFFFF' : '#64748B'}
            strokeWidth={activeTab === 'PROFILE' ? 2.5 : 2}
          />
          {activeTab === 'PROFILE' && <Text style={styles.dockLabelActive}>{t.profileTab}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  // TAB 1: HOME SCREEN (Customer & Worker)
  const renderHomeScreen = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Sleek Dark Hero Card (Victogramm / Fionix reference) */}
      <View style={styles.heroCard}>
        {role === 'CUSTOMER' ? (
          <>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroSubText}>{t.activeProject}</Text>
                <Text style={styles.heroMainText}>MISTRI-26110001</Text>
              </View>
              <TouchableOpacity
                style={styles.heroWhitePill}
                onPress={() => {
                  setPostStep(1);
                  setPostModalVisible(true);
                }}
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
                <Text style={styles.heroStatLabel}>Project Budget</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: '#4ADE80' }]}>₹299 Paid</Text>
                <Text style={styles.heroStatLabel}>Listing Fee</Text>
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => {
                  setPostStep(1);
                  setPostModalVisible(true);
                }}
              >
                <Plus size={16} color="#0F172A" />
                <Text style={styles.heroActionText}>{t.postRequirement}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                onPress={() => setActiveTab('WORK')}
              >
                <TrendingUp size={16} color="#FFFFFF" />
                <Text style={[styles.heroActionText, { color: '#FFFFFF' }]}>{t.trackShipping}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroSubText}>{t.balance}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.heroMainText}>₹28,500.00</Text>
                  <Eye size={18} color="#94A3B8" />
                </View>
              </View>
              <TouchableOpacity style={styles.heroWhitePill} onPress={() => setActiveTab('WORK')}>
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
                <Text style={[styles.heroStatValue, { color: '#4ADE80' }]}>4.9 ★</Text>
                <Text style={styles.heroStatLabel}>Reputation</Text>
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity style={styles.heroActionBtn} onPress={() => setActiveTab('WORK')}>
                <Search size={16} color="#0F172A" />
                <Text style={styles.heroActionText}>{t.findJobs}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroActionBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                onPress={() => setActiveTab('WORK')}
              >
                <Briefcase size={16} color="#FFFFFF" />
                <Text style={[styles.heroActionText, { color: '#FFFFFF' }]}>{t.trackBids}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Clean Search Bar with Filter (Victogramm Reference 1) */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#64748B" />
          <TextInput
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <SlidersHorizontal size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Service Categories (Clean Tiles with icons) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <TouchableOpacity onPress={() => setActiveTab('WORK')}>
            <Text style={styles.sectionSeeAll}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catCardNew, { backgroundColor: c.bg }]}
              onPress={() => {
                setPostStep(1);
                setPostModalVisible(true);
              }}
            >
              <Text style={{ fontSize: 26 }}>{c.icon}</Text>
              <Text style={styles.catCardName}>{c.name}</Text>
              <Text style={styles.catCardCount}>{c.count}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Live Work Tracking Progress (Directly inspired by Reference 1 - Current Tracking) */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.currentTracking}</Text>
          <TouchableOpacity onPress={() => setActiveTab('WORK')}>
            <Text style={styles.sectionSeeAll}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackingCard}>
          <View style={styles.trackingTop}>
            <View>
              <Text style={styles.trackingLabel}>{t.trackingId}:</Text>
              <Text style={styles.trackingCode}>MISTRI-26110001</Text>
            </View>
            <View style={styles.statusPillBlue}>
              <Text style={styles.statusPillBlueText}>{t.statusInTransit}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLabel}>Project</Text>
              <Text style={styles.routeName}>Bathroom Renovation</Text>
              <Text style={styles.routeDate}>16 Nov 2026</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.routeLabel}>Site Location</Text>
              <Text style={styles.routeName}>Vaishali Nagar, Jaipur</Text>
              <Text style={styles.routeDate}>30 Days Duration</Text>
            </View>
          </View>

          {/* Stepper Timeline (Reference 1) */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleDone]}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.timelineStepLabel}>Posted</Text>
              <Text style={styles.timelineStepTime}>₹299 Paid</Text>
            </View>

            <View style={[styles.timelineLine, styles.timelineLineDone]} />

            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleDone]}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.timelineStepLabel}>Matched</Text>
              <Text style={styles.timelineStepTime}>Wave 1 (0-5km)</Text>
            </View>

            <View style={[styles.timelineLine, styles.timelineLineDone]} />

            <View style={styles.timelineStep}>
              <View style={[styles.timelineCircle, styles.timelineCircleActive]}>
                <View style={styles.timelineInnerDot} />
              </View>
              <Text style={[styles.timelineStepLabel, { color: '#6366F1', fontWeight: 'bold' }]}>
                In Work
              </Text>
              <Text style={styles.timelineStepTime}>3 of 4 Hired</Text>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineStep}>
              <View style={styles.timelineCircle}>
                <View style={styles.timelineEmptyDot} />
              </View>
              <Text style={styles.timelineStepLabel}>Complete</Text>
              <Text style={styles.timelineStepTime}>Approval</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.trackDetailsBtn} onPress={() => setActiveTab('WORK')}>
            <Text style={styles.trackDetailsBtnText}>View Requirement Vacancies & Manage →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Verified Workers Nearby / Applications */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t.recentActivities}</Text>
          <TouchableOpacity onPress={() => setActiveTab('WORK')}>
            <Text style={styles.sectionSeeAll}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        {[
          {
            id: '1',
            name: 'Rajesh Kumar',
            skill: 'Mason (राजमिस्त्री)',
            exp: '8 Years Exp',
            dist: '4.5 km away',
            wage: '₹900/day',
            rating: '4.9',
            reviews: '84',
            img: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156b?w=200',
          },
          {
            id: '2',
            name: 'Mohan Lal Suthar',
            skill: 'Carpenter (बढ़ई)',
            exp: '12 Years Exp',
            dist: '6.0 km away',
            wage: '₹1,100/day',
            rating: '4.8',
            reviews: '62',
            img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200',
          },
          {
            id: '3',
            name: 'Suresh Gurjar',
            skill: 'Construction Labour (मजदूर)',
            exp: '5 Years Exp',
            dist: '2.8 km away',
            wage: '₹600/day',
            rating: '5.0',
            reviews: '41',
            img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200',
          },
        ].map((worker) => {
          const isSelected = selectedWorkers.includes(worker.name);
          return (
            <View key={worker.id} style={styles.workerListItem}>
              <Image source={{ uri: worker.img }} style={styles.workerThumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <ShieldCheck size={14} color="#16A34A" />
                </View>
                <Text style={styles.workerSkill}>{worker.skill}</Text>
                <View style={styles.workerMetaRow}>
                  <Text style={styles.workerMeta}>{worker.exp}</Text>
                  <Text style={styles.workerMeta}>•</Text>
                  <Text style={styles.workerMeta}>📍 {worker.dist}</Text>
                  <Text style={styles.workerMeta}>•</Text>
                  <Text style={styles.workerRating}>★ {worker.rating}</Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.workerWage}>{worker.wage}</Text>
                {role === 'CUSTOMER' ? (
                  <TouchableOpacity
                    style={[styles.actionPillBtn, isSelected && styles.actionPillBtnSelected]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedWorkers(selectedWorkers.filter((w) => w !== worker.name));
                      } else {
                        setSelectedWorkers([...selectedWorkers, worker.name]);
                        Alert.alert('Worker Hired! 🎉', `${worker.name} assigned to MISTRI-26110001.`);
                      }
                    }}
                  >
                    <Text style={[styles.actionPillBtnText, isSelected && { color: '#16A34A' }]}>
                      {isSelected ? '✓ ' + t.hired : t.selectWorker}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionPillBtn}
                    onPress={() => setBidModalVisible(true)}
                  >
                    <Text style={styles.actionPillBtnText}>{t.bidNow}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  // TAB 2: WORK SCREEN (Projects & Tenders Vacancy Matrix & Timeline)
  const renderWorkScreen = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
      <View style={styles.pageHeaderPad}>
        <Text style={styles.pageMainHeading}>Project Management & Work Tenders</Text>
        <Text style={styles.pageSubHeading}>
          Track requirements, vacancies, site visits, and completion approvals.
        </Text>
      </View>

      {/* Project Card with Vacancies Breakdown */}
      <View style={styles.projectDetailCard}>
        <View style={styles.trackingTop}>
          <View>
            <Text style={styles.trackingLabel}>Tender ID</Text>
            <Text style={styles.trackingCode}>MISTRI-26110001</Text>
          </View>
          <View style={styles.statusPillBlue}>
            <Text style={styles.statusPillBlueText}>IN PROGRESS</Text>
          </View>
        </View>

        <Text style={styles.projectDetailTitle}>Residential Bathroom Renovation & Plastering</Text>
        <Text style={styles.projectDetailLoc}>📍 Plot 42, Officers Campus, Sirsi Road, Jaipur</Text>

        <View style={styles.vacancyMatrixBox}>
          <Text style={styles.vacancyMatrixHeading}>VACANCY MATRIX</Text>

          {/* Mason Vacancy */}
          <View style={styles.vacancyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vacancySkillTitle}>Mason (राजमिस्त्री)</Text>
              <Text style={styles.vacancyCounts}>3 Required • 2 Hired • 1 Remaining</Text>
            </View>
            <View style={styles.vacancyBadgeYellow}>
              <Text style={styles.vacancyBadgeYellowText}>1 Vacancy Open</Text>
            </View>
          </View>

          {/* Labour Vacancy */}
          <View style={[styles.vacancyRow, { borderBottomWidth: 0, marginTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vacancySkillTitle}>Construction Labour (मजदूर)</Text>
              <Text style={styles.vacancyCounts}>5 Required • 1 Hired • 4 Remaining</Text>
            </View>
            <View style={styles.vacancyBadgeYellow}>
              <Text style={styles.vacancyBadgeYellowText}>4 Vacancies Open</Text>
            </View>
          </View>
        </View>

        {/* Work Progress Log (Inspired by Reference 1 - Delivery Details & Updates) */}
        <View style={styles.workUpdatesLog}>
          <Text style={styles.vacancyMatrixHeading}>ON-SITE ACTIVITY TIMELINE</Text>

          <View style={styles.logItem}>
            <View style={styles.logCheck}>
              <Check size={12} color="#16A34A" strokeWidth={3} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.logTime}>09:30 AM • 16 Nov</Text>
              <Text style={styles.logDesc}>Rajesh Kumar (Mason) checked in on-site & began floor leveling.</Text>
            </View>
          </View>

          <View style={styles.logItem}>
            <View style={styles.logCheck}>
              <Check size={12} color="#16A34A" strokeWidth={3} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.logTime}>01:15 PM • 16 Nov</Text>
              <Text style={styles.logDesc}>Wall plastering completed. 2 site inspection photos uploaded.</Text>
            </View>
          </View>

          <View style={[styles.logItem, { borderLeftWidth: 0 }]}>
            <View style={[styles.logCheck, { backgroundColor: '#EEF2FF', borderColor: '#6366F1' }]}>
              <Clock size={12} color="#6366F1" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.logTime}>04:30 PM • 16 Nov</Text>
              <Text style={styles.logDesc}>Vitrified tile laying in progress. Awaiting customer sign-off.</Text>
            </View>
          </View>
        </View>

        <View style={styles.projectActionsGrid}>
          <TouchableOpacity
            style={styles.projectPrimaryBtn}
            onPress={() => {
              Alert.alert('Site Visit Requested', 'Visit proposal sent to Rajesh Kumar for 17 Nov, 10:00 AM.');
            }}
          >
            <Calendar size={16} color="#FFFFFF" />
            <Text style={styles.projectPrimaryBtnText}>Schedule Site Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.projectSecondaryBtn}
            onPress={() => {
              Alert.alert('Work Approved! ✅', 'Task closed successfully. You can now submit a verified review.');
              setActiveTab('REVIEWS');
            }}
          >
            <ThumbsUp size={16} color="#0F172A" />
            <Text style={styles.projectSecondaryBtnText}>Approve Completion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // TAB 3: REVIEWS & REPUTATION SCREEN
  const renderReviewsScreen = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
      <View style={styles.pageHeaderPad}>
        <Text style={styles.pageMainHeading}>Ratings & Worker Reputation</Text>
        <Text style={styles.pageSubHeading}>
          Verified customer feedback and workmanship ratings for completed tasks.
        </Text>
      </View>

      {/* Overall Score Card */}
      <View style={styles.scoreOverviewCard}>
        <View style={styles.scoreBigCol}>
          <Text style={styles.scoreBigNumber}>4.9</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} color="#F59E0B" fill="#F59E0B" />
            ))}
          </View>
          <Text style={styles.scoreBasedText}>148 Verified Jobs</Text>
        </View>

        <View style={styles.scoreBarsCol}>
          <View style={styles.barItem}>
            <Text style={styles.barLabel}>Work Quality</Text>
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

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <TouchableOpacity
          style={styles.writeReviewBannerBtn}
          onPress={() => setReviewModalVisible(true)}
        >
          <Star size={18} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.writeReviewBannerBtnText}>+ Rate & Review a Completed Job</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
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

  // TAB 4: PROFILE & SETTINGS SCREEN
  const renderProfileScreen = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
      <View style={styles.pageHeaderPad}>
        <Text style={styles.pageMainHeading}>Account & Preferences</Text>
        <Text style={styles.pageSubHeading}>
          Manage verified identity, language preference, and switch roles.
        </Text>
      </View>

      {/* User Card */}
      <View style={styles.profileUserCard}>
        <Image
          source={require('./assets/logo.png')}
          style={{ width: 64, height: 64, borderRadius: 20 }}
        />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.profileName}>{role === 'CUSTOMER' ? 'Ramesh Sharma' : 'Rajesh Kumar'}</Text>
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

      {/* Switch Persona Card */}
      <View style={styles.sectionWrap}>
        <View style={styles.settingsBlock}>
          <TouchableOpacity style={styles.settingsRow} onPress={toggleRole}>
            <View style={styles.settingsIconBox}>
              <RotateCcw size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.settingsTitle}>Switch to {role === 'CUSTOMER' ? 'Worker Persona' : 'Customer Persona'}</Text>
              <Text style={styles.settingsSub}>Currently active: {role === 'CUSTOMER' ? 'Customer (Hiring)' : 'Worker (Bidding)'}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          {/* Language Selector */}
          <TouchableOpacity style={styles.settingsRow} onPress={toggleLang}>
            <View style={styles.settingsIconBox}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.settingsTitle}>Change App Language</Text>
              <Text style={styles.settingsSub}>Current: {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : lang === 'gu' ? 'ગુજરાતી (Gujarati)' : 'मराठी (Marathi)'}</Text>
            </View>
            <View style={styles.langPill}>
              <Text style={styles.langPillText}>TAP TO TOGGLE</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          {/* KYC Status Details */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconBox}>
              <ShieldCheck size={20} color="#16A34A" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.settingsTitle}>Govt ID & Verification Status</Text>
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
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.settingsTitle}>Platform Request Listing Fees (₹299)</Text>
              <Text style={styles.settingsSub}>Razorpay Order: order_mp_26110001 (Paid)</Text>
            </View>
            <ArrowUpRight size={18} color="#94A3B8" />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.rootContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* Global Top App Bar */}
        {renderTopBar()}

        {/* Main Content Area Based on Active Tab */}
        <View style={{ flex: 1 }}>
          {activeTab === 'HOME' && renderHomeScreen()}
          {activeTab === 'WORK' && renderWorkScreen()}
          {activeTab === 'REVIEWS' && renderReviewsScreen()}
          {activeTab === 'PROFILE' && renderProfileScreen()}
        </View>

        {/* Floating Bottom Dock Navigation */}
        {renderBottomDock()}

        {/* 6-STEP TENDER CREATION MODAL WITH ₹299 RAZORPAY SUMMARY */}
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
                {/* Step 1: Title & Description */}
                {postStep === 1 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Project Title *</Text>
                    <TextInput
                      style={styles.textInputBox}
                      value={tenderTitle}
                      onChangeText={setTenderTitle}
                    />
                    <Text style={[styles.stepLabel, { marginTop: 12 }]}>Work Description *</Text>
                    <TextInput
                      style={[styles.textInputBox, { height: 90 }]}
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
                      <MapPin size={20} color="#6366F1" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontWeight: 'bold', color: '#0F172A', fontSize: 13 }}>
                          GPS Coordinates Attached
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                          Jaipur (26.9124° N, 75.7873° E) • Matching Waves 0-5 km
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Step 3: Vacancies Counter */}
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

                    <View style={[styles.counterRow, { marginTop: 12 }]}>
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
                    <Text style={[styles.stepLabel, { marginTop: 12 }]}>Expected Duration</Text>
                    <TextInput style={styles.textInputBox} placeholder="e.g. 30 days" />
                  </View>
                )}

                {/* Step 5: Contact Coordinates */}
                {postStep === 5 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Customer Contact Name *</Text>
                    <TextInput style={styles.textInputBox} placeholder="Ramesh Sharma" />
                    <Text style={[styles.stepLabel, { marginTop: 12 }]}>Verified Mobile *</Text>
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
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#0F172A' }}>
                          Platform Request Fee:
                        </Text>
                        <Text style={{ fontWeight: '900', fontSize: 24, color: '#6366F1' }}>
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
                    {postStep === 6 ? 'Pay ₹299 & Publish Tender 💳' : 'Continue →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* PAYMENT SUCCESS CONFIRMATION MODAL */}
        <Modal visible={paymentSuccessModal} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.successDialogCard}>
              <View style={styles.successCircle}>
                <CheckCircle2 size={36} color="#16A34A" />
              </View>
              <Text style={styles.successHeading}>₹299 Payment Verified!</Text>
              <Text style={styles.successSub}>
                Tender <Text style={{ fontWeight: 'bold' }}>MISTRI-26110003</Text> is now published.
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

              <Text style={[styles.stepLabel, { marginTop: 12 }]}>Cover Message / Experience *</Text>
              <TextInput
                style={[styles.textInputBox, { height: 80 }]}
                multiline
                placeholder="8 years experience in brickwork and tile laying in Jaipur."
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                style={[styles.modalNextBtn, { marginTop: 20 }]}
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

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 20 }}>
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
                style={[styles.textInputBox, { height: 90 }]}
                multiline
                placeholder="Share your experience regarding punctuality, masonry quality, and behaviour..."
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                style={[styles.modalNextBtn, { marginTop: 20 }]}
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
    </SafeAreaProvider>
  );
}

// STYLESHEET (Ultra-clean modern aesthetics inspired by Image 1 & Image 2)
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  userProfileRow: {
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
  greetingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
  },
  roleToggleBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  // Dark Hero Card (Inspired by Image 1 & 2)
  heroCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroSubText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  heroMainText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  heroWhitePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  heroWhitePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  heroActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Search & Filter
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Headers & Wraps
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSeeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },

  // Categories Horizontal Scroll
  catScroll: {
    gap: 10,
  },
  catCardNew: {
    width: 100,
    height: 105,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catCardName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  catCardCount: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },

  // Current Tracking Card (Image 1)
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  trackingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trackingLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  trackingCode: {
    fontSize: 15,
    fontWeight: '800',
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
    fontWeight: '800',
    color: '#4F46E5',
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  routeLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  routeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  routeDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Stepper Timeline (Image 1)
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  timelineStep: {
    alignItems: 'center',
    width: 65,
  },
  timelineCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleDone: {
    backgroundColor: '#0F172A',
  },
  timelineCircleActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  timelineInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  timelineEmptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: -4,
    marginBottom: 24,
  },
  timelineLineDone: {
    backgroundColor: '#0F172A',
  },
  timelineStepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 6,
    textAlign: 'center',
  },
  timelineStepTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
    textAlign: 'center',
  },
  trackDetailsBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trackDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // Workers List
  workerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  workerThumb: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  workerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  workerSkill: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  workerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  workerMeta: {
    fontSize: 10,
    color: '#94A3B8',
  },
  workerRating: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  workerWage: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionPillBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionPillBtnSelected: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  actionPillBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Floating Bottom Dock (Reference 1 & 2)
  dockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  dockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 6,
  },
  dockItemActive: {
    backgroundColor: '#0F172A',
  },
  dockLabelActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dockCenterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // Page Header Pad
  pageHeaderPad: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pageMainHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  pageSubHeading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },

  // Project Detail Card (Work Screen)
  projectDetailCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  projectDetailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  projectDetailLoc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  vacancyMatrixBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vacancyMatrixHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  vacancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  vacancySkillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  vacancyCounts: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  vacancyBadgeYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vacancyBadgeYellowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },

  // Work Updates Log
  workUpdatesLog: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
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
    marginLeft: -19,
    marginTop: 2,
  },
  logTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  logDesc: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
    marginTop: 1,
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#4F46E5',
  },

  // Reviews Screen
  scoreOverviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scoreBigCol: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  scoreBigNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  scoreBasedText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
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
    width: 65,
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
    fontWeight: '700',
    color: '#0F172A',
    width: 20,
  },
  writeReviewBannerBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  writeReviewBannerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revCustomerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  revWorkerName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  revDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },
  revComment: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 10,
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
    fontWeight: '600',
    color: '#475569',
  },

  // Profile Screen
  profileUserCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileBigAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profilePhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    fontWeight: '800',
    color: '#4F46E5',
  },
  settingsBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  settingsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingsSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settingsDivider: {
    height: 1,
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
    fontWeight: '800',
    color: '#15803D',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCardLarge: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalStepBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
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
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  textInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  counterSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
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
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },
  summaryReviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryReviewHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  summaryLine: {
    fontSize: 13,
    color: '#0F172A',
    marginTop: 8,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
    fontWeight: '700',
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
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Success Dialog Card
  successDialogCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
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
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
