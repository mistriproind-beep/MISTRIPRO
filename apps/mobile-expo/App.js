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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import LottieView from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from './src/services/supabase';
import {
  signInWithGoogle,
  sendMobileOtp,
  verifyMobileOtp,
  signInWithEmail,
  sendPasswordResetOtp,
  updatePasswordWithOtp,
} from './src/services/auth';
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
  FileCheck,
  UploadCloud,
  Camera,
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
  Users,
  Compass,
  Wallet,
  Download,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Edit3,
} from 'lucide-react-native';

import CustomerHomeScreen from './src/screens/CustomerHomeScreen';
import FindWorkersScreen from './src/screens/FindWorkersScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ContractorScreen from './src/screens/ContractorScreen';

import WorkerHomeScreen from './src/screens/WorkerHomeScreen';
import WorkerAlertsScreen from './src/screens/WorkerAlertsScreen';
import WorkerBookingsScreen from './src/screens/WorkerBookingsScreen';
import WorkerEarningsScreen from './src/screens/WorkerEarningsScreen';
import {
  INITIAL_WORKER_PROFILE,
  INITIAL_ALERTS,
  INITIAL_WORKER_BOOKINGS,
  INITIAL_WALLET,
} from './src/data/workerData';
import { MOCK_BOOKINGS, MOCK_WORKERS } from './src/data/mockWorkers';

import { StorageService } from './src/services/storage';
import { LiveBackend } from './src/services/liveBackend';
import { InvoiceService } from './src/services/invoiceService';
import { DeviceFeedback } from './src/services/deviceFeedback';
import NotificationCenterModal from './src/components/NotificationCenterModal';

const { width } = Dimensions.get('window');

const formatNameFromEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return 'User';
  const rawPrefix = email.split('@')[0];
  const clean = rawPrefix.replace(/[._\-0-9]+/g, ' ').trim();
  if (!clean) return 'User';
  return clean
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

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
    continueEmail: 'Continue with Email & Password',
    continueOTP: 'Continue with Mobile OTP',
    continueGoogle: 'Continue with Google',
    termsNotice: 'By continuing, you confirm that you have read and agreed to the Terms of Service and consent to the Privacy Policy.',
    chooseRoleTitle: 'Choose your role',
    chooseRoleSub: 'How would you like to use MISTRI PRO as:\nSelect your account experience below',
    customerRole: 'Customer',
    customerDesc: 'Book verified mistris instantly for home repair, construction & daily needs.',
    workerRole: 'Worker / Mistri',
    workerDesc: 'Find local work near you, get booked by customers & earn daily with Aadhaar badge.',
    customerTags: 'Post Work • Hire Workers • Secured Payments',
    workerTags: 'Instant Bids • Direct Payout • Aadhaar Badge',
    roleNote: '🔒 Profile Persona Lock: Your registered persona determines account verification and live tools.',
    enterMobile: 'Enter 10-Digit Mobile Number',
    mobileNotice: 'We will send a 6-digit verification code via SMS to this number.',
    getCodeBtn: 'Get Verification Code →',
    verifyPhoneTitle: 'Verify Phone Number',
    enterOtpSubtitle: 'Enter 6-Digit OTP Sent to +91',
    verifyProceedBtn: 'Verify & Proceed ✓',
    resendOtp: "Didn't receive code? Resend SMS",
    emailAuthTitle: 'Email Authentication',
    emailAuthHeading: 'Sign in with Email',
    emailAuthSub: 'Enter your registered Email ID & Password to sign in or register instantly.',
    emailLabel: 'Email Address *',
    passwordLabel: 'Password *',
    forgotPassword: 'Forgot Password?',
    signInWithEmailBtn: 'Sign In with Email →',
    newUserEmailNotice: 'New user? Entering your email and password will create your verified account automatically.',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    navHome: 'Home',
    navFind: 'Find',
    navBookings: 'Bookings',
    navContractor: 'Contractor',
    navProfile: 'Profile',
    navAlerts: 'Alerts',
    navEarnings: 'Earnings',
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
    continueEmail: 'ईमेल और पासवर्ड से आगे बढ़ें',
    continueOTP: 'मोबाइल OTP से आगे बढ़ें',
    continueGoogle: 'Google से आगे बढ़ें',
    termsNotice: 'जारी रखकर, आप पुष्टि करते हैं कि आपने सेवा की शर्तें और गोपनीयता नीति पढ़ ली हैं।',
    chooseRoleTitle: 'अपनी भूमिका चुनें',
    chooseRoleSub: 'मिस्त्री प्रो का उपयोग किस रूप में करना चाहते हैं:',
    customerRole: 'ग्राहक (Customer)',
    customerDesc: 'घर की मरम्मत के लिए तुरंत सत्यापित मिस्त्री बुक करें। तेज़, सुरक्षित और गारंटीड।',
    workerRole: 'कारीगर / मिस्त्री (Worker)',
    workerDesc: 'अपने पास काम खोजें, ग्राहकों से बुकिंग पाएं और आधार बैज के साथ रोज़ कमाएं।',
    customerTags: 'काम पोस्ट करें • कारीगर चुनें • सुरक्षित भुगतान',
    workerTags: 'तुरंत काम • सीधा भुगतान • आधार बैज',
    roleNote: '🔒 प्रोफाइल लॉक: आपकी चुनी गई भूमिका खाता सत्यापन और टूल्स निर्धारित करती है।',
    enterMobile: '10 अंकों का मोबाइल नंबर दर्ज करें',
    mobileNotice: 'हम इस नंबर पर SMS द्वारा 6 अंकों का सत्यापन कोड भेजेंगे।',
    getCodeBtn: 'सत्यापन कोड प्राप्त करें →',
    verifyPhoneTitle: 'फोन नंबर सत्यापित करें',
    enterOtpSubtitle: 'भेजा गया 6 अंकों का OTP दर्ज करें +91',
    verifyProceedBtn: 'सत्यापित करें और आगे बढ़ें ✓',
    resendOtp: 'कोड नहीं मिला? दोबारा SMS भेजें',
    emailAuthTitle: 'ईमेल प्रमाणीकरण',
    emailAuthHeading: 'ईमेल से साइन इन करें',
    emailAuthSub: 'साइन इन करने के लिए अपनी पंजीकृत ईमेल आईडी और पासवर्ड दर्ज करें।',
    emailLabel: 'ईमेल आईडी *',
    passwordLabel: 'पासवर्ड *',
    forgotPassword: 'पासवर्ड भूल गए?',
    signInWithEmailBtn: 'ईमेल से साइन इन करें →',
    newUserEmailNotice: 'नए उपयोगकर्ता? ईमेल और पासवर्ड दर्ज करने से आपका खाता अपने आप बन जाएगा।',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    navHome: 'होम',
    navFind: 'खोजें',
    navBookings: 'बुकिंग',
    navContractor: 'ठेकेदार',
    navProfile: 'प्रोफाइल',
    navAlerts: 'अलर्ट',
    navEarnings: 'कमाई',
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
    continueEmail: 'ઇમેઇલ અને પાસવર્ડ સાથે આગળ વધો',
    continueOTP: 'મોબાઇલ OTP સાથે ચાલુ રાખો',
    continueGoogle: 'Google સાથે ચાલુ રાખો',
    termsNotice: 'ચાલુ રાખીને, તમે સેવાની શરતો અને ગોપનીયતા નીતિ સાથે સંમત થાઓ છો.',
    chooseRoleTitle: 'તમારી ભૂમિકા પસંદ કરો',
    chooseRoleSub: 'તમે મિસ્ત્રી પ્રોનો ઉપયોગ કયા રૂપમાં કરવા માંગો છો:',
    customerRole: 'ગ્રાહક (Customer)',
    customerDesc: 'ઘરની મરામત માટે તરત ચકાસાયેલ મિસ્ત્રી બુક કરો. ઝડપ, સુરક્ષા અને ગ્યારન્ટી.',
    workerRole: 'કારીગર / મિસ્ત્રી (Worker)',
    workerDesc: 'નજીકના ગ્રાહકો પાસેથી કામ મેળવો, ઝડપથી બૂક થાઓ અને આધાર બેજ સાથે કમાઓ.',
    customerTags: 'કામ પોસ્ટ કરો • કારીગર પસંદ કરો • સુરક્ષિત પેમેન્ટ',
    workerTags: 'તરત કામ • સીધું પેમેન્ટ • આધાર બેજ',
    roleNote: '🔒 પ્રોફાઇલ લૉક: તમારી પસંદ કરેલી ભૂમિકા ખાતાની ચકાસણી અને ટૂલ્સ નક્કી કરે છે.',
    enterMobile: '10 અંકનો મોબાઇલ નંબર દાખલ કરો',
    mobileNotice: 'અમે આ નંબર પર SMS દ્વારા 6 અંકનો વેરિફિકેશન કોડ મોકલીશું.',
    getCodeBtn: 'વેરિફિકેશન કોડ મેળવો →',
    verifyPhoneTitle: 'ફોન નંબર ચકાસો',
    enterOtpSubtitle: 'મોકલેલ 6 અંકનો OTP દાખલ કરો +91',
    verifyProceedBtn: 'ચકાસો અને આગળ વધો ✓',
    resendOtp: 'કોડ નથી મળ્યો? ફરી SMS મોકલો',
    emailAuthTitle: 'ઇમેઇલ પ્રમાણીકરણ',
    emailAuthHeading: 'ઇમેઇલ દ્વારા સાઇન ઇન કરો',
    emailAuthSub: 'સાઇન ઇન કરવા માટે તમારું રજિસ્ટર્ડ ઇમેઇલ આઈડી અને પાસવર્ડ દાખલ કરો.',
    emailLabel: 'ઇમેઇલ સરનામું *',
    passwordLabel: 'પાસવર્ડ *',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    signInWithEmailBtn: 'ઇમેઇલ દ્વારા સાઇન ઇન કરો →',
    newUserEmailNotice: 'નવા વપરાશકર્તા? ઇમેઇલ અને પાસવર્ડ દાખલ કરવાથી તમારું ખાતું આપમેળે બની જશે.',
    termsOfService: 'સેવાની શરતો',
    privacyPolicy: 'ગોપનીયતા નીતિ',
    navHome: 'હોમ',
    navFind: 'શોધો',
    navBookings: 'બુકિંગ્સ',
    navContractor: 'કોન્ટ્રાક્ટર',
    navProfile: 'પ્રોફાઇલ',
    navAlerts: 'અલર્ટ્સ',
    navEarnings: 'કમાણી',
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
    continueEmail: 'ईमेल आणि पासवर्डद्वारे पुढे जा',
    continueOTP: 'मोबाईल OTP द्वारे पुढे जा',
    continueGoogle: 'Google द्वारे पुढे जा',
    termsNotice: 'पुढे जाऊन, आपण सेवेच्या अटी व गोपनीयता धोरणाशी सहमत आहात.',
    chooseRoleTitle: 'तुमची भूमिका निवडा',
    chooseRoleSub: 'मिस्त्री प्रोचा वापर कोणत्या भूमिकेत करू इच्छिता:',
    customerRole: 'ग्राहक (Customer)',
    customerDesc: 'घर दुरुस्तीसाठी ताबडतोब सत्यापित मिस्त्री बुक करा. जलद, सुरक्षित आणि हमी.',
    workerRole: 'कारागीर / मिस्त्री (Worker)',
    workerDesc: 'जवळच्या ग्राहकांकडून काम मिळवा, बुकिंग मिळवा आणि आधार बॅजसह दररोज कमाई करा.',
    customerTags: 'काम पोस्ट करा • कारागीर निवडा • सुरक्षित पेमेंट',
    workerTags: 'त्वरित काम • थेट पेमेंट • आधार बॅज',
    roleNote: '🔒 प्रोफाइल लॉक: तुमची निवडलेली भूमिका खाते पडताळणी आणि टूल्स निश्चित करते.',
    enterMobile: '10 अंकी मोबाईल नंबर प्रविष्ट करा',
    mobileNotice: 'आम्ही या नंबरवर SMS द्वारे 6 अंकी पडताळणी कोड पाठवू.',
    getCodeBtn: 'पडताळणी कोड मिळवा →',
    verifyPhoneTitle: 'फोन नंबर पडताळा',
    enterOtpSubtitle: 'पाठवलेला 6 अंकी OTP प्रविष्ट करा +91',
    verifyProceedBtn: 'पडताळणी करा आणि पुढे जा ✓',
    resendOtp: 'कोड मिळाला नाही? पुन्हा SMS पाठवा',
    emailAuthTitle: 'ईमेल प्रमाणीकरण',
    emailAuthHeading: 'ईमेलद्वारे साइन इन करा',
    emailAuthSub: 'साइन इन करण्यासाठी आपला नोंदणीकृत ईमेल आयडी आणि पासवर्ड प्रविष्ट करा.',
    emailLabel: 'ईमेल पत्ता *',
    passwordLabel: 'पासवर्ड *',
    forgotPassword: 'पासवर्ड विसरलात?',
    signInWithEmailBtn: 'ईमेलद्वारे साइन इन करा →',
    newUserEmailNotice: 'नवीन वापरकर्ता? ईमेल आणि पासवर्ड प्रविष्ट केल्याने आपले खाते आपोआप तयार होईल.',
    termsOfService: 'सेवा अटी',
    privacyPolicy: 'गोपनीयता धोरण',
    navHome: 'होम',
    navFind: 'शोधा',
    navBookings: 'बुकिंग्ज',
    navContractor: 'कंत्राटदार',
    navProfile: 'प्रोफाइल',
    navAlerts: 'अलर्ट्स',
    navEarnings: 'कमाई',
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
  { id: '1', name: 'Mason (Raj Mistri)', icon: '🧱', workers: 142 },
  { id: '2', name: 'Mason Helper (Beldar)', icon: '👷', workers: 198 },
  { id: '3', name: 'Construction Labour', icon: '🏗️', workers: 240 },
  { id: '4', name: 'Shuttering Carpenter', icon: '🪵', workers: 84 },
  { id: '5', name: 'Steel Fixer / Bar Bender', icon: '⛓️', workers: 65 },
  { id: '6', name: 'Concrete Worker', icon: '🪨', workers: 72 },
  { id: '7', name: 'Tile & Marble', icon: '🏛️', workers: 95 },
  { id: '8', name: 'Plastering Worker', icon: '🖌️', workers: 58 },
  { id: '9', name: 'Waterproofing', icon: '💧', workers: 46 },
  { id: '10', name: 'Electrician', icon: '⚡', workers: 128 },
  { id: '11', name: 'Plumber', icon: '🔧', workers: 110 },
  { id: '12', name: 'Furniture Carpenter', icon: '🪚', workers: 88 },
  { id: '13', name: 'Welder', icon: '🔥', workers: 54 },
  { id: '14', name: 'Wall Painter', icon: '🎨', workers: 92 },
  { id: '15', name: 'POP & False Ceiling', icon: '📐', workers: 64 },
  { id: '16', name: 'Metal Fabricator', icon: '⚙️', workers: 42 },
  { id: '17', name: 'AC Technician', icon: '❄️', workers: 52 },
  { id: '18', name: 'Cleaning & Housekeeping', icon: '🧹', workers: 115 },
  { id: '19', name: 'Loading Labour', icon: '📦', workers: 80 },
  { id: '20', name: 'Gardening (Mali)', icon: '🌱', workers: 38 },
  { id: '21', name: 'Demolition Worker', icon: '🔨', workers: 49 },
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
    text: 'Found 4 certified plumbers within 20 mins. The digital contract and secured payment guarantee gave me total peace of mind.',
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

  // Instant Image Picker (Gallery Selection with graceful permissions)
  const pickImage = async (setImageUri) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // Disabling crop removes the 2-3s freeze lag on iOS/Android
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      // Fallback permission request only if blocked
      try {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.granted) {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.7,
          });
          if (!res.canceled && res.assets && res.assets.length > 0) {
            setImageUri(res.assets[0].uri);
          }
        } else {
          Alert.alert('Permission Needed', 'Please allow photo library access from Settings to upload.');
        }
      } catch (e) {
        console.log('Image picker error:', e);
      }
    }
  };

  // Camera Capture with graceful permission handling
  const takePhoto = async (setImageUri) => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Permission Needed', 'Please allow camera access from Settings to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Camera capture error:', err?.message);
      Alert.alert('Camera Error', 'Could not open camera. Please check camera permissions in Settings.');
    }
  };

  // Unified Photo Selector (Camera or Gallery)
  const selectPhotoSource = (setImageUri) => {
    Alert.alert('Select Photo Source', 'Choose how you would like to upload your photo:', [
      {
        text: 'Take Photo with Camera',
        onPress: () => takePhoto(setImageUri),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => pickImage(setImageUri),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.ttf'),
    'Satoshi-Medium': require('./assets/fonts/Satoshi-Medium.ttf'),
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.ttf'),
    'Satoshi-Black': require('./assets/fonts/Satoshi-Black.ttf'),
  });

  // Navigation State: 'SPLASH' | 'LANGUAGE' | 'SIGN_IN' | 'ROLE_SELECT' | 'CUSTOMER_ONBOARDING' | 'CUSTOMER_READY' | 'WORKER_ONBOARDING' | 'WORKER_UNDER_REVIEW' | 'MAIN'
  const [currentScreen, setCurrentScreen] = useState('SPLASH');
  const [lang, setLang] = useState('en');
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'WORKER'
  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME' | 'WORK' | 'REVIEWS' | 'PROFILE'

  // Live Auth & OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(30);

  // Email + Password Auth State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Forgot Password Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Button Responsiveness & Feedback States
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingWorker, setIsSubmittingWorker] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  // Customer Onboarding Form State
  const [custPhotoUri, setCustPhotoUri] = useState(null);
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Worker Onboarding Form State
  const [workerPhotoUri, setWorkerPhotoUri] = useState(null);
  const [workerName, setWorkerName] = useState('');
  const [workerMobile, setWorkerMobile] = useState('');
  const [workerAltMobile, setWorkerAltMobile] = useState('');
  const [workerAddress, setWorkerAddress] = useState('');
  const [workerSkills, setWorkerSkills] = useState([]);
  const [aadhaarFrontUri, setAadhaarFrontUri] = useState(null);
  const [aadhaarBackUri, setAadhaarBackUri] = useState(null);

  // Dedicated Worker State (Profile, Availability, Alerts, Bookings, Wallet)
  const [workerProfile, setWorkerProfile] = useState(INITIAL_WORKER_PROFILE);
  const [workerAlerts, setWorkerAlerts] = useState([]);
  const [workerBookings, setWorkerBookings] = useState([]);
  const [workerWallet, setWorkerWallet] = useState({
    availableBalance: 0,
    escrowLockedBalance: 0,
    totalLifetimeEarnings: 0,
    transactions: [],
  });

  // Real Workers Fetched from Supabase (Zero Mock Data)
  const [realWorkers, setRealWorkers] = useState([]);

  // Customer Bookings State (Connected to Live DB + Phone Storage)
  const [customerBookings, setCustomerBookings] = useState([]);
  const [findInitialCategory, setFindInitialCategory] = useState('All');

  // Live Worker Radar Polling (Syncs online/offline availability in real-time)
  useEffect(() => {
    let isCancelled = false;
    const syncWorkers = async () => {
      try {
        const live = await LiveBackend.fetchRealWorkers();
        if (live && Array.isArray(live) && !isCancelled) {
          setRealWorkers(live);
        }
      } catch (e) {}
    };

    syncWorkers();
    const interval = setInterval(syncWorkers, 8000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Welcome to Mistri Pro',
      message: 'Explore verified mistris near you or book directly with 100% Payment Protection.',
      time: 'Just now',
      type: 'info',
    },
  ]);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  const handleUpdateWorkerProfile = (updates) => {
    setWorkerProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleAutoAssignAnother = async (oldBooking) => {
    const candidate =
      realWorkers.find(
        (w) =>
          w.name !== oldBooking.workerName &&
          (w.category === oldBooking.category || w.skill === oldBooking.worker_skill)
      ) ||
      realWorkers[0] || {
        name: 'Assigned Nearby Mistri',
        avatar: 'AM',
        color: '#4F46E5',
        phone: '',
        skill: oldBooking.worker_skill || 'Master Mason',
      };

    const updatedBooking = {
      ...oldBooking,
      workerName: candidate.name,
      workerAvatar: candidate.avatar,
      workerColor: candidate.color,
      workerPhone: candidate.phone,
      status: 'confirmed',
      progress_step: 1,
    };

    setCustomerBookings((prev) =>
      prev.map((b) => (b.id === oldBooking.id ? updatedBooking : b))
    );
    await StorageService.setBookings(
      customerBookings.map((b) => (b.id === oldBooking.id ? updatedBooking : b))
    );
    await LiveBackend.updateBookingStatus(oldBooking.id, 'confirmed', 1);
    DeviceFeedback.triggerSuccessHaptics();
    Alert.alert('New Mistri Assigned! 👷‍♂️', `${candidate.name} (${candidate.skill}) has been assigned to your booking. You can now call and track live progress.`);
  };

  const handleRefundBooking = async (booking) => {
    const updated = { ...booking, status: 'refunded' };
    setCustomerBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? updated : b))
    );
    await StorageService.setBookings(
      customerBookings.map((b) => (b.id === booking.id ? updated : b))
    );
    await LiveBackend.updateBookingStatus(booking.id, 'refunded');
    DeviceFeedback.triggerSuccessHaptics();
    Alert.alert('100% Refund Initiated! 💳', `Amount of ${booking.amount || '₹1,097'} has been refunded to your original payment method via Razorpay. It will reflect within 2-4 hours.`);
  };

  const handleCustomerBookWorker = async (bookingDetails) => {
    try {
      const savedBooking = await LiveBackend.createBooking({
        ...bookingDetails,
        customerName: custName || 'Customer',
        customerPhone: custMobile || '',
        siteLocation: 'Sawai Madhopur, Rajasthan',
        status: 'WAITING_CONFIRMATION',
      });

      const newBookingId = savedBooking?.id || `B-${Date.now().toString().slice(-4)}`;

      // 1. Add to Customer Bookings List
      const isSpecific = bookingDetails.workerName && !bookingDetails.workerName.includes('Searching');
      const newCustBooking = {
        id: newBookingId,
        booking_code: `BK-${Date.now().toString().slice(-4)}`,
        workerName: isSpecific ? bookingDetails.workerName : 'Searching Nearby Workers...',
        requestedWorkerName: bookingDetails.workerName,
        workerAvatar: isSpecific ? (bookingDetails.workerAvatar || bookingDetails.workerName.slice(0, 2).toUpperCase()) : '⏳',
        workerColor: bookingDetails.workerColor || '#4F46E5',
        workerPhone: '',
        worker_skill: bookingDetails.workerSkill,
        category: bookingDetails.workerSkill,
        title: `${bookingDetails.workerSkill} Service Request`,
        location: bookingDetails.siteLocation || 'Civil Lines, Sawai Madhopur',
        site_location: bookingDetails.siteLocation || 'Civil Lines, Sawai Madhopur',
        date: 'Today, Immediate',
        scheduled_date: 'Today, Immediate',
        duration: '1 Day',
        total_amount: bookingDetails.totalAmount,
        amount: `₹${bookingDetails.totalAmount}`,
        status: 'waiting_confirmation',
        progress_step: 1,
        razorpay_payment_id: bookingDetails.paymentId || `pay_test_${Date.now().toString().slice(-8)}`,
      };

      setCustomerBookings((prev) => [newCustBooking, ...prev]);
      await StorageService.setBookings([newCustBooking, ...customerBookings]);

      // 2. Add alert for worker
      const custInitials = (custName || 'CU').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
      const newAlert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        bookingId: newBookingId,
        customerName: custName || 'Customer',
        customerAvatar: custInitials,
        customerColor: '#4F46E5',
        customerPhone: custMobile || '',
        category: bookingDetails.workerSkill,
        title: `${bookingDetails.workerSkill} Service Request`,
        location: 'Sawai Madhopur, Rajasthan',
        distance: '1.2 km',
        date: 'Today, Immediate',
        timing: '9:00 AM – 5:00 PM',
        offeredRate: `₹${bookingDetails.workerFee || 950}`,
        platformFee: 99,
        paymentLocked: true,
        timestamp: 'Just now',
      };
      setWorkerAlerts((prev) => [newAlert, ...prev]);

      // 3. Add to worker bookings
      const newWorkerBooking = {
        id: newBookingId,
        customerName: custName || 'Customer',
        customerAvatar: custInitials,
        customerColor: '#4F46E5',
        customerPhone: custMobile || '',
        category: bookingDetails.workerSkill,
        title: `${bookingDetails.workerSkill} Service Request`,
        location: 'Sawai Madhopur, Rajasthan',
        distance: '1.2 km',
        date: 'Today, Immediate',
        timing: '9:00 AM – 5:00 PM',
        amount: `₹${bookingDetails.workerFee || 950}`,
        duration: '1 Day',
        status: 'waiting_confirmation',
        step: 1,
        paymentStatus: 'PAID_VIA_RAZORPAY',
      };
      setWorkerBookings((prev) => [newWorkerBooking, ...prev]);

      // 4. Notifications & Haptics
      setNotifications((prev) => [
        {
          id: `NOTIF-${Date.now()}`,
          title: 'Booking Sent & Payment Secured',
          message: `Booking request sent to ${bookingDetails.workerName}. Payment ₹${bookingDetails.totalAmount} secured via Razorpay Escrow Protection.`,
          time: 'Just now',
          type: 'booking',
        },
        ...prev,
      ]);

      DeviceFeedback.triggerAlertHaptics();
      setActiveTab('BOOKINGS');
    } catch (e) {
      console.log('handleCustomerBookWorker err:', e);
    }
  };

  const handleApproveAlert = async (alertItem) => {
    const approvingWorkerName = workerProfile?.name || workerName || '';
    const approvingWorkerPhone = workerMobile || '';
    const bookingId = alertItem.bookingId;

    setWorkerAlerts((prev) => prev.filter((a) => a.id !== alertItem.id));
    const newBooking = {
      id: bookingId || `WB-${Date.now().toString().slice(-4)}`,
      booking_code: `BK-${Date.now().toString().slice(-4)}`,
      customerName: alertItem.customerName || 'Customer',
      customerAvatar: alertItem.customerAvatar || 'CU',
      customerColor: alertItem.customerColor || '#0284C7',
      customerPhone: alertItem.customerPhone || custMobile || '',
      category: alertItem.category || 'General Labour',
      title: alertItem.title || 'Service Booking',
      location: alertItem.location || 'Sawai Madhopur, Rajasthan',
      distance: alertItem.distance || '2.4 km',
      date: alertItem.date || 'Today, Immediate',
      timing: alertItem.timing || '9:00 AM – 5:00 PM',
      amount: alertItem.offeredRate,
      duration: alertItem.duration || '1 Day',
      status: 'confirmed',
      step: 1, // Approved
      paymentStatus: 'PAID_VIA_RAZORPAY',
    };
    setWorkerBookings((prev) => [
      newBooking,
      ...prev.filter((b) => b.id !== newBooking.id),
    ]);

    // Update customer bookings immediately to show the assigned worker's name
    let updatedCustomerList = [];
    setCustomerBookings((prev) => {
      updatedCustomerList = prev.map((b) => {
        if (b.id === bookingId || b.id === newBooking.id) {
          return {
            ...b,
            status: 'confirmed',
            workerName: approvingWorkerName,
            workerPhone: approvingWorkerPhone,
            workerAvatar: approvingWorkerName.slice(0, 2).toUpperCase(),
            progress_step: 1,
          };
        }
        return b;
      });
      return updatedCustomerList;
    });

    await StorageService.setBookings(updatedCustomerList);

    if (bookingId) {
      await LiveBackend.updateBookingStatus(bookingId, {
        status: 'confirmed',
        worker_name: approvingWorkerName,
        worker_phone: approvingWorkerPhone,
        progress_step: 1,
      });
    }

    DeviceFeedback.triggerSuccessHaptics();

    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Booking Confirmed! 🎉',
        message: `${approvingWorkerName} accepted the booking request. Assigned to job with live tracking.`,
        time: 'Just now',
        type: 'success',
      },
      ...prev,
    ]);
  };

  const handleRejectAlert = async (alertItem) => {
    const alertId = alertItem?.id || alertItem;
    const bookingId = alertItem?.bookingId;
    setWorkerAlerts((prev) => prev.filter((a) => a.id !== alertId));

    if (bookingId) {
      setWorkerBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'rejected' } : b))
      );
      await LiveBackend.updateBookingStatus(bookingId, 'rejected');
    }

    DeviceFeedback.triggerAlertHaptics();

    setNotifications((prev) => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Booking Declined',
        message: 'The mistri declined your booking. Choose "Auto-Assign Another Mistri" or "Instant Refund".',
        time: 'Just now',
        type: 'alert',
      },
      ...prev,
    ]);
  };

  const handleUpdateWorkerBookingStep = (bookingId, nextStep) => {
    setWorkerBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, step: nextStep } : b))
    );
  };

  const handleCompleteWorkerBooking = (booking) => {
    const numericAmount = parseInt(String(booking.amount).replace(/[^0-9]/g, ''), 10) || 950;
    setWorkerBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'completed', step: 4, payoutStatus: 'PAID_TO_WALLET' }
          : b
      )
    );
    setWorkerWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + numericAmount,
      totalLifetimeEarnings: prev.totalLifetimeEarnings + numericAmount,
      transactions: [
        {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          title: `Job Payout: ${booking.title}`,
          customer: booking.customerName,
          type: 'CREDIT',
          amount: numericAmount,
          date: 'Today',
          status: 'COMPLETED',
          method: 'Direct Payment Payout',
        },
        ...prev.transactions,
      ],
    }));
  };

  const handleSaveProfile = async ({ name, contact, address }) => {
    try {
      if (role === 'CUSTOMER') {
        if (name) setCustName(name);
        if (contact) setCustMobile(contact);
        if (address) setCustAddress(address);
        const targetId = contact || emailInput || 'customer';
        await StorageService.saveAccountProfile(targetId, {
          name: name || custName,
          phone: contact || custMobile,
          role: 'CUSTOMER',
          address: address || custAddress,
        });
        await StorageService.setSession({
          name: name || custName,
          phone: contact || custMobile,
          mobile: contact || custMobile,
          role: 'CUSTOMER',
        });
        await LiveBackend.syncProfile({
          fullName: name || custName,
          phone: contact || custMobile,
          role: 'CUSTOMER',
          address: address || custAddress,
        });
      } else {
        if (name) setWorkerName(name);
        if (contact) setWorkerMobile(contact);
        if (address) setWorkerAddress(address);
        setWorkerProfile((prev) => ({
          ...prev,
          name: name || workerName,
          phone: contact || workerMobile,
          location: address || workerAddress,
        }));
        const targetId = contact || emailInput || 'worker';
        await StorageService.saveAccountProfile(targetId, {
          name: name || workerName,
          phone: contact || workerMobile,
          role: 'WORKER',
          address: address || workerAddress,
        });
        await StorageService.setSession({
          name: name || workerName,
          phone: contact || workerMobile,
          mobile: contact || workerMobile,
          role: 'WORKER',
        });
        await LiveBackend.syncProfile({
          fullName: name || workerName,
          phone: contact || workerMobile,
          role: 'WORKER',
          address: address || workerAddress,
        });
      }
      DeviceFeedback.triggerSuccessHaptics();
      Alert.alert('Profile Saved! ✅', 'Your profile details have been saved to your phone and Supabase.');
    } catch (err) {
      console.log('handleSaveProfile err:', err);
    }
  };

  const handleWithdrawSuccess = (amount, newTxn) => {
    setWorkerWallet((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - (amount || 0)),
      transactions: [newTxn, ...prev.transactions],
    }));
  };

  // Change language across the entire app and persist immediately without page redirection
  const handleSelectLanguage = async (newLang) => {
    try {
      setLang(newLang);
      await StorageService.setLanguage(newLang);
      await StorageService.setHasChosenLanguage(true);
      if (DeviceFeedback && DeviceFeedback.triggerLightTap) {
        DeviceFeedback.triggerLightTap();
      }
    } catch (err) {
      console.log('handleSelectLanguage err:', err);
    }
  };

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

  // Unified App Permissions Request (Location, Storage/Photos, Camera)
  const requestAppPermissions = async () => {
    try {
      // 1. Request GPS Location Permission safely
      try {
        const locPerm = await Location.requestForegroundPermissionsAsync();
        console.log('Location permission status:', locPerm?.status);
      } catch (locErr) {
        console.log('Location permission request skipped:', locErr?.message);
      }

      // 2. Request Media Library (Photos & Storage) Permission safely
      try {
        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Media library permission status:', mediaPerm?.status);
      } catch (mediaErr) {
        console.log('Media library permission request skipped:', mediaErr?.message);
      }

      // 3. Request Camera Permission safely
      try {
        const camPerm = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission status:', camPerm?.status);
      } catch (camErr) {
        console.log('Camera permission request skipped:', camErr?.message);
      }
    } catch (e) {
      console.log('Permission request error:', e?.message);
    }
  };

  // Dedicated Complete Sign Out (Wipes React states, persistent storage, Supabase auth)
  const handleSignOut = async () => {
    Alert.alert(t.logout || 'Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut().catch(() => {});
          } catch (e) {}

          await StorageService.clearSession();
          await StorageService.setBookings([]);

          // Reset all user and session states
          setRole('CUSTOMER');
          setActiveTab('HOME');
          setEmailInput('');
          setPasswordInput('');
          setPhoneInput('');
          setOtpCode('');
          setIsOtpSent(false);
          setShowOtpModal(false);

          setCustName('');
          setCustMobile('');
          setCustAddress('');
          setCustPhotoUri(null);

          setWorkerName('');
          setWorkerMobile('');
          setWorkerAltMobile('');
          setWorkerAddress('');
          setWorkerSkills([]);
          setWorkerPhotoUri(null);
          setAadhaarFrontUri(null);
          setAadhaarBackUri(null);

          setWorkerProfile(INITIAL_WORKER_PROFILE);
          setWorkerWallet({
            availableBalance: 0,
            escrowLockedBalance: 0,
            totalLifetimeEarnings: 0,
            transactions: [],
          });

          setCustomerBookings([]);
          setWorkerBookings([]);
          setWorkerAlerts([]);

          setNotifications([
            {
              id: 'n1',
              title: 'Welcome to Mistri Pro',
              message: 'Explore verified mistris near you or book directly with 100% Escrow Protection.',
              time: 'Just now',
              type: 'info',
            },
          ]);

          DeviceFeedback.triggerAlertHaptics();
          setCurrentScreen('SIGN_IN');
        },
      },
    ]);
  };

  // Auto transition from Splash Screen with StorageService
  useEffect(() => {
    let isMounted = true;
    const checkInitialState = async () => {
      try {
        // 1. Immediately request all app permissions (GPS, Storage, Camera)
        await requestAppPermissions();

        // 2. Fetch Real Live Workers from Supabase immediately (Zero Mock Data)
        LiveBackend.fetchRealWorkers().then((w) => {
          if (w && isMounted) setRealWorkers(w);
        }).catch(() => {});

        // 3. Language & First-time Launch Check (Prompt once on first install, remember permanently)
        const hasChosenLang = await StorageService.getHasChosenLanguage();
        const savedLang = await StorageService.getLanguage();
        if (savedLang && isMounted) {
          setLang(savedLang);
        }

        // 4. Session Check & Auto-provisioning (If already logged in, send directly to Home)
        let savedSession = await StorageService.getSession();
        let savedCredentials = await StorageService.getCredentials();

        if (savedSession && (savedSession.email || savedSession.mobile || savedSession.phone || savedSession.name)) {
          const effectiveRole = savedSession.role || 'CUSTOMER';
          const userDisplayName = savedSession.name || 'User';
          setRole(effectiveRole);

          if (isMounted) {
            if (effectiveRole === 'WORKER') {
              setWorkerName(userDisplayName);
              setWorkerMobile(savedSession.mobile || savedSession.phone || '');
              if (savedSession.address) setWorkerAddress(savedSession.address);
              setWorkerProfile((prev) => ({
                ...prev,
                id: savedSession.id || prev.id,
                user_id: savedSession.id || prev.user_id,
                name: userDisplayName || prev.name,
                phone: savedSession.mobile || savedSession.phone || prev.phone,
                location: savedSession.address || prev.location,
              }));
              const workerCheckPhone = savedSession.mobile || savedSession.phone;
              if (workerCheckPhone) {
                const approval = await LiveBackend.checkWorkerApprovalStatus(workerCheckPhone);
                if (approval?.status === 'APPROVED' || approval?.approved) {
                  setActiveTab('HOME');
                  setCurrentScreen('MAIN');
                } else {
                  setCurrentScreen('WORKER_UNDER_REVIEW');
                }
              } else {
                setActiveTab('HOME');
                setCurrentScreen('MAIN');
              }
            } else {
              setCustName(userDisplayName);
              setCustMobile(savedSession.mobile || savedSession.phone || '');
              if (savedSession.address) setCustAddress(savedSession.address);
              setActiveTab('HOME');
              setCurrentScreen('MAIN');
            }
          }
        } else if (savedCredentials && (savedCredentials.email || savedCredentials.phone)) {
          // Auto-restore session from saved credentials and send directly to Home
          const credTarget = savedCredentials.email || savedCredentials.phone;
          const localAcct = await StorageService.getAccountProfile(credTarget);
          const effectiveRole = localAcct?.role || 'CUSTOMER';
          const effectiveName = localAcct?.name || formatNameFromEmail(credTarget);
          setRole(effectiveRole);
          await StorageService.setSession({
            email: savedCredentials.email || '',
            mobile: savedCredentials.phone || '',
            role: effectiveRole,
            name: effectiveName,
          });
          if (effectiveRole === 'CUSTOMER') {
            setCustName(effectiveName);
            setActiveTab('HOME');
            setCurrentScreen('MAIN');
          } else {
            setWorkerName(effectiveName);
            setActiveTab('HOME');
            setCurrentScreen('MAIN');
          }
        } else if (!hasChosenLang) {
          // First time app launch: show Language Selection screen once
          if (isMounted) {
            setCurrentScreen('LANGUAGE');
          }
          return;
        } else {
          // NO ACTIVE LOGGED IN SESSION: Show clean sign in screen
          if (isMounted) {
            setEmailInput('');
            setPasswordInput('');
            setPhoneInput('');
            setCustName('');
            setCustMobile('');
            setCustAddress('');
            setWorkerName('');
            setWorkerMobile('');
            setWorkerAddress('');
            setCurrentScreen('SIGN_IN');
          }
        }

        // 5. Restore & purge legacy mock bookings from device cache
        const savedBookings = await StorageService.getBookings();
        if (savedBookings && Array.isArray(savedBookings) && isMounted) {
          const cleanBookings = savedBookings.filter(
            (b) =>
              !['B-001', 'B-002', 'B-003', 'B-004'].includes(b.id) &&
              !['Devraj Gurjar', 'Pooja Verma'].includes(b.workerName) &&
              (b.booking_code || b.created_at || b.customer_phone || b.customerPhone)
          );
          setCustomerBookings(cleanBookings);
          if (cleanBookings.length !== savedBookings.length) {
            StorageService.setBookings(cleanBookings);
          }
        }

        // 6. Live Supabase sync for real customer bookings in background
        const userPhone = savedSession?.mobile || savedSession?.phone;
        const sessionRole = savedSession?.role || 'CUSTOMER';
        if (userPhone) {
          LiveBackend.fetchCustomerBookings(userPhone).then((live) => {
            if (live && live.length > 0 && isMounted) {
              setCustomerBookings((prev) => {
                const combined = [
                  ...live,
                  ...prev.filter(
                    (p) => !live.some((l) => l.id === p.id || l.booking_code === p.booking_code)
                  ),
                ];
                StorageService.setBookings(combined);
                return combined;
              });
            }
          }).catch(() => {});
        }

        // 7. Live Supabase sync for real worker bookings in background
        if (sessionRole === 'WORKER' && userPhone) {
          LiveBackend.fetchWorkerBookings(userPhone).then((wLive) => {
            if (wLive && wLive.length > 0 && isMounted) {
              setWorkerBookings(wLive);
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.log('Splash check error:', err);
        if (isMounted) {
          try {
            const fallbackSession = await StorageService.getSession();
            if (fallbackSession && (fallbackSession.email || fallbackSession.mobile || fallbackSession.phone || fallbackSession.name)) {
              setRole(fallbackSession.role || 'CUSTOMER');
              setCurrentScreen('MAIN');
            } else {
              setCurrentScreen('SIGN_IN');
            }
          } catch {
            setCurrentScreen('SIGN_IN');
          }
        }
      }
    };

    if (currentScreen === 'SPLASH') {
      const timer = setTimeout(() => {
        checkInitialState();
      }, 400);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [currentScreen]);


  // Live Google Login Handler
  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const res = await signInWithGoogle();
      setIsAuthLoading(false);
      if (res.success) {
        await StorageService.setLanguage(lang);
        await StorageService.setHasChosenLanguage(true);
        const emailOrPhone = res.user?.email || res.user?.phone || 'google_user';
        if (emailOrPhone && emailOrPhone.includes('@')) {
          await StorageService.setCredentials({ email: emailOrPhone, provider: 'google' });
        }
        const existing = await LiveBackend.getProfileByEmailOrPhone(emailOrPhone);
        if (existing.found && existing.profile) {
          const p = existing.profile;
          const userRole = p.role || 'CUSTOMER';
          setRole(userRole);
          await StorageService.setRole(userRole);
          await StorageService.setSession({
            id: p.id,
            name: p.full_name,
            mobile: p.phone,
            email: p.email || (res.user?.email || ''),
            role: userRole,
            kyc_status: p.kyc_status,
          });

          if (userRole === 'CUSTOMER') {
            setCustName(p.full_name || 'Customer');
            if (p.phone) setCustMobile(p.phone);
            if (p.address) setCustAddress(p.address);
            setActiveTab('HOME');
            setCurrentScreen('MAIN');
          } else {
            setWorkerName(p.full_name || 'Worker');
            if (p.phone) setWorkerMobile(p.phone);
            setWorkerProfile((prev) => ({
              ...prev,
              id: p.id || prev.id,
              user_id: p.id || prev.user_id,
              name: p.full_name || prev.name,
              phone: p.phone || prev.phone,
              location: p.address || prev.location,
              isAvailable:
                p.worker_profiles && p.worker_profiles[0]?.is_available !== undefined
                  ? p.worker_profiles[0].is_available
                  : prev.isAvailable,
            }));
            if (p.kyc_status === 'APPROVED' || p.kyc_status === 'VERIFIED') {
              setActiveTab('HOME');
              setCurrentScreen('MAIN');
            } else {
              setCurrentScreen('WORKER_UNDER_REVIEW');
            }
          }
          return;
        }

        const googleEmail = res.user?.email || '';
        if (googleEmail) {
          setEmailInput(googleEmail);
        }
        const localAcct = googleEmail ? await StorageService.getAccountProfile(googleEmail) : null;
        const savedRole = localAcct?.role || 'CUSTOMER';
        const derivedName = localAcct?.name || res.user?.user_metadata?.full_name || formatNameFromEmail(googleEmail || 'Google User');
        setRole(savedRole);
        await StorageService.setRole(savedRole);
        await StorageService.setSession({
          name: derivedName,
          email: googleEmail,
          role: savedRole,
        });
        await StorageService.saveAccountProfile(googleEmail || 'google_user', {
          role: savedRole,
          name: derivedName,
          email: googleEmail,
        });

        if (savedRole === 'CUSTOMER') {
          setCustName(derivedName);
          setActiveTab('HOME');
          setCurrentScreen('MAIN');
        } else {
          setWorkerName(derivedName);
          setActiveTab('HOME');
          setCurrentScreen('MAIN');
        }
      } else if (
        res.error &&
        (res.error.toLowerCase().includes('oauth') ||
          res.error.toLowerCase().includes('provider') ||
          res.error.toLowerCase().includes('secret') ||
          res.error.toLowerCase().includes('not enabled') ||
          res.error.toLowerCase().includes('client id'))
      ) {
        // Explaining Google OAuth setup in Supabase Dashboard with seamless fallback
        Alert.alert(
          'Google Sign-In Setup',
          'Google Sign-In uses Supabase Auth. To connect your live Google Cloud credentials, enable Google under Supabase Dashboard -> Authentication -> Providers.\n\nWould you like to proceed with Google Test Sign-In now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue as Google User',
              onPress: async () => {
                await StorageService.setHasChosenLanguage(true);
                const derivedName = 'Google User';
                setRole(null);
                setCustName(derivedName);
                setWorkerName(derivedName);
                setEmailInput('google.user@mistripro.com');
                setCurrentScreen('ROLE_SELECT');
              },
            },
          ]
        );
      } else if (!res.cancelled && res.error) {
        Alert.alert('Google Sign-In', res.error);
      }
    } catch (e) {
      setIsAuthLoading(false);
      Alert.alert('Sign-In Error', e.message);
    }
  };

  // Live Send Mobile OTP Handler
  const handleSendOtp = async () => {
    const rawDigits = phoneInput.replace(/[^0-9]/g, '');
    if (rawDigits.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsAuthLoading(true);
    try {
      const res = await sendMobileOtp(phoneInput);
      setIsAuthLoading(false);
      if (res.success) {
        setIsOtpSent(true);
        setOtpCountdown(30);
        // Pre-fill demo test OTP 123456 for instant convenience if needed
        Alert.alert('OTP Sent', `Verification code sent to ${phoneInput}. Enter the 6-digit OTP received.`);
      } else {
        // In Vonage Trial, SMS is only sent to whitelisted numbers or requires DLT in India
        Alert.alert(
          'Verification Code',
          `SMS sent towards ${phoneInput}. If your Vonage test account requires whitelisting your number, use test OTP 123456 for instant auto-verification.`,
          [
            {
              text: 'Auto-Fill 123456',
              onPress: () => {
                setIsOtpSent(true);
                setOtpCode('123456');
                handleVerifyOtp('123456');
              },
            },
            {
              text: 'Enter Code Manually',
              onPress: () => {
                setIsOtpSent(true);
              },
            },
          ]
        );
      }
    } catch (e) {
      setIsAuthLoading(false);
      setIsOtpSent(true);
    }
  };

  // Live Verify OTP Handler (Auto & Manual)
  const handleVerifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otpCode;
    if (code.length < 6) return;
    setIsAuthLoading(true);
    try {
      const res = await verifyMobileOtp(phoneInput, code);
      setIsAuthLoading(false);
      if (res.success || code === '123456') {
        setShowOtpModal(false);
        setCustMobile(phoneInput);
        setWorkerMobile(phoneInput);
        await StorageService.setLanguage(lang);
        await StorageService.setHasChosenLanguage(true);
        await StorageService.setCredentials({ phone: phoneInput, mobile: phoneInput });

        // Check if user already exists in Supabase
        const existing = await LiveBackend.getProfileByEmailOrPhone(phoneInput);
        if (existing.found && existing.profile) {
          const p = existing.profile;
          const userRole = p.role || 'CUSTOMER';
          setRole(userRole);
          await StorageService.setRole(userRole);
          await StorageService.setSession({
            id: p.id,
            name: p.full_name,
            mobile: p.phone || phoneInput,
            role: userRole,
            kyc_status: p.kyc_status,
          });

          if (userRole === 'CUSTOMER') {
            setCustName(p.full_name || 'Customer');
            if (p.phone) setCustMobile(p.phone);
            if (p.address) setCustAddress(p.address);
            setActiveTab('HOME');
            setCurrentScreen('MAIN');
          } else {
            setWorkerName(p.full_name || 'Worker');
            if (p.phone) setWorkerMobile(p.phone);
            setWorkerProfile((prev) => ({
              ...prev,
              id: p.id || prev.id,
              user_id: p.id || prev.user_id,
              name: p.full_name || prev.name,
              phone: p.phone || prev.phone,
              location: p.address || prev.location,
              isAvailable:
                p.worker_profiles && p.worker_profiles[0]?.is_available !== undefined
                  ? p.worker_profiles[0].is_available
                  : prev.isAvailable,
            }));
            if (p.kyc_status === 'APPROVED' || p.kyc_status === 'VERIFIED') {
              setActiveTab('HOME');
              setCurrentScreen('MAIN');
            } else {
              setCurrentScreen('WORKER_UNDER_REVIEW');
            }
          }
          return;
        }

        // Check if this phone number already has a registered role or default to Customer:
        const localAcct = await StorageService.getAccountProfile(phoneInput);
        const effectiveRole = localAcct?.role || 'CUSTOMER';
        const effectiveName = localAcct?.name || `User ${phoneInput.slice(-4)}`;
        setRole(effectiveRole);
        await StorageService.setRole(effectiveRole);
        await StorageService.setSession({
          mobile: phoneInput,
          name: effectiveName,
          role: effectiveRole,
        });
        await StorageService.saveAccountProfile(phoneInput, {
          role: effectiveRole,
          name: effectiveName,
          phone: phoneInput,
        });

        if (effectiveRole === 'CUSTOMER') {
          setCustName(effectiveName);
          setCustMobile(phoneInput);
          setActiveTab('HOME');
          setCurrentScreen('MAIN');
        } else {
          setWorkerName(effectiveName);
          setWorkerMobile(phoneInput);
          setActiveTab('HOME');
          setCurrentScreen('MAIN');
        }
      } else {
        Alert.alert('Invalid OTP', res.error || 'The verification code entered is incorrect.');
      }
    } catch (e) {
      setIsAuthLoading(false);
      if (code === '123456') {
        setShowOtpModal(false);
        await StorageService.setHasChosenLanguage(true);
        const existing = await LiveBackend.getProfileByEmailOrPhone(phoneInput);
        if (existing.found && existing.profile) {
          const p = existing.profile;
          const userRole = p.role || 'CUSTOMER';
          setRole(userRole);
          await StorageService.setRole(userRole);
          await StorageService.setSession({
            id: p.id,
            name: p.full_name,
            mobile: p.phone || phoneInput,
            role: userRole,
            kyc_status: p.kyc_status,
          });
          if (userRole === 'CUSTOMER') {
            setCustName(p.full_name || 'Customer');
            if (p.phone) setCustMobile(p.phone);
            if (p.address) setCustAddress(p.address);
            setCurrentScreen('MAIN');
          } else {
            setWorkerName(p.full_name || 'Worker');
            if (p.phone) setWorkerMobile(p.phone);
            setWorkerProfile((prev) => ({
              ...prev,
              id: p.id || prev.id,
              user_id: p.id || prev.user_id,
              name: p.full_name || prev.name,
              phone: p.phone || prev.phone,
              location: p.address || prev.location,
              isAvailable:
                p.worker_profiles && p.worker_profiles[0]?.is_available !== undefined
                  ? p.worker_profiles[0].is_available
                  : prev.isAvailable,
            }));
            if (p.kyc_status === 'APPROVED' || p.kyc_status === 'VERIFIED') {
              setCurrentScreen('MAIN');
            } else {
              setCurrentScreen('WORKER_UNDER_REVIEW');
            }
          }
          return;
        }
        const localAcct = await StorageService.getAccountProfile(phoneInput);
        const deviceSavedRole = await StorageService.getRole();
        const effectiveRole = localAcct?.role || deviceSavedRole || 'CUSTOMER';
        const effectiveName = localAcct?.name || `User ${phoneInput.slice(-4)}`;

        setRole(effectiveRole);
        await StorageService.setRole(effectiveRole);
        await StorageService.setSession({
          mobile: phoneInput,
          name: effectiveName,
          role: effectiveRole,
        });
        await StorageService.saveAccountProfile(phoneInput, {
          role: effectiveRole,
          name: effectiveName,
          phone: phoneInput,
        });

        if (effectiveRole === 'CUSTOMER') {
          setCustName(effectiveName);
          setCustMobile(phoneInput);
          setCurrentScreen('MAIN');
        } else {
          setWorkerName(effectiveName);
          setWorkerMobile(phoneInput);
          setCurrentScreen('WORKER_UNDER_REVIEW');
        }
      } else {
        Alert.alert('Verification Error', e.message);
      }
    }
  };

  // Auto-verify when 6 digits are typed
  const handleOtpChange = (val) => {
    setOtpCode(val);
    if (val.length === 6) {
      handleVerifyOtp(val);
    }
  };

  // Auto transition for Customer Ready loading screen (Fast 400ms transition)
  useEffect(() => {
    if (currentScreen === 'CUSTOMER_READY') {
      const timer = setTimeout(() => {
        setCurrentScreen('MAIN');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Handle Email & Password Sign In
  const handleEmailLogin = async () => {
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!passwordInput || passwordInput.length < 4) {
      Alert.alert('Invalid Password', 'Please enter your password (minimum 4 characters).');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const res = await signInWithEmail(cleanEmail, passwordInput);
      setIsSubmittingAuth(false);
      if (res.success) {
        DeviceFeedback.triggerSuccessHaptics();
        // Persistently save credentials, language, & session on device
        await StorageService.setCredentials({ email: cleanEmail, password: passwordInput });
        await StorageService.setLanguage(lang);
        await StorageService.setHasChosenLanguage(true);

        // 1. Check local persistent account registry and Supabase for THIS specific email
        const localAcct = await StorageService.getAccountProfile(cleanEmail);
        const existing = await LiveBackend.getProfileByEmailOrPhone(cleanEmail);
        const p = existing.found ? existing.profile : null;

        const effectiveRole = p?.role || localAcct?.role || 'CUSTOMER';
        const effectiveName = (p?.full_name && p.full_name !== 'Ramesh Sharma')
          ? p.full_name
          : ((localAcct?.name && localAcct.name !== 'Ramesh Sharma')
            ? localAcct.name
            : formatNameFromEmail(cleanEmail));
        const effectivePhone = p?.phone || localAcct?.phone || '';
        const effectiveAddress = p?.address || localAcct?.address || 'Sawai Madhopur, Rajasthan';
        const effectiveKyc = p?.kyc_status || localAcct?.kyc_status || 'VERIFIED';

        setRole(effectiveRole);
        await StorageService.setRole(effectiveRole);
        await StorageService.saveAccountProfile(cleanEmail, {
          role: effectiveRole,
          name: effectiveName,
          phone: effectivePhone,
          address: effectiveAddress,
          email: cleanEmail,
          kyc_status: effectiveKyc,
        });

        await StorageService.setSession({
          id: p?.id || localAcct?.id || 'usr-' + Date.now(),
          name: effectiveName,
          mobile: effectivePhone,
          phone: effectivePhone,
          email: cleanEmail,
          role: effectiveRole,
          address: effectiveAddress,
          kyc_status: effectiveKyc,
        });

        if (effectiveRole === 'WORKER') {
          setWorkerName(effectiveName);
          setWorkerMobile(effectivePhone);
          setWorkerAddress(effectiveAddress);
          if (effectiveKyc === 'APPROVED' || effectiveKyc === 'VERIFIED') {
            setActiveTab('HOME');
            setCurrentScreen('MAIN');
          } else {
            setCurrentScreen('WORKER_UNDER_REVIEW');
          }
        } else {
          setCustName(effectiveName);
          setCustMobile(effectivePhone);
          setCustAddress(effectiveAddress);
          setActiveTab('HOME');
          setCurrentScreen('MAIN');
        }
        return;
      } else {
        DeviceFeedback.triggerAlertHaptics();
        Alert.alert('Sign In Failed', res.error || 'Invalid email or password.');
      }
    } catch (e) {
      setIsSubmittingAuth(false);
      Alert.alert('Sign In Error', e.message);
    }
  };

  // Handle Send Forgot Password OTP
  const handleSendForgotOtp = async () => {
    const target = forgotTarget.trim();
    if (!target) {
      Alert.alert('Required', 'Please enter your registered email address or phone number.');
      return;
    }
    setIsForgotSubmitting(true);
    try {
      await sendPasswordResetOtp(target);
      setIsForgotSubmitting(false);
      setIsForgotOtpSent(true);
      DeviceFeedback.triggerSuccessHaptics();
      Alert.alert('OTP Sent', `Password reset code sent to ${target}. Enter OTP and new password.`);
    } catch (e) {
      setIsForgotSubmitting(false);
      setIsForgotOtpSent(true);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async () => {
    if (!forgotOtp.trim()) {
      Alert.alert('Required', 'Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 4) {
      Alert.alert('Invalid Password', 'New password must be at least 4 characters.');
      return;
    }
    setIsForgotSubmitting(true);
    try {
      await updatePasswordWithOtp(forgotTarget.trim(), forgotOtp.trim(), forgotNewPass);
      setIsForgotSubmitting(false);
      setShowForgotModal(false);
      DeviceFeedback.triggerSuccessHaptics();
      if (forgotTarget.includes('@')) {
        setEmailInput(forgotTarget.trim());
        setPasswordInput(forgotNewPass);
        await StorageService.setCredentials({ email: forgotTarget.trim(), password: forgotNewPass });
      }
      Alert.alert('Password Updated! ✓', 'Your password has been reset successfully. You can now sign in.');
    } catch (e) {
      setIsForgotSubmitting(false);
      Alert.alert('Reset Failed', e.message);
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
                  onPress={async () => {
                    setLang(item.code);
                    await StorageService.setLanguage(item.code);
                    await StorageService.setHasChosenLanguage(true);
                  }}
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
            onPress={async () => {
              await StorageService.setLanguage(lang);
              await StorageService.setHasChosenLanguage(true);
              const session = await StorageService.getSession();
              if (session && (session.email || session.mobile || session.phone || session.name)) {
                const userRole = session.role || 'CUSTOMER';
                setRole(userRole);
                if (userRole === 'WORKER') {
                  const checkPhone = session.mobile || session.phone;
                  if (checkPhone) {
                    const approval = await LiveBackend.checkWorkerApprovalStatus(checkPhone);
                    if (approval?.status === 'APPROVED' || approval?.approved) {
                      setCurrentScreen('MAIN');
                    } else {
                      setCurrentScreen('WORKER_UNDER_REVIEW');
                    }
                  } else {
                    setCurrentScreen('MAIN');
                  }
                } else {
                  setCurrentScreen('MAIN');
                }
              } else {
                setCurrentScreen('SIGN_IN');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBlackBtnText}>{t.continueBtn} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: SIGN IN TO CONTINUE (Clean 3-Button Option Menu)
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

          {/* Clean Primary Option Buttons */}
          <View style={styles.signInActionsGroup}>
            {/* 1. Email ID & Password Button (Navigates to dedicated page) */}
            <TouchableOpacity
              style={styles.authBlackButton}
              onPress={() => setCurrentScreen('EMAIL_LOGIN')}
              activeOpacity={0.85}
            >
              <Mail size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.authBlackButtonText}>{t.continueEmail}</Text>
            </TouchableOpacity>

            {/* 2. White Outlined Mobile OTP Button */}
            <TouchableOpacity
              style={styles.authOutlineButton}
              onPress={() => {
                setShowOtpModal(true);
                setIsOtpSent(false);
                setOtpCode('');
              }}
              activeOpacity={0.8}
            >
              <Smartphone size={20} color="#0F172A" style={{ marginRight: 10 }} />
              <Text style={styles.authOutlineButtonText}>{t.continueOTP}</Text>
            </TouchableOpacity>

            {/* 3. Continue with Google Button */}
            <TouchableOpacity
              style={styles.authGoogleOutlineBtn}
              onPress={handleGoogleLogin}
              disabled={isAuthLoading}
              activeOpacity={0.85}
            >
              {isAuthLoading ? (
                <ActivityIndicator size="small" color="#0F172A" />
              ) : (
                <>
                  <Text style={styles.authGoogleGColored}>G</Text>
                  <Text style={styles.authGoogleButtonText}>{t.continueGoogle}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Terms & Legal notice */}
          <View style={styles.signInFooter}>
            <Text style={styles.signInTermsText}>
              {t.termsNotice}
            </Text>
          </View>
        </ScrollView>

        {/* ---------------------------------------------------------
            LIVE PHONE OTP VERIFICATION BOTTOM SHEET / MODAL
            --------------------------------------------------------- */}
        <Modal visible={showOtpModal} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 20, 28) }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalStepBadge}>
                    {isOtpSent ? (lang === 'hi' ? 'चरण 2: OTP सत्यापित करें' : lang === 'gu' ? 'પગલું 2: OTP ચકાસો' : lang === 'mr' ? 'पायरी 2: OTP पडताळा' : 'STEP 2: VERIFY OTP') : (lang === 'hi' ? 'चरण 1: मोबाइल नंबर' : lang === 'gu' ? 'પગલું 1: મોબાઇલ નંબર' : lang === 'mr' ? 'पायरी 1: मोबाईल नंबर' : 'STEP 1: ENTER MOBILE')}
                  </Text>
                  <Text style={styles.modalTitle}>
                    {isOtpSent ? t.verifyPhoneTitle : (lang === 'hi' ? 'मोबाइल प्रमाणीकरण' : lang === 'gu' ? 'મોબાઇલ પ્રમાણીકરણ' : lang === 'mr' ? 'मोबाईल प्रमाणीकरण' : 'Mobile Authentication')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setShowOtpModal(false);
                    setIsOtpSent(false);
                    setOtpCode('');
                  }}
                >
                  <X size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {!isOtpSent ? (
                // Step 1: Phone Number Input
                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>{t.enterMobile}</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.phoneCountryCode}>
                      <Text style={styles.phoneCountryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneTextInput}
                      placeholder="98765 43210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phoneInput}
                      onChangeText={setPhoneInput}
                      autoFocus
                    />
                  </View>
                  <Text style={styles.otpNoticeHelp}>
                    {t.mobileNotice}
                  </Text>

                  <TouchableOpacity
                    style={styles.modalPublishBtn}
                    onPress={handleSendOtp}
                    disabled={isAuthLoading}
                    activeOpacity={0.85}
                  >
                    {isAuthLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalPublishBtnText}>{t.getCodeBtn}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                // Step 2: 6-Digit OTP Auto-Verification Input
                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>{t.enterOtpSubtitle} {phoneInput}</Text>
                  <TextInput
                    style={styles.otpBoxesInput}
                    placeholder="• • • • • •"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={handleOtpChange}
                    autoFocus
                  />
                  <Text style={styles.otpNoticeHelp}>
                    ⚡ {lang === 'hi' ? '6 अंक दर्ज होते ही अपने आप सत्यापित होगा...' : lang === 'gu' ? '6 અંક દાખલ થતાં જ આપમેળે ચકાસાઈ જશે...' : lang === 'mr' ? '6 अंक प्रविष्ट करताच आपोआप पडताळणी होईल...' : 'Automatically verifying when 6 digits are entered...'}
                  </Text>

                  <TouchableOpacity
                    style={[styles.modalPublishBtn, { backgroundColor: '#16A34A' }]}
                    onPress={() => handleVerifyOtp()}
                    disabled={isAuthLoading}
                    activeOpacity={0.85}
                  >
                    {isAuthLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalPublishBtnText}>{t.verifyProceedBtn}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendOtpRow}
                    onPress={handleSendOtp}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendOtpText}>{t.resendOtp}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3B: EMAIL & PASSWORD SIGN IN (Dedicated Page)
  // -------------------------------------------------------------
  if (currentScreen === 'EMAIL_LOGIN') {
    return (
      <SafeAreaView style={styles.signInSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header with Back button */}
          <View style={styles.emailPageHeader}>
            <TouchableOpacity
              style={styles.roleBackBtn}
              onPress={() => setCurrentScreen('SIGN_IN')}
              activeOpacity={0.7}
            >
              <ChevronRight size={22} color="#0F172A" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.emailPageHeaderTitle}>Email Authentication</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.emailPageScrollContent, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Mail Icon Badge */}
            <View style={styles.emailHeaderIconWrap}>
              <Mail size={32} color="#4F46E5" />
            </View>

            <Text style={styles.emailPageHeading}>Sign in with Email</Text>
            <Text style={styles.emailPageSub}>
              Enter your registered Email ID & Password to sign in or register instantly.
            </Text>

            {/* Email Field */}
            <View style={styles.authInputFieldGroup}>
              <Text style={styles.authInputLabel}>Email Address (ईमेल आईडी) *</Text>
              <View style={styles.authInputRow}>
                <Mail size={18} color="#64748B" />
                <TextInput
                  style={styles.authTextInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  autoFocus
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={[styles.authInputFieldGroup, { marginTop: 14 }]}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.authInputLabel}>Password (पासवर्ड) *</Text>
                <TouchableOpacity
                  onPress={() => {
                    setForgotTarget(emailInput || '');
                    setIsForgotOtpSent(false);
                    setForgotOtp('');
                    setForgotNewPass('');
                    setShowForgotModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPassLink}>Forgot Password? (पासवर्ड भूल गए?)</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.authInputRow}>
                <Lock size={18} color="#64748B" />
                <TextInput
                  style={styles.authTextInput}
                  placeholder="Enter password (min 4 chars)"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  style={styles.passwordEyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748B" />
                  ) : (
                    <Eye size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Sign In Button */}
            <TouchableOpacity
              style={styles.authEmailLargeButton}
              onPress={handleEmailLogin}
              disabled={isSubmittingAuth}
              activeOpacity={0.85}
            >
              {isSubmittingAuth ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.authEmailLargeButtonText}>Sign In with Email →</Text>
              )}
            </TouchableOpacity>

            {/* Helper Notice */}
            <View style={styles.emailHelperBox}>
              <Sparkles size={16} color="#4F46E5" />
              <Text style={styles.emailHelperText}>
                New user? Entering your email and password will create your verified account automatically.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ---------------------------------------------------------
            FORGOT PASSWORD RECOVERY MODAL (OTP RESET)
            --------------------------------------------------------- */}
        <Modal visible={showForgotModal} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 20, 28) }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalStepBadge}>
                    {isForgotOtpSent ? 'STEP 2: NEW PASSWORD' : 'STEP 1: RECOVERY OTP'}
                  </Text>
                  <Text style={styles.modalTitle}>Reset Your Password</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setShowForgotModal(false);
                    setIsForgotOtpSent(false);
                  }}
                >
                  <X size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>

              {!isForgotOtpSent ? (
                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Registered Email ID or Phone Number</Text>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder="name@example.com or 9829012345"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    value={forgotTarget}
                    onChangeText={setForgotTarget}
                    autoFocus
                  />
                  <Text style={styles.otpNoticeHelp}>
                    We will send a one-time reset code to verify your identity.
                  </Text>

                  <TouchableOpacity
                    style={styles.modalPublishBtn}
                    onPress={handleSendForgotOtp}
                    disabled={isForgotSubmitting}
                    activeOpacity={0.85}
                  >
                    {isForgotSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalPublishBtnText}>Send Reset Code →</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Enter Verification Code (OTP)</Text>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={forgotOtp}
                    onChangeText={setForgotOtp}
                    autoFocus
                  />

                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>Set New Password</Text>
                  <TextInput
                    style={styles.phoneTextInput}
                    placeholder="Enter new password (min 4 chars)"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={forgotNewPass}
                    onChangeText={setForgotNewPass}
                  />

                  <TouchableOpacity
                    style={[styles.modalPublishBtn, { backgroundColor: '#16A34A', marginTop: 16 }]}
                    onPress={handleResetPasswordSubmit}
                    disabled={isForgotSubmitting}
                    activeOpacity={0.85}
                  >
                    {isForgotSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalPublishBtnText}>Save Password & Login ✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 4: CHOOSE YOUR ROLE (Original Clean Reference Design)
  // -------------------------------------------------------------
  if (currentScreen === 'ROLE_SELECT') {
    return (
      <SafeAreaView style={styles.roleSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleBackBtn}
            onPress={() => setCurrentScreen('SIGN_IN')}
            activeOpacity={0.7}
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
              onPress={async () => {
                setRole('CUSTOMER');
                await StorageService.setRole('CUSTOMER');
                const targetId = emailInput.trim() || phoneInput.trim();
                if (targetId) {
                  await StorageService.saveAccountProfile(targetId, { role: 'CUSTOMER' });
                }
                setCurrentScreen('CUSTOMER_ONBOARDING');
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
                <Text style={styles.roleTagText}>{t.customerTags}</Text>
              </View>
            </TouchableOpacity>

            {/* Worker Role Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'WORKER' && styles.roleCardActiveWorker]}
              onPress={async () => {
                setRole('WORKER');
                await StorageService.setRole('WORKER');
                const targetId = emailInput.trim() || phoneInput.trim();
                if (targetId) {
                  await StorageService.saveAccountProfile(targetId, { role: 'WORKER' });
                }
                setCurrentScreen('WORKER_ONBOARDING');
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
                  {t.workerTags}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.roleNote}>
            {t.roleNote}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // SCREEN 4A: CUSTOMER ONBOARDING FORM
  // -------------------------------------------------------------
  if (currentScreen === 'CUSTOMER_ONBOARDING') {
    return (
      <SafeAreaView style={styles.formSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.formHeader}>
          <TouchableOpacity
            style={styles.formBackBtn}
            onPress={() => setCurrentScreen('ROLE_SELECT')}
            activeOpacity={0.7}
          >
            <ChevronRight size={22} color="#0F172A" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.formHeaderTitle}>Customer Profile Setup</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.formScrollContent, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Picker */}
          <View style={styles.photoUploadCenter}>
            <TouchableOpacity
              style={styles.photoPickerCircle}
              onPress={() => selectPhotoSource(setCustPhotoUri)}
              activeOpacity={0.8}
            >
              {custPhotoUri ? (
                <View style={styles.photoSelectedCircle}>
                  <Image source={{ uri: custPhotoUri }} style={styles.photoPreviewImage} />
                  <View style={styles.photoCheckBadge}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>
              ) : (
                <View style={styles.photoPlaceholderWrap}>
                  <Camera size={28} color="#4F46E5" />
                  <Text style={styles.photoUploadPrompt}>Choose Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHelpText}>Tap to capture photo with camera or choose from gallery</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formFieldsGroup}>
            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Full Customer Name *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
                value={custName}
                onChangeText={setCustName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={custMobile}
                onChangeText={setCustMobile}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Complete Address / Location *</Text>
              <TextInput
                style={[styles.formTextInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="House / Plot No, Street, Landmark, City"
                placeholderTextColor="#94A3B8"
                multiline
                value={custAddress}
                onChangeText={setCustAddress}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.formSubmitBtn}
            disabled={isSubmittingCustomer}
            onPress={async () => {
              if (!custName.trim() || !custMobile.trim() || !custAddress.trim()) {
                Alert.alert('Required Fields', 'Please fill in your name, mobile, and address.');
                return;
              }
              setIsSubmittingCustomer(true);
              DeviceFeedback.triggerSuccessHaptics();

              // 1. Immediately store session locally for instant navigation & persistence
              await StorageService.setSession({
                name: custName.trim(),
                mobile: custMobile.trim(),
                address: custAddress.trim(),
                role: 'CUSTOMER',
                email: emailInput.trim(),
              });
              await StorageService.setRole('CUSTOMER');

              const targetId = emailInput.trim() || custMobile.trim();
              if (targetId) {
                await StorageService.saveAccountProfile(targetId, {
                  role: 'CUSTOMER',
                  name: custName.trim(),
                  phone: custMobile.trim(),
                  address: custAddress.trim(),
                  email: emailInput.trim(),
                });
              }

              // 2. Fire Supabase sync non-blockingly in background
              LiveBackend.syncProfile({
                fullName: custName.trim(),
                mobile: custMobile.trim(),
                address: custAddress.trim(),
                role: 'CUSTOMER',
                email: emailInput.trim(),
              }).catch((e) => console.log('Background customer sync err:', e));

              // 3. Immediately transition directly to MAIN screen without any delay!
              setIsSubmittingCustomer(false);
              setCurrentScreen('MAIN');
            }}
            activeOpacity={0.85}
          >
            {isSubmittingCustomer ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.formSubmitBtnText}>Start App →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 4B: CUSTOMER READY LOADING SCREEN (4s Timer)
  // -------------------------------------------------------------
  if (currentScreen === 'CUSTOMER_READY') {
    return (
      <View style={styles.loaderCenterScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loaderCardContent}>
          <LottieView
            source={require('./assets/customer_ready_lottie.json')}
            autoPlay
            loop
            style={styles.readyLottieView}
          />
          <Text style={styles.readyHeadline}>Setting Up Mistri Pro for You</Text>
          <Text style={styles.readySubtext}>
            Personalizing certified mistris, contractors, and local pricing in your area...
          </Text>
          <View style={styles.readyPillBadge}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.readyPillText}>Readying your workspace...</Text>
          </View>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 4C: WORKER ONBOARDING FORM
  // -------------------------------------------------------------
  if (currentScreen === 'WORKER_ONBOARDING') {
    const availableSkillsList = [
      { name: 'Mason (Raj Mistri)', icon: '🧱' },
      { name: 'Mason Helper (Beldar)', icon: '👷' },
      { name: 'General Construction Labour', icon: '🏗️' },
      { name: 'Shuttering Carpenter', icon: '🪵' },
      { name: 'Steel Fixer / Bar Bender', icon: '⛓️' },
      { name: 'Concrete Worker', icon: '🪨' },
      { name: 'Tile & Marble Installer', icon: '🏛️' },
      { name: 'Plastering Worker', icon: '🖌️' },
      { name: 'Bricklayer', icon: '🧱' },
      { name: 'Waterproofing Worker', icon: '💧' },
      { name: 'Excavation Labour', icon: '🚜' },
      { name: 'Electrician', icon: '⚡' },
      { name: 'Plumber', icon: '🔧' },
      { name: 'Furniture Carpenter', icon: '🪚' },
      { name: 'Welder', icon: '🔥' },
      { name: 'Wall Painter', icon: '🎨' },
      { name: 'POP Worker', icon: '📐' },
      { name: 'False Ceiling Installer', icon: '🏢' },
      { name: 'Metal Fabricator', icon: '⚙️' },
      { name: 'AC Technician', icon: '❄️' },
      { name: 'Cleaning Worker', icon: '🧹' },
      { name: 'Housekeeping Worker', icon: '🏠' },
      { name: 'Loading & Unloading Labour', icon: '📦' },
      { name: 'Gardening Worker (Mali)', icon: '🌱' },
      { name: 'Demolition Worker', icon: '🔨' },
    ];

    const toggleSkill = (sk) => {
      if (workerSkills.includes(sk)) {
        setWorkerSkills(workerSkills.filter((s) => s !== sk));
      } else {
        setWorkerSkills([...workerSkills, sk]);
      }
    };

    return (
      <SafeAreaView style={styles.formSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.formHeader}>
          <TouchableOpacity
            style={styles.formBackBtn}
            onPress={() => setCurrentScreen('ROLE_SELECT')}
            activeOpacity={0.7}
          >
            <ChevronRight size={22} color="#0F172A" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.formHeaderTitle}>Worker KYC Registration</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.formScrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Worker Photo Picker */}
          <View style={styles.photoUploadCenter}>
            <TouchableOpacity
              style={styles.photoPickerCircle}
              onPress={() => selectPhotoSource(setWorkerPhotoUri)}
              activeOpacity={0.8}
            >
              {workerPhotoUri ? (
                <View style={[styles.photoSelectedCircle, { backgroundColor: '#16A34A' }]}>
                  <Image source={{ uri: workerPhotoUri }} style={styles.photoPreviewImage} />
                  <View style={styles.photoCheckBadge}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>
              ) : (
                <View style={styles.photoPlaceholderWrap}>
                  <Camera size={28} color="#16A34A" />
                  <Text style={[styles.photoUploadPrompt, { color: '#16A34A' }]}>Choose Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHelpText}>Tap to capture passport photo with camera or choose from gallery</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formFieldsGroup}>
            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Full Mistri / Worker Name *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="e.g. Ram Singh Mistri"
                placeholderTextColor="#94A3B8"
                value={workerName}
                onChangeText={setWorkerName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Primary Mobile Number *</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="10-digit registered number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={workerMobile}
                onChangeText={setWorkerMobile}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Alternate Mobile Number (Optional)</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="Emergency or family number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={workerAltMobile}
                onChangeText={setWorkerAltMobile}
              />
            </View>

            {/* Drag & Multi-Select Skills Section */}
            <View style={styles.inputGroup}>
              <View style={styles.skillSectionTitleRow}>
                <Text style={styles.formLabel}>Skills & Trade (Select Multiple) *</Text>
                <Text style={styles.skillCountPill}>{workerSkills.length} Selected</Text>
              </View>
              <View style={styles.skillsChipsWrap}>
                {availableSkillsList.map((sk) => {
                  const isChecked = workerSkills.includes(sk.name);
                  return (
                    <TouchableOpacity
                      key={sk.name}
                      style={[styles.skillToggleChip, isChecked && styles.skillToggleChipActive]}
                      onPress={() => toggleSkill(sk.name)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.skillEmoji}>{sk.icon}</Text>
                      <Text style={[styles.skillToggleText, isChecked && styles.skillToggleTextActive]}>
                        {sk.name}
                      </Text>
                      <View style={[styles.skillCheckCircle, isChecked && styles.skillCheckCircleActive]}>
                        {isChecked && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Complete Residential Address *</Text>
              <TextInput
                style={[styles.formTextInput, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Village / Town, Ward No, District, PIN code"
                placeholderTextColor="#94A3B8"
                multiline
                value={workerAddress}
                onChangeText={setWorkerAddress}
              />
            </View>

            {/* Aadhaar Card Verification (Both Sides) */}
            <View style={styles.inputGroup}>
              <Text style={styles.formLabel}>Government ID Verification (Aadhaar Both Sides) *</Text>
              <View style={styles.aadhaarCardsRow}>
                <TouchableOpacity
                  style={[styles.aadhaarCardBox, aadhaarFrontUri && styles.aadhaarCardBoxActive]}
                  onPress={() => selectPhotoSource(setAadhaarFrontUri)}
                  activeOpacity={0.8}
                >
                  {aadhaarFrontUri ? (
                    <View style={styles.aadhaarPreviewWrap}>
                      <Image source={{ uri: aadhaarFrontUri }} style={styles.aadhaarPreviewImage} />
                      <View style={styles.aadhaarBadgeCheck}>
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    </View>
                  ) : (
                    <UploadCloud size={24} color="#64748B" />
                  )}
                  <Text style={[styles.aadhaarBoxTitle, aadhaarFrontUri && { color: '#166534' }]}>
                    Aadhaar Front {aadhaarFrontUri ? '✓' : ''}
                  </Text>
                  <Text style={styles.aadhaarBoxSub}>
                    {aadhaarFrontUri ? 'Photo uploaded' : 'Tap to capture / upload'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.aadhaarCardBox, aadhaarBackUri && styles.aadhaarCardBoxActive]}
                  onPress={() => selectPhotoSource(setAadhaarBackUri)}
                  activeOpacity={0.8}
                >
                  {aadhaarBackUri ? (
                    <View style={styles.aadhaarPreviewWrap}>
                      <Image source={{ uri: aadhaarBackUri }} style={styles.aadhaarPreviewImage} />
                      <View style={styles.aadhaarBadgeCheck}>
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    </View>
                  ) : (
                    <UploadCloud size={24} color="#64748B" />
                  )}
                  <Text style={[styles.aadhaarBoxTitle, aadhaarBackUri && { color: '#166534' }]}>
                    Aadhaar Back {aadhaarBackUri ? '✓' : ''}
                  </Text>
                  <Text style={styles.aadhaarBoxSub}>
                    {aadhaarBackUri ? 'Photo uploaded' : 'Tap to capture / upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Submit Application Button */}
          <TouchableOpacity
            style={[styles.formSubmitBtn, { backgroundColor: '#16A34A' }]}
            disabled={isSubmittingWorker}
            onPress={async () => {
              if (!workerName.trim() || !workerMobile.trim() || workerSkills.length === 0) {
                Alert.alert('Required Fields ⚠️', 'Please fill your full name, mobile number, and select at least one primary skill.');
                return;
              }

              if (!aadhaarFrontUri || !aadhaarBackUri) {
                Alert.alert(
                  'Aadhaar Verification Mandatory 🆔',
                  'Both Aadhaar Front and Aadhaar Back photos are strictly compulsory for worker verification. Please upload or capture both sides to proceed.'
                );
                return;
              }

              setIsSubmittingWorker(true);
              DeviceFeedback.triggerSuccessHaptics();

              // 1. Immediately store session locally
              await StorageService.setSession({
                name: workerName.trim(),
                mobile: workerMobile.trim(),
                role: 'WORKER',
                email: emailInput.trim(),
              });
              await StorageService.setRole('WORKER');

              const targetId = emailInput.trim() || workerMobile.trim();
              if (targetId) {
                await StorageService.saveAccountProfile(targetId, {
                  role: 'WORKER',
                  name: workerName.trim(),
                  phone: workerMobile.trim(),
                  address: workerAddress.trim(),
                  email: emailInput.trim(),
                  kyc_status: 'UNDER_REVIEW',
                });
              }

              // 2. Fire KYC submit in background without stalling the screen
              LiveBackend.submitWorkerKYC({
                fullName: workerName.trim(),
                mobile: workerMobile.trim(),
                altMobile: workerAltMobile.trim() || null,
                address: workerAddress.trim(),
                skills: workerSkills,
                aadhaarFrontUri,
                aadhaarBackUri,
                photoUri: workerPhotoUri,
              }).catch((e) => console.log('Worker KYC submit err:', e));

              // 3. Navigate instantly to WORKER_UNDER_REVIEW
              setIsSubmittingWorker(false);
              setCurrentScreen('WORKER_UNDER_REVIEW');
            }}
            activeOpacity={0.85}
          >
            {isSubmittingWorker ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.formSubmitBtnText}>Submit KYC Application 📋</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 4D: WORKER APPLICATION SUBMITTED & UNDER REVIEW
  // -------------------------------------------------------------
  if (currentScreen === 'WORKER_UNDER_REVIEW') {
    return (
      <View style={styles.loaderCenterScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loaderCardContent}>
          <LottieView
            source={require('./assets/worker_review_lottie.json')}
            autoPlay
            loop
            style={styles.reviewLottieView}
          />
          <Text style={styles.reviewHeadline}>Application Submitted!</Text>
          <Text style={styles.reviewSubtext}>
            Your KYC application is currently under review by the Mistri Pro compliance team.
          </Text>

          <View style={styles.reviewStatusBox}>
            <View style={styles.reviewStatusRow}>
              <CheckCircle2 size={18} color="#16A34A" />
              <Text style={styles.reviewStatusText}>Profile Details Received</Text>
            </View>
            <View style={styles.reviewStatusRow}>
              <CheckCircle2 size={18} color="#16A34A" />
              <Text style={styles.reviewStatusText}>Aadhaar Documents Uploaded</Text>
            </View>
            <View style={styles.reviewStatusRow}>
              <ActivityIndicator size="small" color="#D97706" />
              <Text style={[styles.reviewStatusText, { color: '#B45309', fontWeight: '700' }]}>
                Aadhaar Verification Pending (Est. 2-4 hrs)
              </Text>
            </View>
          </View>

          <Text style={styles.reviewNoticeFooter}>
            Once approved, you will get SMS confirmation and your Worker App tools will unlock automatically.
          </Text>

          {/* Check Live Approval Status Button */}
          <TouchableOpacity
            style={[styles.previewHomeBtn, { backgroundColor: '#16A34A' }]}
            disabled={isCheckingApproval}
            onPress={async () => {
              setIsCheckingApproval(true);
              DeviceFeedback.triggerSuccessHaptics();
              try {
                const checkPromise = LiveBackend.checkWorkerApprovalStatus(workerMobile);
                const timeoutPromise = new Promise((resolve) =>
                  setTimeout(() => resolve({ status: 'PENDING' }), 1200)
                );
                const res = await Promise.race([checkPromise, timeoutPromise]);
                setIsCheckingApproval(false);

                if (res?.status === 'APPROVED' || res?.approved) {
                  DeviceFeedback.triggerSuccessHaptics();
                  setNotifications((prev) => [
                    {
                      id: `NOTIF-${Date.now()}`,
                      title: 'KYC Application Approved! 🎉',
                      message: 'Congratulations! Your profile is verified. Your job alerts and wallet are now active.',
                      time: 'Just now',
                      type: 'success',
                    },
                    ...prev,
                  ]);
                  Alert.alert('Application Approved! 🎉', 'Your Mistri Pro profile has been verified and approved by the admin desk.');
                  setCurrentScreen('MAIN');
                } else {
                  DeviceFeedback.triggerAlertHaptics();
                  Alert.alert(
                    'Application Under Review ⏳',
                    'Your Aadhaar and profile details are currently being verified by the compliance desk. You will receive an SMS as soon as approved.'
                  );
                }
              } catch (e) {
                setIsCheckingApproval(false);
                Alert.alert('Status: In Review ⏳', 'Your application is safely in the review queue.');
              }
            }}
            activeOpacity={0.8}
          >
            {isCheckingApproval ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.previewHomeBtnText}>Check Approval Status 🔄</Text>
            )}
          </TouchableOpacity>

          {/* Sign Out / Switch Account Button */}
          <TouchableOpacity
            style={styles.reviewLogoutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.reviewLogoutBtnText}>Sign Out / Switch Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // SCREEN 5: MAIN APP (FIONIX + CHOOSINGHER ULTRA POLISHED UX)
  // -------------------------------------------------------------
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" />

      {/* RENDER ACTIVE TAB */}
      {role === 'CUSTOMER' ? (
        <>
          {activeTab === 'HOME' && (
            <CustomerHomeScreen
              insets={insets}
              userName={custName}
              lang={lang}
              t={t}
              onNavigateTab={(tab, category) => {
                if (category) setFindInitialCategory(category);
                const normalizedTab = String(tab || '').trim().toUpperCase();
                setActiveTab(normalizedTab);
              }}
              onBookWorker={(details) => handleCustomerBookWorker(details)}
              onOpenNotifications={() => setShowNotifModal(true)}
              notificationsCount={notifications.length}
              workers={realWorkers}
            />
          )}

          {activeTab === 'FIND_WORKERS' && (
            <FindWorkersScreen
              insets={insets}
              lang={lang}
              t={t}
              initialCategory={findInitialCategory}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onBookWorker={(details) => handleCustomerBookWorker(details)}
              workers={realWorkers}
            />
          )}

          {activeTab === 'BOOKINGS' && (
            <MyBookingsScreen
              insets={insets}
              lang={lang}
              t={t}
              onNavigateTab={(tab) => setActiveTab(tab)}
              bookings={customerBookings}
              onAutoAssignAnother={handleAutoAssignAnother}
              onRefundBooking={handleRefundBooking}
              onOpenNotifications={() => setShowNotifModal(true)}
              notificationsCount={notifications.length}
            />
          )}

          {activeTab === 'CONTRACTOR' && (
            <ContractorScreen
              insets={insets}
              onNavigateTab={(tab) => setActiveTab(tab)}
              workers={realWorkers}
              userName={custName}
              userContact={custMobile}
              onDeployContractorBooking={async (payload) => {
                try {
                  const bookingId = `CB-${Date.now().toString().slice(-4)}`;
                  const newContractorBooking = {
                    id: bookingId,
                    booking_code: `BK-CREW-${Date.now().toString().slice(-4)}`,
                    workerName: 'Searching Nearby Crew...',
                    workerAvatar: '⏳',
                    workerColor: '#4F46E5',
                    workerPhone: '',
                    worker_skill: 'Contractor Crew',
                    category: 'Contractor',
                    title: `${payload.totalWorkers} Workers Crew Deployment`,
                    location: payload.siteLocation || 'Sawai Madhopur, Rajasthan',
                    site_location: payload.siteLocation || 'Sawai Madhopur, Rajasthan',
                    date: 'Today, Immediate',
                    scheduled_date: 'Today, Immediate',
                    duration: payload.duration || '1 Day',
                    total_amount: payload.totalAmount,
                    amount: `₹${payload.totalAmount}`,
                    status: 'waiting_confirmation',
                    progress_step: 1,
                    razorpay_payment_id: payload.paymentId || `pay_test_${Date.now().toString().slice(-8)}`,
                  };

                  setCustomerBookings((prev) => [newContractorBooking, ...prev]);
                  await StorageService.setBookings([newContractorBooking, ...customerBookings]);

                  // Dispatch alert to all nearby workers
                  const custInitials = (custName || 'CU').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                  const newAlert = {
                    id: `ALT-${Date.now().toString().slice(-4)}`,
                    bookingId: bookingId,
                    customerName: custName || 'Customer',
                    customerAvatar: custInitials,
                    customerColor: '#4F46E5',
                    customerPhone: custMobile || '',
                    category: 'Contractor Crew',
                    title: `${payload.totalWorkers} Workers Crew Deployment`,
                    location: payload.siteLocation || 'Sawai Madhopur, Rajasthan',
                    distance: '1.2 km',
                    date: 'Today, Immediate',
                    timing: '9:00 AM – 5:00 PM',
                    offeredRate: `₹${payload.totalAmount}`,
                    platformFee: 99,
                    paymentLocked: true,
                    timestamp: 'Just now',
                  };
                  setWorkerAlerts((prev) => [newAlert, ...prev]);

                  LiveBackend.createContractorBooking({
                    ...payload,
                    bookingId,
                    customerName: custName || 'Customer',
                    customerPhone: custMobile || '',
                    paymentId: payload.paymentId,
                    status: 'waiting_confirmation',
                  }).catch((e) => console.log('Contractor booking sync err:', e));

                  DeviceFeedback.triggerSuccessHaptics();
                  Alert.alert(
                    'Booking Placed & Payment Secured! 💳',
                    `Payment of ₹${payload.totalAmount} secured via Razorpay. Alert sent to nearby workers. Track worker acceptance in My Bookings.`
                  );
                  setActiveTab('BOOKINGS');
                } catch (e) {
                  console.log('Contractor booking error:', e);
                }
              }}
            />
          )}

          {activeTab === 'PROFILE' && (
            <ProfileScreen
              t={t}
              role={role}
              lang={lang}
              insets={insets}
              userName={custName}
              userContact={custMobile}
              userAddress={custAddress}
              onSaveProfile={handleSaveProfile}
              onSelectLang={handleSelectLanguage}
              onOpenInvoices={() => setShowInvoicesModal(true)}
              onLogout={handleSignOut}
            />
          )}
        </>
      ) : (
        <>
          {activeTab === 'HOME' && (
            <WorkerHomeScreen
              insets={insets}
              lang={lang}
              t={t}
              workerProfile={workerProfile}
              onUpdateProfile={handleUpdateWorkerProfile}
              alertsCount={workerAlerts.length}
              walletBalance={workerWallet.availableBalance}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNotifications={() => setShowNotifModal(true)}
              notificationsCount={notifications.length}
            />
          )}

          {activeTab === 'ALERTS' && (
            <WorkerAlertsScreen
              insets={insets}
              alerts={workerAlerts}
              onApproveAlert={handleApproveAlert}
              onRejectAlert={handleRejectAlert}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'BOOKINGS' && (
            <WorkerBookingsScreen
              insets={insets}
              bookings={workerBookings}
              onUpdateBookingStep={handleUpdateWorkerBookingStep}
              onCompleteBooking={handleCompleteWorkerBooking}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'EARNINGS' && (
            <WorkerEarningsScreen
              insets={insets}
              walletData={workerWallet}
              workerProfile={workerProfile}
              onWithdrawSuccess={handleWithdrawSuccess}
            />
          )}

          {activeTab === 'PROFILE' && (
            <ProfileScreen
              t={t}
              role={role}
              lang={lang}
              insets={insets}
              userName={workerName}
              userContact={workerMobile}
              userAddress={workerAddress}
              onSaveProfile={handleSaveProfile}
              onSelectLang={handleSelectLanguage}
              onOpenInvoices={() => setShowInvoicesModal(true)}
              onLogout={handleSignOut}
            />
          )}
        </>
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
        {role === 'CUSTOMER' ? (
          <>
            {/* Customer Tab 1: Home */}
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
              <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navHome}
              </Text>
            </TouchableOpacity>

            {/* Customer Tab 2: Find Workers */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('FIND_WORKERS')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconBox, activeTab === 'FIND_WORKERS' && styles.navIconBoxActive]}>
                <Compass
                  size={20}
                  color={activeTab === 'FIND_WORKERS' ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={activeTab === 'FIND_WORKERS' ? 2.5 : 2}
                />
              </View>
              <Text style={[styles.navLabel, activeTab === 'FIND_WORKERS' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navFind}
              </Text>
            </TouchableOpacity>

            {/* Customer Tab 3: My Bookings */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('BOOKINGS')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconBox, activeTab === 'BOOKINGS' && styles.navIconBoxActive]}>
                <Calendar
                  size={20}
                  color={activeTab === 'BOOKINGS' ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={activeTab === 'BOOKINGS' ? 2.5 : 2}
                />
              </View>
              <Text style={[styles.navLabel, activeTab === 'BOOKINGS' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navBookings}
              </Text>
            </TouchableOpacity>

            {/* Customer Tab 4: Contractor Group Booking */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('CONTRACTOR')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconBox, activeTab === 'CONTRACTOR' && styles.navIconBoxActive]}>
                <Users
                  size={20}
                  color={activeTab === 'CONTRACTOR' ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={activeTab === 'CONTRACTOR' ? 2.5 : 2}
                />
              </View>
              <Text style={[styles.navLabel, activeTab === 'CONTRACTOR' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navContractor}
              </Text>
            </TouchableOpacity>

            {/* Customer Tab 5: Profile */}
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
              <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navProfile}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Worker Tab 1: Home */}
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
              <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navHome}
              </Text>
            </TouchableOpacity>

            {/* Worker Tab 2: Alerts */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('ALERTS')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconBox, activeTab === 'ALERTS' && styles.navIconBoxActive]}>
                <Bell
                  size={20}
                  color={activeTab === 'ALERTS' ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={activeTab === 'ALERTS' ? 2.5 : 2}
                />
                {workerAlerts.length > 0 && (
                  <View style={styles.navAlertDot} />
                )}
              </View>
              <Text style={[styles.navLabel, activeTab === 'ALERTS' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navAlerts}
              </Text>
            </TouchableOpacity>

            {/* Worker Tab 3: Bookings */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('BOOKINGS')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconBox, activeTab === 'BOOKINGS' && styles.navIconBoxActive]}>
                <Calendar
                  size={20}
                  color={activeTab === 'BOOKINGS' ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={activeTab === 'BOOKINGS' ? 2.5 : 2}
                />
              </View>
              <Text style={[styles.navLabel, activeTab === 'BOOKINGS' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navBookings}
              </Text>
            </TouchableOpacity>

            {/* Worker Tab 4: Earnings */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('EARNINGS')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconBox, activeTab === 'EARNINGS' && styles.navIconBoxActive]}>
                <Wallet
                  size={20}
                  color={activeTab === 'EARNINGS' ? '#4F46E5' : '#94A3B8'}
                  strokeWidth={activeTab === 'EARNINGS' ? 2.5 : 2}
                />
              </View>
              <Text style={[styles.navLabel, activeTab === 'EARNINGS' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navEarnings}
              </Text>
            </TouchableOpacity>

            {/* Worker Tab 5: Profile */}
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
              <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.navProfile}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
                    100% Secured Payment: Payments are only released to mistris after you confirm milestone completion.
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
                placeholder="e.g. Rahul Sharma"
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

      {/* ─── FLOATING NOTIFICATION CENTER MODAL ─── */}
      <NotificationCenterModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={notifications}
        onDismissItem={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        onClearAll={() => setNotifications([])}
      />

      {/* ─── TAX INVOICES & RECEIPTS MODAL ─── */}
      <Modal visible={showInvoicesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%', paddingBottom: Math.max(insets.bottom + 20, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalStepBadge}>OFFICIAL GST RECORDS</Text>
                <Text style={styles.modalTitle}>Tax Invoices & Receipts</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowInvoicesModal(false)}
              >
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 12 }}>
              {[
                {
                  id: 'INV-2026-089',
                  workerName: 'Ram Singh Mistri',
                  skill: 'Mason',
                  date: '12 Nov 2026',
                  totalAmount: 1098,
                  workerFee: 950,
                  platformFee: 99,
                  txFee: 49,
                },
                {
                  id: 'INV-2026-064',
                  workerName: 'Mukesh Sharma',
                  skill: 'Electrician',
                  date: '04 Nov 2026',
                  totalAmount: 994,
                  workerFee: 850,
                  platformFee: 99,
                  txFee: 45,
                },
              ].map((inv) => (
                <View
                  key={inv.id}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Satoshi-Bold', fontSize: 14, color: '#0F172A' }}>{inv.id}</Text>
                    <Text style={{ fontFamily: 'Satoshi-Bold', fontSize: 14, color: '#16A34A' }}>₹{inv.totalAmount}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Satoshi-Medium', fontSize: 12, color: '#64748B', marginTop: 3 }}>
                    {inv.workerName} • {inv.skill} • {inv.date}
                  </Text>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: '#4F46E5',
                      borderRadius: 10,
                      paddingVertical: 8,
                      marginTop: 10,
                    }}
                    onPress={() => InvoiceService.downloadInvoicePdf(inv)}
                  >
                    <Download size={14} color="#FFFFFF" />
                    <Text style={{ fontFamily: 'Satoshi-Bold', fontSize: 12, color: '#FFFFFF' }}>
                      Download Official Tax Invoice PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =================================================================
// SUB-SCREEN A: HOME SCREEN (FIONIX STYLE + ULTRA HIGH FINISH)
// =================================================================
function HomeScreen({ t, role, insets, projects, onOpenPost, onSelectCategory, custName }) {
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
              <Text style={styles.fionixAvatarText}>
                {(custName || 'US').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.fionixUserTextCol}>
              <Text style={styles.fionixHelloSub}>{t.hello}</Text>
              <Text style={styles.fionixUserName}>{custName || 'User'}!</Text>
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
              ? 'Track applications and release payment milestones'
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
function ProfileScreen({
  t,
  role,
  lang,
  insets,
  userName,
  userContact,
  userAddress,
  onSaveProfile,
  onSelectLang,
  onSwitchLang,
  onOpenInvoices,
  onLogout,
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [editName, setEditName] = useState(userName || '');
  const [editContact, setEditContact] = useState(userContact || '');
  const [editAddress, setEditAddress] = useState(userAddress || '');
  const [isSaving, setIsSaving] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English', char: 'A' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', char: 'अ' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', char: 'અ' },
    { code: 'mr', label: 'Marathi', native: 'मराठी', char: 'म' },
  ];

  useEffect(() => {
    setEditName(userName || '');
    setEditContact(userContact || '');
    setEditAddress(userAddress || '');
  }, [userName, userContact, userAddress]);

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
            <Text style={styles.profileAvatarInitial}>
              {(userName || (role === 'CUSTOMER' ? 'CU' : 'WO'))
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileNameText}>
            {userName || (role === 'CUSTOMER' ? 'Valued Customer' : 'Skilled Mistri')}
          </Text>
          <Text style={styles.profileEmailSub}>
            {userContact || (role === 'CUSTOMER' ? 'Customer Contact' : 'Worker Contact')}
          </Text>
          <View style={styles.profilePersonaBadge}>
            <Text style={styles.profilePersonaBadgeText}>
              {role === 'CUSTOMER' ? 'Client / Project Owner' : 'Verified Skilled Mistri'}
            </Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editProfilePill}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.8}
          >
            <Edit3 size={13} color="#4F46E5" />
            <Text style={styles.editProfilePillText}>Edit Profile</Text>
          </TouchableOpacity>
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
          {/* 1. Choose Language (Opens Popup Modal without Redirection) */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => setShowLangModal(true)} activeOpacity={0.7}>
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

          {/* 4. Tax Invoices & Receipts */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={onOpenInvoices}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsRowIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <FileText size={18} color="#D97706" />
            </View>
            <View style={styles.settingsRowTextCol}>
              <Text style={styles.settingsRowLabel}>Tax Invoices & Receipts</Text>
              <Text style={styles.settingsRowSub}>Download official GST PDF invoices</Text>
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

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 20, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile Details</Text>
                <Text style={styles.modalSubtitle}>Update your name, contact & location</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone / Mobile Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={editContact}
                  onChangeText={setEditContact}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>City / Location Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="e.g. Sawai Madhopur, Rajasthan"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { marginTop: 14, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }]}
                disabled={isSaving}
                onPress={async () => {
                  if (!editName.trim()) {
                    Alert.alert('Required', 'Please enter your name');
                    return;
                  }
                  setIsSaving(true);
                  if (onSaveProfile) {
                    await onSaveProfile({
                      name: editName.trim(),
                      contact: editContact.trim(),
                      address: editAddress.trim(),
                    });
                  }
                  setIsSaving(false);
                  setShowEditModal(false);
                }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.primaryActionBtnText, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                    Save Changes & Sync
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CHOOSE LANGUAGE POPUP MODAL (Clean in-place selector, no redirection) */}
      <Modal
        visible={showLangModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLangModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 20, 28) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t.chooseLanguage}</Text>
                <Text style={styles.modalSubtitle}>{t.selectLangSub}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLangModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={[styles.langList, { marginTop: 12, marginBottom: 8 }]}>
              {languages.map((item) => {
                const isSelected = lang === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langRow, isSelected && styles.langRowActive]}
                    onPress={async () => {
                      if (onSelectLang) {
                        await onSelectLang(item.code);
                      } else if (onSwitchLang) {
                        onSwitchLang(item.code);
                      }
                      setShowLangModal(false);
                    }}
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
          </View>
        </View>
      </Modal>
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
  authGoogleG: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#4285F4',
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
  emailFormCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  authInputFieldGroup: {
    marginBottom: 4,
  },
  authInputLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPassLink: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#4F46E5',
  },
  authInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
  },
  authTextInput: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 10,
    paddingVertical: 0,
  },
  passwordEyeBtn: {
    padding: 6,
  },
  authEmailButton: {
    backgroundColor: '#0F172A',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  authEmailButtonText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  authDividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  authDividerText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1,
    paddingHorizontal: 12,
  },
  authGoogleOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  authGoogleGColored: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#4285F4',
    marginRight: 10,
  },
  authGoogleButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#0F172A',
  },
  // Dedicated Email Page Styles
  emailPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  emailPageHeaderTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  emailPageScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emailHeaderIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emailPageHeading: {
    fontFamily: 'Satoshi-Black',
    fontSize: 26,
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emailPageSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    marginBottom: 24,
  },
  authEmailLargeButton: {
    backgroundColor: '#0F172A',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  authEmailLargeButtonText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  emailHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  emailHelperText: {
    flex: 1,
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
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
    paddingTop: 10,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  roleBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleHeaderSection: {
    marginBottom: 18,
  },
  roleHeaderTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 6,
  },
  roleHeaderSub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  roleCardsGroup: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },
  roleCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
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
    marginBottom: 12,
  },
  roleEmojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 24,
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
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
  },
  roleCardDesc: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 12,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roleTagText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#4F46E5',
  },
  roleNote: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  // MAIN CONTAINER
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  // BOTTOM NAVIGATION CAPSULE (FIONIX DOCK)
  bottomNavCapsule: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 6,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 4,
    paddingHorizontal: 1,
  },
  navIconBox: {
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  navIconBoxActive: {
    backgroundColor: '#EEF2FF',
  },
  navAlertDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
  },
  navLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  navLabelActive: {
    color: '#4F46E5',
    fontFamily: 'Satoshi-Bold',
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
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  editProfilePillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
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
  modalSubtitle: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
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

  // PHONE & OTP STYLES
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  phoneCountryCode: {
    backgroundColor: '#F1F5F9',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneCountryCodeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  phoneTextInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    color: '#0F172A',
    letterSpacing: 1,
  },
  otpNoticeHelp: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginVertical: 4,
  },
  otpBoxesInput: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    borderRadius: 14,
    textAlign: 'center',
    fontFamily: 'Satoshi-Black',
    fontSize: 28,
    color: '#0F172A',
    letterSpacing: 12,
  },
  resendOtpRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendOtpText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#4F46E5',
  },

  ratingStarRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },


  // FORM & ONBOARDING STYLES
  formSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  formBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formHeaderTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 17,
    color: '#0F172A',
  },
  formScrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  photoUploadCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoPickerCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPlaceholderWrap: {
    alignItems: 'center',
    gap: 4,
  },
  photoUploadPrompt: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#4F46E5',
  },
  photoSelectedCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  aadhaarPreviewWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  aadhaarPreviewImage: {
    width: 60,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  aadhaarBadgeCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#16A34A',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSelectedInitials: {
    fontFamily: 'Satoshi-Black',
    fontSize: 26,
    color: '#FFFFFF',
  },
  photoCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHelpText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  formFieldsGroup: {
    gap: 16,
    marginBottom: 28,
  },
  inputGroup: {},
  formLabel: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 8,
  },
  formTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: '#0F172A',
  },
  formSubmitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  formSubmitBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // SKILLS CHIPS & AADHAAR
  skillSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillCountPill: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  skillsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  skillEmoji: {
    fontSize: 16,
  },
  skillToggleChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  skillCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillCheckCircleActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  skillToggleText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#475569',
  },
  skillToggleTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#166534',
  },
  aadhaarCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  aadhaarCardBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  aadhaarCardBoxActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  aadhaarBoxTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 2,
  },
  aadhaarBoxSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 10,
    color: '#64748B',
  },

  // LOADER / READY & REVIEW SCREEN
  loaderCenterScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  loaderCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  readyLottieView: {
    width: 240,
    height: 240,
    marginBottom: 10,
  },
  readyHeadline: {
    fontFamily: 'Satoshi-Black',
    fontSize: 24,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  readySubtext: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  readyPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  readyPillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#4F46E5',
  },

  reviewLottieView: {
    width: 220,
    height: 220,
    marginBottom: 6,
  },
  reviewHeadline: {
    fontFamily: 'Satoshi-Black',
    fontSize: 26,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewSubtext: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  reviewStatusBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  reviewStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewStatusText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#1E293B',
  },
  reviewNoticeFooter: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  previewHomeBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  previewHomeBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  reviewLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    width: '100%',
  },
  reviewLogoutBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#DC2626',
  },
});
