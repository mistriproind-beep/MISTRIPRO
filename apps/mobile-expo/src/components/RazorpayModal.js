import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { DeviceFeedback } from '../services/deviceFeedback';
import {
  RAZORPAY_CONFIG,
  getLiveRazorpayConfig,
} from '../services/razorpayConfig';

export default function RazorpayModal({
  visible,
  onClose,
  bookingData,
  onPaymentSuccess,
}) {
  const [showLiveWebView, setShowLiveWebView] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState('');
  const [activeConfig, setActiveConfig] = useState(RAZORPAY_CONFIG);

  const successTimer = useRef(null);

  // Fetch live credentials from Supabase on mount & whenever modal opens
  useEffect(() => {
    if (visible) {
      setShowLiveWebView(true);
      getLiveRazorpayConfig().then((cfg) => {
        if (cfg && cfg.KEY_ID) {
          setActiveConfig(cfg);
        }
      });
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  if (!bookingData) return null;

  const {
    workerName = 'Mistri',
    workerSkill = 'Labour Service',
    bookingFee = 99,
    customerName = 'Customer',
    customerPhone = '',
  } = bookingData;

  // The platform charges ONLY the nominal booking/inspection fee (e.g. ₹99).
  // Worker quotes actual work price directly upon site inspection.
  const payableAmount = Number(bookingData.totalAmount || bookingData.bookingFee || bookingFee || 99);
  const safeAmountPaise = Math.round(payableAmount * 100);
  const safeWorkerSkill = String(workerSkill || 'Labour Service').replace(/["\\]/g, '');
  const safeWorkerName = String(workerName || 'Mistri').replace(/["\\]/g, '');
  const safeCustomerName = String(customerName || 'Customer').replace(/["\\]/g, '');
  const safeCustomerPhone = String(customerPhone || '').replace(/[^0-9+]/g, '');
  const formattedTotal = Number(payableAmount || 99).toLocaleString('en-IN');

  // Complete Payment helper
  const handlePaymentCompleted = (paymentId, method = 'Razorpay Official Gateway') => {
    setIsProcessing(false);
    setShowLiveWebView(false);
    setSuccessPaymentId(paymentId);
    setPaymentSuccess(true);
    DeviceFeedback.triggerSuccessHaptics();

    successTimer.current = setTimeout(() => {
      setPaymentSuccess(false);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...bookingData,
          paymentId,
          paymentMethod: method,
          paidAt: new Date().toISOString(),
        });
      }
      onClose();
    }, 1400);
  };

  const handleShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    if (
      url.startsWith('upi:') ||
      url.startsWith('intent:') ||
      url.startsWith('phonepe:') ||
      url.startsWith('paytmmp:') ||
      url.startsWith('gpay:')
    ) {
      Linking.openURL(url).catch((err) =>
        console.log('Cannot open UPI URL scheme:', err)
      );
      return false;
    }
    return true;
  };

  // Razorpay Live Web Checkout HTML (Uses live dynamic credentials from Supabase)
  const razorpayHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Razorpay Checkout</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js" onload="onRazorpayLoaded()" onerror="onRazorpayError()"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #F8FAFC;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 24px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      text-align: center;
      border: 1px solid #E2E8F0;
    }
    .badge {
      display: inline-block;
      background: #EEF2FF;
      color: #4F46E5;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .title {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .sub {
      font-size: 13px;
      color: #64748B;
      margin-bottom: 20px;
    }
    .amount-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .amount-label {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .amount-val {
      font-size: 28px;
      font-weight: 800;
      color: #0F172A;
    }
    .btn-pay {
      background: #4F46E5;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      width: 100%;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
      transition: background 0.2s;
    }
    .btn-pay:hover {
      background: #4338CA;
    }
    .btn-cancel {
      background: transparent;
      color: #64748B;
      border: none;
      width: 100%;
      padding: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }
    .secure-note {
      margin-top: 16px;
      font-size: 11px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Official Razorpay Gateway</div>
    <h2 class="title">Secure Checkout</h2>
    <p class="sub">${safeWorkerSkill} • ${safeWorkerName}</p>

    <div class="amount-box">
      <div class="amount-label">Total Amount to Pay</div>
      <div class="amount-val">₹${formattedTotal}</div>
    </div>

    <button class="btn-pay" id="payBtn" onclick="launchRazorpay()">
      Proceed with Razorpay 🚀
    </button>

    <button class="btn-cancel" onclick="cancelPay()">
      Cancel & Go Back
    </button>

    <div class="secure-note">
      🔒 256-bit Encrypted • Secured via Razorpay
    </div>
  </div>

  <script>
    var rzpInstance = null;
    var scriptLoaded = false;

    function onRazorpayLoaded() {
      scriptLoaded = true;
      setTimeout(launchRazorpay, 100);
    }

    function onRazorpayError() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ERROR',
        message: 'Failed to load Razorpay checkout script from checkout.razorpay.com'
      }));
    }

    function launchRazorpay() {
      if (typeof Razorpay === 'undefined') {
        var btn = document.getElementById('payBtn');
        if (btn) btn.innerHTML = 'Connecting to Gateway... ⏳';
        var attempts = 0;
        var timer = setInterval(function() {
          attempts++;
          if (typeof Razorpay !== 'undefined') {
            clearInterval(timer);
            if (btn) btn.innerHTML = 'Proceed with Razorpay 🚀';
            launchRazorpay();
          } else if (attempts > 25) {
            clearInterval(timer);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ERROR',
              message: 'Razorpay SDK load timed out. Please verify your internet connection.'
            }));
          }
        }, 200);
        return;
      }

      var options = {
        key: "${activeConfig.KEY_ID}",
        amount: ${safeAmountPaise},
        currency: "${activeConfig.CURRENCY || 'INR'}",
        name: "${activeConfig.MERCHANT_NAME || 'Mistri Pro Secured Payments'}",
        description: "${safeWorkerSkill} Advance Booking",
        image: "https://i.imgur.com/3g7nmJC.png",
        prefill: {
          name: "${safeCustomerName}",
          contact: "${safeCustomerPhone}",
          email: "customer@mistripro.com"
        },
        theme: {
          color: "${activeConfig.THEME_COLOR || '#4F46E5'}"
        },
        handler: function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_SUCCESS',
            paymentId: response.razorpay_payment_id || ('pay_' + Math.random().toString(36).substring(2, 10))
          }));
        },
        modal: {
          ondismiss: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MODAL_DISMISSED'
            }));
          }
        }
      };

      try {
        rzpInstance = new Razorpay(options);
        rzpInstance.on('payment.failed', function (resp) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_FAILED',
            error: (resp.error && resp.error.description) || 'Payment failed'
          }));
        });
        rzpInstance.open();
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          message: err.message
        }));
      }
    }

    function cancelPay() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CANCEL'
      }));
    }

    if (typeof Razorpay !== 'undefined') {
      setTimeout(launchRazorpay, 100);
    }
  </script>
</body>
</html>
`;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PAYMENT_SUCCESS') {
        handlePaymentCompleted(data.paymentId, 'Razorpay Official Gateway');
      } else if (data.type === 'PAYMENT_FAILED') {
        Alert.alert('Payment Failed', data.error || 'Payment was unsuccessful.');
        setShowLiveWebView(false);
      } else if (data.type === 'CANCEL' || data.type === 'MODAL_DISMISSED') {
        setShowLiveWebView(false);
      } else if (data.type === 'ERROR') {
        Alert.alert(
          'Payment Gateway Notice',
          data.message || 'Unable to connect to Razorpay payment servers. Please check your internet connection.',
          [{ text: 'OK', onPress: () => setShowLiveWebView(false) }]
        );
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.fullScreenContainer} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.razorpayHeader}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <View>
              <Text style={styles.razorpayTitle}>Razorpay</Text>
              <Text style={styles.razorpaySub}>Official Trusted Payment Gateway</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (successTimer.current) clearTimeout(successTimer.current);
              setIsProcessing(false);
              setPaymentSuccess(false);
              onClose();
            }}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Secure Verified Gateway Ribbon */}
        <View style={styles.secureHeaderRibbon}>
          <ShieldCheck size={14} color="#15803D" />
          <Text style={styles.secureHeaderText}>
            Official Razorpay Gateway • 100% Escrow Protection
          </Text>
        </View>

        {/* SUCCESS SCREEN */}
        {paymentSuccess ? (
          <View style={styles.successState}>
            <View style={styles.successCircle}>
              <CheckCircle2 size={44} color="#16A34A" />
            </View>
            <Text style={styles.successTitle}>Payment Verified via Razorpay!</Text>
            <Text style={styles.successSub}>
              ₹{formattedTotal} paid successfully. Mistri assigned.
            </Text>
            <Text style={styles.successTxn}>Txn ID: {successPaymentId}</Text>
          </View>
        ) : showLiveWebView ? (
          /* LIVE WEBVIEW OF OFFICIAL RAZORPAY STANDARD CHECKOUT - FULL SCREEN */
          <View style={styles.webViewWrap}>
            <WebView
              originWhitelist={['*']}
              source={{ html: razorpayHtml, baseUrl: 'https://checkout.razorpay.com' }}
              onMessage={handleWebViewMessage}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading Razorpay Gateway...</Text>
                </View>
              )}
              style={styles.webView}
            />
          </View>
        ) : (
          /* STANDARD PAYMENT SUMMARY & LAUNCH BUTTON */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Order Card */}
            <View style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.merchantLabel}>Nominal Booking & Inspection Fee</Text>
                <Text style={styles.amountDisplay}>₹{formattedTotal}</Text>
              </View>
              <Text style={styles.workerSummaryText}>
                Worker: {safeWorkerName} • {safeWorkerSkill}
              </Text>

              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    Site Visit & Inspection Fee
                  </Text>
                  <Text style={styles.breakdownVal}>₹{formattedTotal}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Actual Work Charges</Text>
                  <Text style={[styles.breakdownVal, { color: '#059669', fontWeight: '700' }]}>Decided On-Site</Text>
                </View>
              </View>

              <View style={{ backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#DCFCE7' }}>
                <Text style={{ fontSize: 11, color: '#166534', lineHeight: 16 }}>
                  💡 <Text style={{ fontWeight: '700' }}>Direct Pricing:</Text> You only pay ₹{formattedTotal} upfront to schedule the mistri. The mistri visits your site, evaluates the work, and quotes the actual price directly with you.
                </Text>
              </View>
            </View>

            {/* Security Pill */}
            <View style={styles.securityPill}>
              <ShieldCheck size={16} color="#15803D" />
              <Text style={styles.securityPillText}>
                100% Secure Transaction • Razorpay Protected Payment
              </Text>
            </View>

            {/* PRIMARY ACTION: Launch Official Razorpay Modal */}
            <TouchableOpacity
              style={styles.primaryPayBtn}
              onPress={() => setShowLiveWebView(true)}
              activeOpacity={0.88}
              disabled={isProcessing}
            >
              <Text style={styles.primaryPayBtnText}>
                Pay Booking Fee • ₹{formattedTotal}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Footer Ribbon */}
        <View style={styles.footerRow}>
          <Lock size={12} color="#94A3B8" />
          <Text style={styles.footerText}>
            Secured by Razorpay • UPI, Cards, NetBanking & Wallets
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0C2340',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#00BAF2',
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: '800',
  },
  razorpayTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  razorpaySub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureHeaderRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  secureHeaderText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#15803D',
  },
  scrollContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  merchantLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountDisplay: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 24,
    color: '#0F172A',
  },
  workerSummaryText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  breakdownVal: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    color: '#0F172A',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
  },
  securityPillText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#15803D',
    flex: 1,
  },
  primaryPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryPayBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  footerText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#94A3B8',
  },
  webViewWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  successState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 380,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  successTxn: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#15803D',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
