import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import LottieView from 'lottie-react-native';
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
  Sparkles,
  ArrowRight,
  UserPlus,
  Hammer,
  Wrench,
  Paintbrush,
  Zap,
  Droplet,
  HelpCircle,
  FileText,
  DollarSign,
  Award,
  Layers,
  ChevronDown,
  Smartphone,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ==========================================
// 1. MULTILINGUAL TRANSLATION DICTIONARY
// ==========================================
const I18N = {
  en: {
    appName: 'MISTRI PRO',
    tagline: 'Skilled Hands. Trusted Work.',
    chooseLanguage: 'Choose Your Language',
    selectLangSub: 'Select your preferred language to continue',
    continueBtn: 'Continue',
    signInTitle: 'Sign in to continue',
    signInSub: 'Please try one of the following ways to register or log in to your account.',
    continueOTP: 'Continue with Mobile OTP',
    continueGoogle: 'Continue with Google',
    devLogin: '⚡ Dev Test Login (abc / 1234)',
    termsNotice: 'By continuing, you confirm that you have read and agreed to the Terms of Service and consent to the Privacy Policy.',
    chooseRoleTitle: 'Choose your role',
    chooseRoleSub: 'How would you like to use MISTRI PRO today?',
    customerRole: 'Customer',
    customerDesc: 'Post requirements, get competitive bids, and hire verified skilled mistris.',
    workerRole: 'Worker / Mistri',
    workerDesc: 'Discover high-paying construction jobs, submit tenders, and build your verified reputation.',
    hello: 'Hello,',
    activeReqCard: 'Manage your tasks',
    activeReqCount: '6/10',
    activeReqSub: 'Kindly assign all your new task asap.',
    upcomingTask: 'Upcoming Task',
    assignedTask: 'Assigned Task',
    pendingDiscussion: 'Pending On Discussion',
    almostDone: 'Almost to be done',
    services: 'Popular Categories',
    topWorkers: 'Top Verified Workers',
    seeAll: 'See all',
    searchPlaceholder: 'Search services, workers, tenders...',
    home: 'Home',
    work: 'Work',
    reviews: 'Reviews',
    profile: 'Profile',
    postRequirement: 'Post Requirement',
    logout: 'Log Out',
    switchRole: 'Switch Mode',
    currentMode: 'Current Persona',
    verifiedKYC: 'Verified KYC',
    settings: 'Settings',
    manageProfile: 'Manage profile',
    customizeExp: 'Customize my experience',
    notifications: 'Manage notifications',
    faq: 'FAQ & Help Center',
    manageSub: 'Payment & Receipts',
    reportBug: 'Report a bug / Dispute',
    ratingsReviews: 'Ratings & Reviews',
    applyNow: 'Apply Now',
    hireWorker: 'Hire Worker',
    experience: 'yrs exp',
    dailyRate: '/ day',
    taskOverview: 'Task Overview',
    newTaskCount: 'You have 6 new tasks for this week',
    workingStatus: 'Working Status',
    overallPerformance: 'Overall Performance this week',
    monthlyHours: 'Monthly Working Hours',
  },
  hi: {
    appName: 'मिस्त्री प्रो',
    tagline: 'कुशल हाथ। भरोसेमंद काम।',
    chooseLanguage: 'अपनी भाषा चुनें',
    selectLangSub: 'आगे बढ़ने के लिए अपनी पसंदीदा भाषा चुनें',
    continueBtn: 'आगे बढ़ें',
    signInTitle: 'जारी रखने के लिए साइन इन करें',
    signInSub: 'अपने खाते में लॉग इन करने के लिए कृपया इनमें से कोई एक तरीका चुनें।',
    continueOTP: 'मोबाइल OTP से आगे बढ़ें',
    continueGoogle: 'Google से आगे बढ़ें',
    devLogin: '⚡ देव टेस्ट लॉगिन (abc / 1234)',
    termsNotice: 'जारी रखकर, आप पुष्टि करते हैं कि आपने सेवा की शर्तें और गोपनीयता नीति पढ़ ली हैं।',
    chooseRoleTitle: 'अपनी भूमिका चुनें',
    chooseRoleSub: 'आज आप मिस्त्री प्रो का उपयोग कैसे करना चाहते हैं?',
    customerRole: 'ग्राहक (Customer)',
    customerDesc: 'काम पोस्ट करें, प्रतिस्पर्धी बोलियां प्राप्त करें और प्रमाणित मिस्त्री को नियुक्त करें।',
    workerRole: 'कारीगर / मिस्त्री (Worker)',
    workerDesc: 'आस-पास के काम खोजें, कोटेशन भेजें और अपनी सत्यापित पहचान बनाएं।',
    hello: 'नमस्ते,',
    activeReqCard: 'अपने कार्य प्रबंधित करें',
    activeReqCount: '6/10',
    activeReqSub: 'कृपया अपने नए कार्य जल्द असाइन करें।',
    upcomingTask: 'आगामी कार्य',
    assignedTask: 'असाइन किए कार्य',
    pendingDiscussion: 'चर्चा में लंबित',
    almostDone: 'लगभग पूर्ण',
    services: 'प्रमुख श्रेणियां',
    topWorkers: 'सत्यापित कुशल मिस्त्री',
    seeAll: 'सभी देखें',
    searchPlaceholder: 'सेवाएं, मिस्त्री, टेंडर खोजें...',
    home: 'होम',
    work: 'कार्य',
    reviews: 'समीक्षाएं',
    profile: 'प्रोफाइल',
    postRequirement: 'ज़रूरत पोस्ट करें',
    logout: 'लॉग आउट करें',
    switchRole: 'भूमिका बदलें',
    currentMode: 'वर्तमान मोड',
    verifiedKYC: 'सत्यापित KYC',
    settings: 'सेटिंग्स',
    manageProfile: 'प्रोफ़ाइल प्रबंधित करें',
    customizeExp: 'प्राथमिकताएं बदलें',
    notifications: 'सूचनाएं प्रबंधित करें',
    faq: 'मदद और अक्सर पूछे जाने वाले सवाल',
    manageSub: 'भुगतान और रसीदें',
    reportBug: 'शिकायत या समस्या बताएं',
    ratingsReviews: 'रेटिंग और समीक्षाएं',
    applyNow: 'आवेदन करें',
    hireWorker: 'हायर करें',
    experience: 'वर्ष अनुभव',
    dailyRate: '/ दिन',
    taskOverview: 'कार्य विवरण',
    newTaskCount: 'इस सप्ताह आपके पास 6 नए कार्य हैं',
    workingStatus: 'कार्य स्थिति',
    overallPerformance: 'इस सप्ताह का समग्र प्रदर्शन',
    monthlyHours: 'मासिक कार्य घंटे',
  },
  gu: {
    appName: 'મિશ્ત્રી પ્રો',
    tagline: 'કુશળ હાથ. વિશ્વસનીય કામ.',
    chooseLanguage: 'તમારી ભાષા પસંદ કરો',
    selectLangSub: 'આગળ વધવા માટે તમારી ભાષા પસંદ કરો',
    continueBtn: 'આગળ વધો',
    signInTitle: 'આગળ વધવા માટે સાઇન ઇન કરો',
    signInSub: 'તમારા ખાતામાં લૉગ ઇન કરવા માટે નીચેનામાંથી કોઈ વિકલ્પ પસંદ કરો.',
    continueOTP: 'મોબાઇલ OTP સાથે ચાલુ રાખો',
    continueGoogle: 'Google સાથે ચાલુ રાખો',
    devLogin: '⚡ દેવ ટેસ્ટ લૉગિન (abc / 1234)',
    termsNotice: 'ચાલુ રાખીને, તમે સેવાની શરતો અને ગોપનીયતા નીતિ સાથે સંમત થાઓ છો.',
    chooseRoleTitle: 'તમારી ભૂમિકા પસંદ કરો',
    chooseRoleSub: 'તમે મિશ્ત્રી પ્રોનો ઉપયોગ કેવી રીતે કરવા માંગો છો?',
    customerRole: 'ગ્રાહક (Customer)',
    customerDesc: 'કામ પોસ્ટ કરો, શ્રેષ્ઠ ઑફર મેળવો અને કુશળ કારીગરોને હાયર કરો.',
    workerRole: 'કારીગર / મિસ્ત્રી (Worker)',
    workerDesc: 'નજીકના કામ શોધો, ટેન્ડર ભરો અને વિશ્વસનીય ઓળખ બનાવો.',
    hello: 'નમસ્તે,',
    activeReqCard: 'તમારા કાર્યો મેનેજ કરો',
    activeReqCount: '6/10',
    activeReqSub: 'કૃપા કરીને તમારા નવા કાર્યો ઝડપથી સોંપો.',
    upcomingTask: 'આગામી કાર્ય',
    assignedTask: 'સોંપેલ કાર્ય',
    pendingDiscussion: 'ચર્ચામાં બાકી',
    almostDone: 'લગભગ પૂર્ણ',
    services: 'લોકપ્રિય શ્રેણીઓ',
    topWorkers: 'ટોચના પ્રમાણિત કારીગરો',
    seeAll: 'બધા જુઓ',
    searchPlaceholder: 'સેવાઓ, કારીગરો, ટેન્ડર શોધો...',
    home: 'હોમ',
    work: 'કામ',
    reviews: 'સમીક્ષાઓ',
    profile: 'પ્રોફાઇલ',
    postRequirement: 'જરૂરિયાત પોસ્ટ કરો',
    logout: 'લૉગ આઉટ કરો',
    switchRole: 'રોલ બદલો',
    currentMode: 'વર્તમાન મોડ',
    verifiedKYC: 'વેરિફાઇડ KYC',
    settings: 'સેટિંગ્સ',
    manageProfile: 'પ્રોફાઇલ મેનેજ કરો',
    customizeExp: 'અનુભવ કસ્ટમાઇઝ કરો',
    notifications: 'નોટિફિકેશન મેનેજ કરો',
    faq: 'FAQ અને સહાય',
    manageSub: 'ચુકવણી અને રસીદો',
    reportBug: 'સમસ્યાની જાણ કરો',
    ratingsReviews: 'રેટિંગ્સ અને સમીક્ષાઓ',
    applyNow: 'અરજી કરો',
    hireWorker: 'હાયર કરો',
    experience: 'વર્ષ અનુભવ',
    dailyRate: "/ દિવસ",
    taskOverview: 'કાર્ય ઝાંખી',
    newTaskCount: 'આ અઠવાડિયે તમારી પાસે 6 નવા કાર્યો છે',
    workingStatus: 'કાર્યકારી સ્થિતિ',
    overallPerformance: 'આ અઠવાડિયે એકંદર કામગીરી',
    monthlyHours: 'માસિક કામના કલાકો',
  },
  mr: {
    appName: 'मिस्त्री प्रो',
    tagline: 'कुशल हात. विश्वासार्ह काम.',
    chooseLanguage: 'तुमची भाषा निवडा',
    selectLangSub: 'पुढे जाण्यासाठी तुमची पसंतीची भाषा निवडा',
    continueBtn: 'पुढे चला',
    signInTitle: 'पुढे जाण्यासाठी साइन इन करा',
    signInSub: 'कृपया खात्यात लॉग इन करण्यासाठी खालीलपैकी एक पर्याय निवडा.',
    continueOTP: 'मोबाईल OTP द्वारे पुढे जा',
    continueGoogle: 'Google द्वारे पुढे जा',
    devLogin: '⚡ देव टेस्ट लॉगिन (abc / 1234)',
    termsNotice: 'पुढे जाऊन, आपण सेवेच्या अटी व गोपनीयता धोरणाशी सहमत आहात.',
    chooseRoleTitle: 'तुमची भूमिका निवडा',
    chooseRoleSub: 'आज तुम्हाला मिस्त्री प्रो कशासाठी वापरायचे आहे?',
    customerRole: 'ग्राहक (Customer)',
    customerDesc: 'कामाची आवश्यकता पोस्ट करा, योग्य दर मिळवा आणि कुशल कारागीर नेमा.',
    workerRole: 'कारागीर / मिस्त्री (Worker)',
    workerDesc: 'जवळची कामे शोधा, अर्ज करा आणि आपली विश्वासार्ह ओळख बनवा.',
    hello: 'नमस्कार,',
    activeReqCard: 'आपली कामे व्यवस्थापित करा',
    activeReqCount: '6/10',
    activeReqSub: 'कृपया आपले नवीन काम लवकर नियुक्त करा.',
    upcomingTask: 'आगामी कामे',
    assignedTask: 'सोपवलेली कामे',
    pendingDiscussion: 'चर्चेत प्रलंबित',
    almostDone: 'जवळजवळ पूर्ण',
    services: 'प्रमुख वर्गवारी',
    topWorkers: 'सत्यापित कुशल कारागीर',
    seeAll: 'सर्व पहा',
    searchPlaceholder: 'सेवा, कामगार, टेंडर्स शोधा...',
    home: 'होम',
    work: 'कामे',
    reviews: 'अभिप्राय',
    profile: 'प्रोफाइल',
    postRequirement: 'काम पोस्ट करा',
    logout: 'लॉग आउट करा',
    switchRole: 'भूमिका बदला',
    currentMode: 'सध्याचा मोड',
    verifiedKYC: 'सत्यापित KYC',
    settings: 'सेटिंग्ज',
    manageProfile: 'प्रोफाइल संपादित करा',
    customizeExp: 'अनुभव सानुकूलित करा',
    notifications: 'सूचना व्यवस्थापित करा',
    faq: 'मदत आणि वारंवार विचारले जाणारे प्रश्न',
    manageSub: 'पेमेंट आणि पावत्या',
    reportBug: 'तक्रार नोंदवा',
    ratingsReviews: 'रेटिंग आणि अभिप्राय',
    applyNow: 'अर्ज करा',
    hireWorker: 'नेमणूक करा',
    experience: 'वर्षे अनुभव',
    dailyRate: '/ दिवस',
    taskOverview: 'कामाचे विहंगावलोकन',
    newTaskCount: 'या आठवड्यात आपल्याकडे 6 नवीन कामे आहेत',
    workingStatus: 'कामाची स्थिती',
    overallPerformance: 'या आठवड्यातील एकूण कामगिरी',
    monthlyHours: 'मासिक कामाचे तास',
  },
};

// ==========================================
// 2. MOCK DATA
// ==========================================
const CATEGORIES = [
  { id: '1', name: 'Mason (राजमिस्त्री)', icon: '🧱', workers: 142 },
  { id: '2', name: 'Plumber (प्लंबर)', icon: '🔧', workers: 98 },
  { id: '3', name: 'Electrician (बिजली)', icon: '⚡', workers: 120 },
  { id: '4', name: 'Carpenter (बढ़ई)', icon: '🪚', workers: 84 },
  { id: '5', name: 'Painter (पेंटर)', icon: '🎨', workers: 76 },
  { id: '6', name: 'Tiles & Marble', icon: '🏛️', workers: 65 },
  { id: '7', name: 'Welder / Fabricator', icon: '⚙️', workers: 43 },
];

const TOP_WORKERS = [
  {
    id: 'w1',
    name: 'Ram Singh Mistri',
    skill: 'Master Mason',
    exp: 14,
    rating: 4.9,
    reviews: 84,
    rate: 1100,
    area: 'Vaishali Nagar, Jaipur',
    verified: true,
    avatar: 'RS',
    color: '#5B4EFF',
  },
  {
    id: 'w2',
    name: 'Mukesh Sharma',
    skill: 'Senior Electrician',
    exp: 8,
    rating: 4.8,
    reviews: 62,
    rate: 850,
    area: 'Malviya Nagar, Jaipur',
    verified: true,
    avatar: 'MS',
    color: '#0284C7',
  },
  {
    id: 'w3',
    name: 'Devraj Gurjar',
    skill: 'Lead Plumber',
    exp: 11,
    rating: 4.9,
    reviews: 96,
    rate: 950,
    area: 'Mansarovar, Jaipur',
    verified: true,
    avatar: 'DG',
    color: '#10B981',
  },
  {
    id: 'w4',
    name: 'Pooja Verma',
    skill: 'Interior & Modular',
    exp: 6,
    rating: 5.0,
    reviews: 41,
    rate: 1400,
    area: 'C-Scheme, Jaipur',
    verified: true,
    avatar: 'PV',
    color: '#8B5CF6',
  },
];

const INITIAL_PROJECTS = [
  {
    id: 'P-101',
    title: 'G+2 Residential Villa Construction',
    category: 'Mason (राजमिस्त्री)',
    location: 'Vaishali Nagar, Jaipur',
    budget: '₹4,50,000',
    bidsCount: 5,
    status: 'Bidding Open',
    date: '14 Nov 2026',
    progress: 35,
  },
  {
    id: 'P-102',
    title: 'Complete Sanitary & Pipe Fitting',
    category: 'Plumber',
    location: 'Mansarovar Sec 7',
    budget: '₹38,000',
    bidsCount: 3,
    status: 'In Progress',
    date: '16 Nov 2026',
    progress: 70,
  },
  {
    id: 'P-103',
    title: 'Luxury 3BHK Modular Kitchen',
    category: 'Carpenter',
    location: 'C-Scheme, Jaipur',
    budget: '₹1,25,000',
    bidsCount: 8,
    status: 'Shortlisting',
    date: '18 Nov 2026',
    progress: 10,
  },
];

const INITIAL_REVIEWS = [
  {
    id: 'r1',
    author: 'Sunil Mathur',
    role: 'Home Owner',
    rating: 5,
    date: 'Yesterday',
    text: 'Ram Singh ji and his team completed the foundation and masonry work 3 days before schedule. Highly disciplined and honest pricing!',
    verifiedWork: 'G+2 Villa Foundation',
  },
  {
    id: 'r2',
    author: 'Neha Shekhawat',
    role: 'Architect',
    rating: 5,
    date: '4 days ago',
    text: 'Found 4 certified plumbers within 20 mins. The digital contract and escrow guarantee gave me total peace of mind.',
    verifiedWork: 'Sanitary Line Repair',
  },
  {
    id: 'r3',
    author: 'Kishan Lal',
    role: 'Commercial Contractor',
    rating: 4.8,
    date: '1 week ago',
    text: 'Best platform for verified construction labour in Rajasthan. No middleman commission.',
    verifiedWork: 'Warehouse Demolition & Leveling',
  },
];

// ==========================================
// 3. MAIN COMPONENT WITH SAFE AREA PROVIDER
// ==========================================
export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.ttf'),
    'Satoshi-Medium': require('./assets/fonts/Satoshi-Medium.ttf'),
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.ttf'),
    'Satoshi-Black': require('./assets/fonts/Satoshi-Black.ttf'),
  });

  // Navigation State: 'SPLASH' | 'LANGUAGE' | 'SIGN_IN' | 'ROLE_SELECT' | 'MAIN'
  const [currentScreen, setCurrentScreen] = useState('SPLASH');
  const [lang, setLang] = useState('en');
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'WORKER'
  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME' | 'WORK' | 'REVIEWS' | 'PROFILE'

  // Dev Login form state
  const [showDevForm, setShowDevForm] = useState(false);
  const [devUser, setDevUser] = useState('');
  const [devPass, setDevPass] = useState('');

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [postStep, setPostStep] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newCategory, setNewCategory] = useState('Mason');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Data State
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  const t = I18N[lang] || I18N.en;

  // Auto transition from Splash Screen
  useEffect(() => {
    if (currentScreen === 'SPLASH') {
      const timer = setTimeout(() => {
        setCurrentScreen('LANGUAGE');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Handle Dev Login
  const handleDevLogin = () => {
    if (devUser.trim() === 'abc' && devPass.trim() === '1234') {
      setShowDevForm(false);
      setCurrentScreen('ROLE_SELECT');
    } else {
      Alert.alert('Invalid Credentials', 'Please use Username: abc and Password: 1234');
    }
  };

  // Submit new Requirement
  const handleCreateRequirement = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a requirement title');
      return;
    }
    const newReq = {
      id: `P-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      category: newCategory,
      location: newLoc || 'Jaipur Central',
      budget: newBudget ? `₹${newBudget}` : '₹50,000',
      bidsCount: 0,
      status: 'Bidding Open',
      date: 'Today',
      progress: 5,
    };
    setProjects([newReq, ...projects]);
    setShowPostModal(false);
    setShowSuccessModal(true);
    setPostStep(1);
    setNewTitle('');
    setNewBudget('');
    setNewLoc('');
  };

  // Submit Review
  const handleAddReview = () => {
    if (!newReviewAuthor.trim() || !newReviewText.trim()) {
      Alert.alert('Required', 'Please enter your name and comments.');
      return;
    }
    const rev = {
      id: `r-${Date.now()}`,
      author: newReviewAuthor,
      role: role === 'CUSTOMER' ? 'Verified Client' : 'Skilled Mistri',
      rating: newReviewRating,
      date: 'Just now',
      text: newReviewText,
      verifiedWork: 'Verified Job Delivery',
    };
    setReviews([rev, ...reviews]);
    setShowReviewModal(false);
    setNewReviewAuthor('');
    setNewReviewText('');
    Alert.alert('Review Published', 'Thank you! Your verified review is now live.');
  };

  // -------------------------------------------------------------
  // SCREEN 1: SPLASH (White & Red mistripro Logo + 3-4s Loading)
  // -------------------------------------------------------------
  if (currentScreen === 'SPLASH') {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.splashContent}>
          {/* Official mistripro Logo */}
          <Image
            source={require('./assets/splash_logo.png')}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
          <Text style={styles.splashTagline}>{t.tagline}</Text>

          {/* Loading Indicator 3-4 seconds */}
          <View style={styles.splashLoaderWrap}>
            <ActivityIndicator size="small" color="#E11D48" />
            <Text style={styles.splashLoadingText}>Initializing mistripro...</Text>
          </View>
        </View>

        <View style={styles.splashFooter}>
          <Text style={styles.splashFooterText}>SKILLED HANDS • TRUSTED WORK</Text>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: LANGUAGE SELECTION (Laundrify Bottom Sheet Reference)
  // -------------------------------------------------------------
  if (currentScreen === 'LANGUAGE') {
    const languages = [
      { code: 'en', label: 'English', native: 'English', char: 'A' },
      { code: 'hi', label: 'Hindi', native: 'हिंदी', char: 'अ' },
      { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', char: 'અ' },
      { code: 'mr', label: 'Marathi', native: 'मराठी', char: 'म' },
    ];

    return (
      <View style={styles.langScreenContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1E50C8" />
        <View style={styles.langScreenBackground} />

        {/* Top Minimal Branding with official mistripro logo */}
        <View style={styles.langTopBranding}>
          <Image
            source={require('./assets/splash_logo.png')}
            style={styles.langSplashLogo}
            resizeMode="contain"
          />
          <Text style={styles.langBrandSub}>{t.tagline}</Text>
        </View>

        {/* Laundrify Slide-up White Sheet */}
        <View style={[styles.langBottomSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>{t.chooseLanguage}</Text>
          <Text style={styles.sheetSubtitle}>{t.selectLangSub}</Text>

          <View style={styles.langList}>
            {languages.map((item) => {
              const isSelected = lang === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.langRow, isSelected && styles.langRowActive]}
                  onPress={() => setLang(item.code)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.langCharCircle, isSelected && styles.langCharCircleActive]}>
                    <Text style={[styles.langCharText, isSelected && styles.langCharTextActive]}>
                      {item.char}
                    </Text>
                  </View>

                  <View style={styles.langRowTextWrap}>
                    <Text style={[styles.langRowTitle, isSelected && styles.langRowTitleActive]}>
                      {item.native}
                    </Text>
                    <Text style={styles.langRowSub}>{item.label}</Text>
                  </View>

                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.primaryBlackBtn}
            onPress={() => setCurrentScreen('SIGN_IN')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBlackBtnText}>{t.continueBtn} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: SIGN IN TO CONTINUE (Exact Clean Design Reference)
  // -------------------------------------------------------------
  if (currentScreen === 'SIGN_IN') {
    return (
      <SafeAreaView style={styles.signInSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView
          contentContainerStyle={[styles.signInContent, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Animated Lottie Graphics */}
          <View style={styles.signInLottieWrapper}>
            <LottieView
              source={require('./assets/login_lottie.json')}
              autoPlay
              loop
              style={styles.signInLottieView}
            />
          </View>

          {/* Heading and subtext */}
          <Text style={styles.signInMainHeading}>{t.signInTitle}</Text>
          <Text style={styles.signInSubHeading}>{t.signInSub}</Text>

          {/* Primary Action Buttons */}
          <View style={styles.signInActionsGroup}>
            {/* 1. Black Continue with Google (with official Google logo) */}
            <TouchableOpacity
              style={styles.authBlackButton}
              onPress={() => setCurrentScreen('ROLE_SELECT')}
              activeOpacity={0.85}
            >
              <Image
                source={require('./assets/google_logo.png')}
                style={{ width: 22, height: 22, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text style={styles.authBlackButtonText}>{t.continueGoogle}</Text>
            </TouchableOpacity>

            {/* 2. White Outlined Mobile OTP */}
            <TouchableOpacity
              style={styles.authOutlineButton}
              onPress={() => setCurrentScreen('ROLE_SELECT')}
              activeOpacity={0.8}
            >
              <Smartphone size={20} color="#0F172A" />
              <Text style={styles.authOutlineButtonText}>{t.continueOTP}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Terms & Legal notice */}
          <View style={styles.signInFooter}>
            <Text style={styles.signInTermsText}>
              By continuing, you confirm that you have read and agreed to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and consent to the{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 4: CHOOSE YOUR ROLE (Customer vs Worker Picker)
  // -------------------------------------------------------------
  if (currentScreen === 'ROLE_SELECT') {
    return (
      <SafeAreaView style={styles.roleSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleBackBtn}
            onPress={() => setCurrentScreen('SIGN_IN')}
          >
            <ChevronRight size={22} color="#0F172A" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <View style={styles.roleHeaderSection}>
            <Text style={styles.roleHeaderTitle}>{t.chooseRoleTitle}</Text>
            <Text style={styles.roleHeaderSub}>{t.chooseRoleSub}</Text>
          </View>

          <View style={styles.roleCardsGroup}>
            {/* Customer Role Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'CUSTOMER' && styles.roleCardActive]}
              onPress={() => {
                setRole('CUSTOMER');
                setCurrentScreen('MAIN');
              }}
              activeOpacity={0.85}
            >
              <View style={styles.roleCardTopRow}>
                <View style={[styles.roleEmojiWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={styles.roleEmoji}>🏠</Text>
                </View>
                <View style={styles.roleArrowCircle}>
                  <ArrowRight size={18} color="#4F46E5" />
                </View>
              </View>
              <Text style={styles.roleCardTitle}>{t.customerRole}</Text>
              <Text style={styles.roleCardDesc}>{t.customerDesc}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Post Work • Hire Workers • Escrow Safety</Text>
              </View>
            </TouchableOpacity>

            {/* Worker Role Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'WORKER' && styles.roleCardActiveWorker]}
              onPress={() => {
                setRole('WORKER');
                setCurrentScreen('MAIN');
              }}
              activeOpacity={0.85}
            >
              <View style={styles.roleCardTopRow}>
                <View style={[styles.roleEmojiWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={styles.roleEmoji}>👷</Text>
                </View>
                <View style={[styles.roleArrowCircle, { backgroundColor: '#DCFCE7' }]}>
                  <ArrowRight size={18} color="#16A34A" />
                </View>
              </View>
              <Text style={styles.roleCardTitle}>{t.workerRole}</Text>
              <Text style={styles.roleCardDesc}>{t.workerDesc}</Text>
              <View style={[styles.roleTag, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.roleTagText, { color: '#166534' }]}>
                  Instant Bids • Direct Payout • Aadhaar Badge
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.roleNote}>
            💡 You can freely switch between Customer and Worker personas anytime from your Profile tab.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 5: MAIN APP (FIONIX + CHOOSINGHER ULTRA POLISHED UX)
  // -------------------------------------------------------------
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'HOME' && (
        <HomeScreen
          t={t}
          role={role}
          insets={insets}
          projects={projects}
          onOpenPost={() => setShowPostModal(true)}
          onSelectCategory={(cat) => setNewCategory(cat)}
        />
      )}

      {activeTab === 'WORK' && (
        <WorkScreen
          t={t}
          role={role}
          insets={insets}
          projects={projects}
          onOpenPost={() => setShowPostModal(true)}
        />
      )}

      {activeTab === 'REVIEWS' && (
        <ReviewsScreen
          t={t}
          insets={insets}
          reviews={reviews}
          onOpenWriteReview={() => setShowReviewModal(true)}
        />
      )}

      {activeTab === 'PROFILE' && (
        <ProfileScreen
          t={t}
          role={role}
          lang={lang}
          insets={insets}
          onSwitchRole={() => setRole(role === 'CUSTOMER' ? 'WORKER' : 'CUSTOMER')}
          onSwitchLang={() => setCurrentScreen('LANGUAGE')}
          onLogout={() => {
            Alert.alert(t.logout, 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => setCurrentScreen('SIGN_IN'),
              },
            ]);
          }}
        />
      )}

      {/* ---------------------------------------------------------
          FLOATING PILL BOTTOM NAVIGATION (FIONIX / APPLE DOCK STYLE)
          --------------------------------------------------------- */}
      <View
        style={[
          styles.bottomNavCapsule,
          {
            bottom: Math.max(insets.bottom + 10, 20),
          },
        ]}
      >
        {/* Tab 1: Home */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('HOME')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, activeTab === 'HOME' && styles.navIconBoxActive]}>
            <Home
              size={20}
              color={activeTab === 'HOME' ? '#4F46E5' : '#94A3B8'}
              strokeWidth={activeTab === 'HOME' ? 2.5 : 2}
            />
          </View>
          <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>
            {t.home}
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Work */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('WORK')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, activeTab === 'WORK' && styles.navIconBoxActive]}>
            <Briefcase
              size={20}
              color={activeTab === 'WORK' ? '#4F46E5' : '#94A3B8'}
              strokeWidth={activeTab === 'WORK' ? 2.5 : 2}
            />
          </View>
          <Text style={[styles.navLabel, activeTab === 'WORK' && styles.navLabelActive]}>
            {t.work}
          </Text>
        </TouchableOpacity>

        {/* Center Floating Action Button (Post Tender / Find Jobs) */}
        <TouchableOpacity
          style={styles.navCenterFab}
          onPress={() => {
            if (role === 'CUSTOMER') {
              setShowPostModal(true);
            } else {
              setActiveTab('WORK');
            }
          }}
          activeOpacity={0.85}
        >
          <Plus size={26} color="#FFFFFF" strokeWidth={2.8} />
        </TouchableOpacity>

        {/* Tab 4: Reviews */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('REVIEWS')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, activeTab === 'REVIEWS' && styles.navIconBoxActive]}>
            <Star
              size={20}
              color={activeTab === 'REVIEWS' ? '#4F46E5' : '#94A3B8'}
              strokeWidth={activeTab === 'REVIEWS' ? 2.5 : 2}
            />
          </View>
          <Text style={[styles.navLabel, activeTab === 'REVIEWS' && styles.navLabelActive]}>
            {t.reviews}
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profile */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('PROFILE')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, activeTab === 'PROFILE' && styles.navIconBoxActive]}>
            <User
              size={20}
              color={activeTab === 'PROFILE' ? '#4F46E5' : '#94A3B8'}
              strokeWidth={activeTab === 'PROFILE' ? 2.5 : 2}
            />
          </View>
          <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]}>
            {t.profile}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------------------------------------------------
          POST REQUIREMENT MODAL (6-STEP WIZARD)
          --------------------------------------------------------- */}
      <Modal visible={showPostModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 20, 24) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalStepBadge}>STEP {postStep} OF 3</Text>
                <Text style={styles.modalTitle}>Post New Requirement</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setShowPostModal(false);
                  setPostStep(1);
                }}
              >
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Step Indicators */}
            <View style={styles.modalProgressTrack}>
              <View style={[styles.modalProgressFill, { width: `${(postStep / 3) * 100}%` }]} />
            </View>

            {/* STEP 1: Category & Title */}
            {postStep === 1 && (
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Choose Work Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {['Mason', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Tiles'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.modalCatChip, newCategory === c && styles.modalCatChipActive]}
                      onPress={() => setNewCategory(c)}
                    >
                      <Text
                        style={[
                          styles.modalCatChipText,
                          newCategory === c && styles.modalCatChipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.inputLabel}>Work Title / Summary</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2nd Floor Boundary Wall & Plaster"
                  placeholderTextColor="#94A3B8"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />

                <TouchableOpacity
                  style={styles.modalNextBtn}
                  onPress={() => {
                    if (!newTitle.trim()) {
                      Alert.alert('Required', 'Please enter a title for the requirement');
                      return;
                    }
                    setPostStep(2);
                  }}
                >
                  <Text style={styles.modalNextBtnText}>Continue to Location →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: Location & Budget */}
            {postStep === 2 && (
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Site Location / City</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Vaishali Nagar, Jaipur"
                  placeholderTextColor="#94A3B8"
                  value={newLoc}
                  onChangeText={setNewLoc}
                />

                <Text style={styles.inputLabel}>Estimated Budget (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 45000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={newBudget}
                  onChangeText={setNewBudget}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalBackBtn}
                    onPress={() => setPostStep(1)}
                  >
                    <Text style={styles.modalBackBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalNextBtn, { flex: 1, marginTop: 0 }]}
                    onPress={() => setPostStep(3)}
                  >
                    <Text style={styles.modalNextBtnText}>Review & Publish →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3: Summary & Escrow Guarantee */}
            {postStep === 3 && (
              <View style={styles.modalBody}>
                <View style={styles.modalSummaryBox}>
                  <Text style={styles.summaryTitle}>{newTitle}</Text>
                  <Text style={styles.summaryCategory}>{newCategory} • {newLoc || 'Jaipur'}</Text>
                  <Text style={styles.summaryBudget}>Estimated Budget: ₹{newBudget || '50,000'}</Text>
                </View>

                <View style={styles.escrowNoticeCard}>
                  <ShieldCheck size={20} color="#16A34A" />
                  <Text style={styles.escrowNoticeText}>
                    100% Escrow Protected: Payments are only released to mistris after you confirm milestone completion.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalPublishBtn}
                  onPress={handleCreateRequirement}
                >
                  <Text style={styles.modalPublishBtnText}>Publish Requirement Now 🚀</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ---------------------------------------------------------
          SUCCESS CONFIRMATION MODAL
          --------------------------------------------------------- */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconOuter}>
              <CheckCircle2 size={44} color="#16A34A" />
            </View>
            <Text style={styles.successHeading}>Requirement Published!</Text>
            <Text style={styles.successSub}>
              Your requirement is now live. Certified mistris in Jaipur are being notified. You will start receiving bids within 15 minutes.
            </Text>
            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={() => {
                setShowSuccessModal(false);
                setActiveTab('WORK');
              }}
            >
              <Text style={styles.successDoneBtnText}>View in Projects Tab</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------------------------------------------------------
          WRITE REVIEW MODAL
          --------------------------------------------------------- */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 20, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Verified Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Ramesh Sharma"
                placeholderTextColor="#94A3B8"
                value={newReviewAuthor}
                onChangeText={setNewReviewAuthor}
              />

              <Text style={styles.inputLabel}>Star Rating</Text>
              <View style={styles.ratingStarRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setNewReviewRating(s)}>
                    <Star
                      size={28}
                      color={s <= newReviewRating ? '#EAB308' : '#CBD5E1'}
                      fill={s <= newReviewRating ? '#EAB308' : 'none'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Your Feedback / Experience</Text>
              <TextInput
                style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Share work quality, punctuality, and pricing feedback..."
                placeholderTextColor="#94A3B8"
                multiline
                value={newReviewText}
                onChangeText={setNewReviewText}
              />

              <TouchableOpacity style={styles.modalPublishBtn} onPress={handleAddReview}>
                <Text style={styles.modalPublishBtnText}>Submit Verified Review ⭐</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =================================================================
// SUB-SCREEN A: HOME SCREEN (FIONIX STYLE + ULTRA HIGH FINISH)
// =================================================================
function HomeScreen({ t, role, insets, projects, onOpenPost, onSelectCategory }) {
  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <ScrollView
        contentContainerStyle={[styles.homeScrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Bar: Avatar, Greeting, Action Icons */}
        <View style={styles.fionixHeaderBar}>
          <View style={styles.fionixUserRow}>
            <View style={styles.fionixAvatarWrap}>
              <Text style={styles.fionixAvatarText}>RS</Text>
            </View>
            <View style={styles.fionixUserTextCol}>
              <Text style={styles.fionixHelloSub}>{t.hello}</Text>
              <Text style={styles.fionixUserName}>Ramesh Sharma!</Text>
            </View>
          </View>

          <View style={styles.fionixHeaderActions}>
            <TouchableOpacity style={styles.fionixHeaderIconBtn}>
              <Search size={20} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.fionixHeaderIconBtn}>
              <Bell size={20} color="#0F172A" />
              <View style={styles.fionixRedDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Task Overview Subtitle */}
        <View style={styles.fionixSectionTitleRow}>
          <View>
            <Text style={styles.fionixSectionTitle}>{t.taskOverview}</Text>
            <Text style={styles.fionixSectionSubtitle}>
              {role === 'CUSTOMER' ? t.newTaskCount : 'You have 8 active construction tenders near you'}
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.fionixSeeAllLink}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Hero Blue Card (Manage your task - FIONIX Exact Visual Style) */}
        <View style={styles.fionixHeroBlueCard}>
          {/* Background decorative curved bubble */}
          <View style={styles.fionixBubble1} />
          <View style={styles.fionixBubble2} />

          <View style={styles.fionixHeroTopRow}>
            <Text style={styles.fionixHeroHeading}>
              {role === 'CUSTOMER' ? t.activeReqCard : 'Nearby Opportunities'}
            </Text>
            <TouchableOpacity
              style={styles.fionixHeroArrowCircle}
              onPress={onOpenPost}
              activeOpacity={0.8}
            >
              <ArrowUpRight size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fionixHeroBigScore}>
            {role === 'CUSTOMER' ? t.activeReqCount : '8/12'}
          </Text>
          <Text style={styles.fionixHeroSubPrompt}>
            {role === 'CUSTOMER' ? t.activeReqSub : 'Submit quotations for open verified tenders.'}
          </Text>

          {/* Quick Action Button Inside Card */}
          <View style={styles.fionixHeroBtnRow}>
            <TouchableOpacity
              style={styles.fionixWhiteActionBtn}
              onPress={onOpenPost}
              activeOpacity={0.85}
            >
              <Plus size={16} color="#2563EB" strokeWidth={2.6} />
              <Text style={styles.fionixWhiteActionBtnText}>
                {role === 'CUSTOMER' ? t.postRequirement : 'Submit Tender Bid'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Two Stat Cards (Upcoming Task & Assigned Task) */}
        <View style={styles.fionixTwoCardsRow}>
          {/* Card 1: Green tinted */}
          <View style={[styles.fionixStatCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={styles.fionixStatTopRow}>
              <Text style={styles.fionixStatCardLabel}>{t.upcomingTask}</Text>
              <View style={[styles.fionixStatMiniArrow, { backgroundColor: '#0F172A' }]}>
                <ArrowUpRight size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.fionixStatBigNumber}>12</Text>
            <Text style={styles.fionixStatSubLabel}>{t.pendingDiscussion}</Text>
          </View>

          {/* Card 2: Light cream tinted */}
          <View style={[styles.fionixStatCard, { backgroundColor: '#FEF9C3' }]}>
            <View style={styles.fionixStatTopRow}>
              <Text style={styles.fionixStatCardLabel}>{t.assignedTask}</Text>
              <View style={[styles.fionixStatMiniArrow, { backgroundColor: '#0F172A' }]}>
                <ArrowUpRight size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.fionixStatBigNumber}>32</Text>
            <Text style={styles.fionixStatSubLabel}>{t.almostDone}</Text>
          </View>
        </View>

        {/* 5. Working Hours / Analytics Visual Bar (FIONIX Reference) */}
        <View style={styles.fionixHoursCard}>
          <View style={styles.fionixHoursTopRow}>
            <Text style={styles.fionixHoursTitle}>{t.monthlyHours}</Text>
            <Text style={styles.fionixHoursTotal}>36h</Text>
          </View>

          {/* Visual Bar Graph */}
          <View style={styles.fionixBarGraphRow}>
            {[
              { day: 'Mon', h: 30, active: false },
              { day: 'Tue', h: 55, active: false },
              { day: 'Wed', h: 80, active: true },
              { day: 'Thu', h: 42, active: false },
              { day: 'Fri', h: 60, active: false },
            ].map((bar) => (
              <View key={bar.day} style={styles.barCol}>
                {bar.active && (
                  <View style={styles.barTooltip}>
                    <Text style={styles.barTooltipText}>8 hrs</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.barPill,
                    { height: bar.h },
                    bar.active && styles.barPillActive,
                  ]}
                />
                <Text style={styles.barDayText}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 6. Popular Categories (Horizontal Scroll) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{t.services}</Text>
          <TouchableOpacity>
            <Text style={styles.fionixSeeAllLink}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onSelectCategory(cat.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.catEmoji}>{cat.icon}</Text>
              <Text style={styles.catName} numberOfLines={1}>
                {cat.name.split(' ')[0]}
              </Text>
              <Text style={styles.catWorkersCount}>{cat.workers} Active</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 7. Top Verified Workers (Horizontal Cards) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{t.topWorkers}</Text>
          <TouchableOpacity>
            <Text style={styles.fionixSeeAllLink}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.workersScroll}
        >
          {TOP_WORKERS.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              <View style={[styles.workerAvatarCircle, { backgroundColor: worker.color }]}>
                <Text style={styles.workerAvatarText}>{worker.avatar}</Text>
              </View>

              <View style={styles.workerVerifiedBadge}>
                <ShieldCheck size={12} color="#16A34A" />
                <Text style={styles.workerVerifiedText}>KYC</Text>
              </View>

              <Text style={styles.workerName} numberOfLines={1}>
                {worker.name}
              </Text>
              <Text style={styles.workerSkill} numberOfLines={1}>
                {worker.skill}
              </Text>

              <View style={styles.workerRatingRow}>
                <Star size={13} color="#EAB308" fill="#EAB308" />
                <Text style={styles.workerRatingNum}>{worker.rating}</Text>
                <Text style={styles.workerReviewsCount}>({worker.reviews})</Text>
              </View>

              <Text style={styles.workerRate}>
                ₹{worker.rate}
                <Text style={styles.workerRateSub}>{t.dailyRate}</Text>
              </Text>

              <TouchableOpacity
                style={styles.workerHireBtn}
                onPress={() => Alert.alert('Contact Worker', `Direct call initiated with ${worker.name}`)}
              >
                <Text style={styles.workerHireBtnText}>{t.hireWorker}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// =================================================================
// SUB-SCREEN B: WORK & REQUIREMENTS SCREEN
// =================================================================
function WorkScreen({ t, role, insets, projects, onOpenPost }) {
  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <View style={styles.workScreenHeader}>
        <View>
          <Text style={styles.workScreenTitle}>
            {role === 'CUSTOMER' ? 'Your Posted Requirements' : 'Available Tenders'}
          </Text>
          <Text style={styles.workScreenSub}>
            {role === 'CUSTOMER'
              ? 'Track applications and release escrow milestones'
              : 'Direct construction tenders in Jaipur region'}
          </Text>
        </View>
        {role === 'CUSTOMER' && (
          <TouchableOpacity style={styles.workScreenPostBtn} onPress={onOpenPost}>
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.workScreenPostBtnText}>Post</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.workScrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {projects.map((proj) => (
          <View key={proj.id} style={styles.projectCard}>
            <View style={styles.projectTopRow}>
              <View style={styles.projectBadge}>
                <Text style={styles.projectBadgeText}>{proj.category}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  proj.status === 'In Progress' && { backgroundColor: '#EFF6FF' },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    proj.status === 'In Progress' && { color: '#2563EB' },
                  ]}
                >
                  {proj.status}
                </Text>
              </View>
            </View>

            <Text style={styles.projectTitle}>{proj.title}</Text>

            <View style={styles.projectInfoRow}>
              <View style={styles.projectInfoItem}>
                <MapPin size={14} color="#64748B" />
                <Text style={styles.projectInfoText}>{proj.location}</Text>
              </View>
              <View style={styles.projectInfoItem}>
                <Clock size={14} color="#64748B" />
                <Text style={styles.projectInfoText}>{proj.date}</Text>
              </View>
            </View>

            <View style={styles.projectDivider} />

            <View style={styles.projectFooterRow}>
              <View>
                <Text style={styles.projectBudgetLabel}>Budget</Text>
                <Text style={styles.projectBudgetVal}>{proj.budget}</Text>
              </View>

              <TouchableOpacity
                style={styles.projectActionBtn}
                onPress={() =>
                  Alert.alert(
                    'Tender Details',
                    `Tender ID: ${proj.id}\n${proj.title}\nStatus: ${proj.status}`
                  )
                }
              >
                <Text style={styles.projectActionBtnText}>
                  {role === 'CUSTOMER' ? `View ${proj.bidsCount} Bids` : 'Submit Bid'}
                </Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// =================================================================
// SUB-SCREEN C: REVIEWS SCREEN
// =================================================================
function ReviewsScreen({ t, insets, reviews, onOpenWriteReview }) {
  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <View style={styles.workScreenHeader}>
        <View>
          <Text style={styles.workScreenTitle}>{t.ratingsReviews}</Text>
          <Text style={styles.workScreenSub}>100% Verified customer experiences</Text>
        </View>
        <TouchableOpacity style={styles.writeReviewTopBtn} onPress={onOpenWriteReview}>
          <Star size={16} color="#FFFFFF" />
          <Text style={styles.writeReviewTopBtnText}>Write</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.workScrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Rating Banner */}
        <View style={styles.overallRatingCard}>
          <View style={styles.overallRatingLeft}>
            <Text style={styles.overallScoreText}>4.9</Text>
            <View style={styles.overallStarRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} color="#EAB308" fill="#EAB308" />
              ))}
            </View>
            <Text style={styles.overallCountText}>Based on 280+ verified jobs</Text>
          </View>
          <View style={styles.overallRightBadge}>
            <ShieldCheck size={28} color="#16A34A" />
            <Text style={styles.overallRightBadgeText}>Zero Fraud Guarantee</Text>
          </View>
        </View>

        {/* Reviews List */}
        {reviews.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.reviewTopRow}>
              <View style={styles.reviewAvatarCircle}>
                <Text style={styles.reviewAvatarInitial}>{rev.author.charAt(0)}</Text>
              </View>
              <View style={styles.reviewAuthorCol}>
                <Text style={styles.reviewAuthorName}>{rev.author}</Text>
                <Text style={styles.reviewAuthorRole}>{rev.role} • {rev.date}</Text>
              </View>
              <View style={styles.reviewStarsPill}>
                <Star size={12} color="#EAB308" fill="#EAB308" />
                <Text style={styles.reviewRatingNum}>{rev.rating}</Text>
              </View>
            </View>

            <Text style={styles.reviewBodyText}>{rev.text}</Text>

            <View style={styles.reviewWorkTag}>
              <Check size={12} color="#16A34A" />
              <Text style={styles.reviewWorkTagText}>{rev.verifiedWork}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// =================================================================
// SUB-SCREEN D: PROFILE SCREEN (ChoosingHer Settings Reference)
// =================================================================
function ProfileScreen({ t, role, lang, insets, onSwitchRole, onSwitchLang, onLogout }) {
  const currentLangLabel = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    gu: 'ગુજરાતી (Gujarati)',
    mr: 'मराठी (Marathi)',
  }[lang];

  return (
    <SafeAreaView style={styles.profileSafeArea}>
      <ScrollView
        contentContainerStyle={[styles.profileScrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Title */}
        <View style={styles.profileTopBar}>
          <Text style={styles.profileTopBarTitle}>{t.settings}</Text>
        </View>

        {/* ChoosingHer Exact Centered Profile Header */}
        <View style={styles.profileHeaderCenter}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileAvatarInitial}>RS</Text>
          </View>
          <Text style={styles.profileNameText}>Ramesh Sharma</Text>
          <Text style={styles.profileEmailSub}>ramesh.sharma@mistripro.in</Text>
          <View style={styles.profilePersonaBadge}>
            <Text style={styles.profilePersonaBadgeText}>
              {role === 'CUSTOMER' ? 'Client / Project Owner' : 'Verified Skilled Mistri'}
            </Text>
          </View>
        </View>

        {/* ChoosingHer Invite Friends / Promo Banner */}
        <View style={styles.profilePromoCard}>
          <View style={styles.promoTextCol}>
            <Text style={styles.promoTitle}>Invite Friends & Contractors</Text>
            <Text style={styles.promoSub}>Get ₹250 wallet credit on their 1st verified booking.</Text>
          </View>
          <View style={styles.promoIconArt}>
            <Sparkles size={24} color="#EA580C" />
          </View>
        </View>

        {/* Settings Clean Rows (ChoosingHer exact layout) */}
        <View style={styles.settingsGroupCard}>
          {/* 1. Switch Role Persona */}
          <TouchableOpacity style={styles.settingsRow} onPress={onSwitchRole} activeOpacity={0.7}>
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <RotateCcw size={18} color="#4F46E5" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>{t.switchRole}</Text>
              <Text style={styles.settingsRowSub}>
                Current: {role === 'CUSTOMER' ? 'Customer Mode' : 'Worker Mode'}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          {/* 2. Choose Language */}
          <TouchableOpacity style={styles.settingsRow} onPress={onSwitchLang} activeOpacity={0.7}>
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Layers size={18} color="#16A34A" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>{t.chooseLanguage}</Text>
              <Text style={styles.settingsRowSub}>{currentLangLabel}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          {/* 3. KYC Status */}
          <View style={styles.settingsRow}>
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#DCFCE7' }]}>
              <ShieldCheck size={18} color="#15803D" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>{t.verifiedKYC}</Text>
              <Text style={styles.settingsRowSub}>Aadhaar & Bank Verified ✓</Text>
            </View>
            <View style={styles.verifiedGreenBadge}>
              <Text style={styles.verifiedGreenBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.settingsRowDivider} />

          {/* 4. Payment History */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => Alert.alert('Payments', 'All payments and GST invoices are recorded.')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <CreditCard size={18} color="#D97706" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>{t.manageSub}</Text>
              <Text style={styles.settingsRowSub}>Wallet balance: ₹2,450</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          {/* 5. Notifications */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => Alert.alert('Notifications', 'Push notifications enabled.')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Bell size={18} color="#475569" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>{t.notifications}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          {/* 6. Help Center & FAQ */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => Alert.alert('Help & Support', 'Call toll-free: 1800-MISTRI-PRO')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <HelpCircle size={18} color="#475569" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>{t.faq}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Log Out Button (Prominent Red) */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutButtonText}>{t.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>MISTRI PRO • Build v2.4.0 (Enterprise Pro)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 4. MASTER STYLESHEET
// ==========================================
const styles = StyleSheet.create({
  // SPLASH SCREEN
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 24,
  },
  splashContent: {
    alignItems: 'center',
    width: '100%',
  },
  splashLogoImage: {
    width: 280,
    height: 90,
    marginBottom: 16,
  },
  splashTagline: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 40,
  },
  splashLoaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  splashLoadingText: {
    fontFamily: 'Satoshi-Medium',
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#64748B',
  },
  splashFooter: {
    position: 'absolute',
    bottom: 40,
  },
  splashFooterText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 2,
  },

  // LANGUAGE SCREEN
  langScreenContainer: {
    flex: 1,
    backgroundColor: '#1E50C8',
    justifyContent: 'flex-end',
  },
  langScreenBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E50C8',
  },
  langTopBranding: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  langSplashLogo: {
    width: 260,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  langBrandSub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  langBottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 22,
  },
  langList: {
    gap: 12,
    marginBottom: 24,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  langRowActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#F8FAFF',
  },
  langCharCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  langCharCircleActive: {
    backgroundColor: '#EEF2FF',
  },
  langCharText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },
  langCharTextActive: {
    color: '#4F46E5',
  },
  langRowTextWrap: {
    flex: 1,
  },
  langRowTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  langRowTitleActive: {
    color: '#4F46E5',
  },
  langRowSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#4F46E5',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
  primaryBlackBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBlackBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // SIGN IN SCREEN
  signInSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  signInContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLottieWrapper: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  signInLottieView: {
    width: 250,
    height: 250,
  },
  signInMainHeading: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 28,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  signInSubHeading: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 36,
  },
  signInActionsGroup: {
    width: '100%',
    gap: 14,
    marginBottom: 30,
  },
  authBlackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  authGoogleLogoImage: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  authBlackButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  authOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 20,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  authOutlineButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#0F172A',
  },
  authDevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    gap: 8,
  },
  authDevButtonText: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#92400E',
  },
  devBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  devBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  devInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  devSubmitBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  devSubmitText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
  },
  signInFooter: {
    paddingHorizontal: 12,
  },
  signInTermsText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
  },
  termsLink: {
    color: '#16A34A',
    fontWeight: '600',
  },

  // ROLE SELECTION SCREEN
  roleSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  roleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  roleBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleHeaderSection: {
    marginBottom: 28,
  },
  roleHeaderTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 8,
  },
  roleHeaderSub: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  roleCardsGroup: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  roleCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#FAFAFF',
  },
  roleCardActiveWorker: {
    borderColor: '#16A34A',
    backgroundColor: '#F8FFF9',
  },
  roleCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  roleEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 26,
  },
  roleArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCardTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 6,
  },
  roleCardDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    marginBottom: 14,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  roleNote: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },

  // MAIN CONTAINER
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  // BOTTOM NAVIGATION CAPSULE (FIONIX DOCK)
  bottomNavCapsule: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    zIndex: 999,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconBox: {
    padding: 4,
    borderRadius: 12,
  },
  navIconBoxActive: {
    backgroundColor: '#EEF2FF',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  navCenterFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 4,
  },

  // HOME SCREEN (FIONIX INSPIRED)
  homeSafeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  homeScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fionixHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  fionixUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fionixAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fionixAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  fionixUserTextCol: {},
  fionixHelloSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  fionixUserName: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#0F172A',
  },
  fionixHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fionixHeaderIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fionixRedDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  fionixSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  fionixSectionTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#0F172A',
  },
  fionixSectionSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  fionixSeeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // FIONIX BLUE CARD
  fionixHeroBlueCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  fionixBubble1: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  fionixBubble2: {
    position: 'absolute',
    right: 60,
    bottom: -50,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fionixHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fionixHeroHeading: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  fionixHeroArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF08A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fionixHeroBigScore: {
    fontFamily: 'Satoshi-Black',
    fontSize: 38,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  fionixHeroSubPrompt: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
  },
  fionixHeroBtnRow: {
    flexDirection: 'row',
  },
  fionixWhiteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  fionixWhiteActionBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#1D4ED8',
  },

  // TWO CARDS ROW (FIONIX)
  fionixTwoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fionixStatCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  fionixStatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fionixStatCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  fionixStatMiniArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fionixStatBigNumber: {
    fontFamily: 'Satoshi-Black',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 2,
  },
  fionixStatSubLabel: {
    fontSize: 11,
    color: '#64748B',
  },

  // FIONIX WORKING HOURS CARD
  fionixHoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  fionixHoursTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  fionixHoursTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  fionixHoursTotal: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#0F172A',
  },
  fionixBarGraphRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 20,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barTooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  barTooltipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  barPill: {
    width: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
  barPillActive: {
    backgroundColor: '#2563EB',
  },
  barDayText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },

  // POPULAR CATEGORIES
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#0F172A',
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 105,
  },
  catEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  catName: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 2,
  },
  catWorkersCount: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
  },

  // TOP WORKERS
  workersScroll: {
    marginBottom: 20,
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
  },
  workerAvatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  workerAvatarText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
  },
  workerVerifiedBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  workerVerifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#166534',
  },
  workerName: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'center',
  },
  workerSkill: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  workerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  workerRatingNum: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#0F172A',
  },
  workerReviewsCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  workerRate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  workerRateSub: {
    fontSize: 10,
    fontWeight: '400',
    color: '#64748B',
  },
  workerHireBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  workerHireBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // WORK / PROJECTS SCREEN
  workScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  workScreenTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#0F172A',
  },
  workScreenSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  workScreenPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  workScreenPostBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
  },
  workScrollContent: {
    padding: 20,
    gap: 14,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  projectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  projectTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 10,
  },
  projectInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  projectInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectInfoText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  projectDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 14,
  },
  projectFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectBudgetLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  projectBudgetVal: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#0F172A',
  },
  projectActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  projectActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // REVIEWS SCREEN
  writeReviewTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAB308',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  writeReviewTopBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
  },
  overallRatingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overallRatingLeft: {},
  overallScoreText: {
    fontFamily: 'Satoshi-Black',
    fontSize: 40,
    color: '#0F172A',
  },
  overallStarRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  overallCountText: {
    fontSize: 11,
    color: '#64748B',
  },
  overallRightBadge: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  overallRightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  reviewAuthorCol: {
    flex: 1,
  },
  reviewAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewAuthorRole: {
    fontSize: 11,
    color: '#64748B',
  },
  reviewStarsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewRatingNum: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#854D0E',
  },
  reviewBodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 12,
  },
  reviewWorkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reviewWorkTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // PROFILE SCREEN (ChoosingHer Settings Layout)
  profileSafeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  profileScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  profileTopBar: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  profileTopBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileHeaderCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  profileAvatarInitial: {
    fontFamily: 'Satoshi-Black',
    fontSize: 28,
    color: '#FFFFFF',
  },
  profileNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileEmailSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  profilePersonaBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  profilePersonaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // PROMO / INVITE CARD (ChoosingHer)
  profilePromoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.2,
    borderColor: '#FED7AA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  promoTextCol: {
    flex: 1,
  },
  promoTitle: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#9A3412',
    marginBottom: 2,
  },
  promoSub: {
    fontSize: 11,
    color: '#C2410C',
    lineHeight: 16,
  },
  promoIconArt: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  // SETTINGS GROUP (ChoosingHer)
  settingsGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingsRowTextCol: {
    flex: 1,
  },
  settingsRowLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#0F172A',
  },
  settingsRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  settingsRowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 66,
  },
  verifiedGreenBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedGreenBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.2,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutButtonText: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#DC2626',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 10,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalStepBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProgressTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  modalBody: {
    gap: 12,
  },
  inputLabel: {
    fontFamily: 'Satoshi-Bold',
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#0F172A',
  },
  modalCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  modalCatChipActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  modalCatChipText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  modalCatChipTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#0F172A',
  },
  modalNextBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalNextBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalBackBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalBackBtnText: {
    fontFamily: 'Satoshi-Medium',
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#475569',
  },
  modalSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  summaryCategory: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  summaryBudget: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  escrowNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 14,
    borderRadius: 14,
  },
  escrowNoticeText: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  modalPublishBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalPublishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // SUCCESS CARD
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  successDoneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  successDoneBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
  },

  // RATING STARS
  ratingStarRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
});
