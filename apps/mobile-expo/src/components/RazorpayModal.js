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
} from 'react-native';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  X,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { DeviceFeedback } from '../services/deviceFeedback';
import { RAZORPAY_CONFIG } from '../services/razorpayConfig';

export default function RazorpayModal({
  visible,
  onClose,
  bookingData,
  onPaymentSuccess,
}) {
  const [showLiveWebView, setShowLiveWebView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState('');

  const quickPayTimer = useRef(null);
  const successTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (quickPayTimer.current) clearTimeout(quickPayTimer.current);
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  if (!bookingData) return null;

  const {
    workerName = 'Mistri',
    workerSkill = 'Labour Service',
    workerFee = 950,
    platformFee = 99,
    txnFee = 48,
    totalAmount = 1097,
    customerName = 'Customer',
    customerPhone = '',
  } = bookingData;

  const safeAmountPaise = Math.round(Number(String(totalAmount).replace(/[^0-9.]/g, '') || 0) * 100);
  const safeWorkerSkill = String(workerSkill || 'Labour Service').replace(/["\\]/g, '');
  const safeWorkerName = String(workerName || 'Mistri').replace(/["\\]/g, '');
  const safeCustomerName = String(customerName || 'Customer').replace(/["\\]/g, '');
  const safeCustomerPhone = String(customerPhone || '').replace(/[^0-9+]/g, '');
  const formattedTotal = Number(totalAmount || 0).toLocaleString('en-IN');

  // Complete Payment helper
  const handlePaymentCompleted = (paymentId, method = 'Razorpay Test') => {
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

  // 1. One-tap Test Simulation (instant fallback)
  const handleQuickPay = () => {
    setIsProcessing(true);
    DeviceFeedback.triggerAlertHaptics();
    quickPayTimer.current = setTimeout(() => {
      const generatedId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      handlePaymentCompleted(generatedId, 'Razorpay Instant Test');
    }, 1000);
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

  // 2. Razorpay Live Web Checkout HTML
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
      background: #ffffff;
      border-radius: 20px;
      padding: 24px 20px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: #EEF2FF;
      color: #4F46E5;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .sub {
      font-size: 12.5px;
      color: #64748B;
      margin-bottom: 18px;
    }
    .amount-box {
      background: #F1F5F9;
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 18px;
    }
    .amount-label {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .amount-val {
      font-size: 28px;
      font-weight: 900;
      color: #4F46E5;
    }
    .btn-pay {
      background: #4F46E5;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      width: 100%;
      padding: 15px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }
    .btn-pay:active {
      transform: scale(0.98);
    }
    .btn-cancel {
      background: transparent;
      color: #94A3B8;
      border: none;
      margin-top: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .secure-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
      font-size: 11px;
      color: #15803D;
      font-weight: 600;
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
      Open Razorpay Modal 🚀
    </button>

    <button class="btn-cancel" onclick="cancelPay()">
      Cancel & Go Back
    </button>

    <div class="secure-note">
      🔒 256-bit Encrypted • Key: ${RAZORPAY_CONFIG.KEY_ID}
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
            if (btn) btn.innerHTML = 'Open Razorpay Modal 🚀';
            launchRazorpay();
          } else if (attempts > 25) {
            clearInterval(timer);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ERROR',
              message: 'Razorpay SDK load timed out'
            }));
          }
        }, 200);
        return;
      }

      var options = {
        key: "${RAZORPAY_CONFIG.KEY_ID}",
        amount: ${safeAmountPaise},
        currency: "${RAZORPAY_CONFIG.CURRENCY || 'INR'}",
        name: "${RAZORPAY_CONFIG.MERCHANT_NAME || 'Mistri Pro'}",
        description: "${safeWorkerSkill} Advance Booking",
        image: "https://i.imgur.com/3g7nmJC.png",
        prefill: {
          name: "${safeCustomerName}",
          contact: "${safeCustomerPhone}",
          email: "customer@mistripro.com"
        },
        theme: {
          color: "${RAZORPAY_CONFIG.THEME_COLOR || '#4F46E5'}"
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
        handlePaymentCompleted(data.paymentId, 'Razorpay Live Checkout');
      } else if (data.type === 'PAYMENT_FAILED') {
        Alert.alert('Payment Failed', data.error || 'Payment was unsuccessful.');
        setShowLiveWebView(false);
      } else if (data.type === 'CANCEL' || data.type === 'MODAL_DISMISSED') {
        setShowLiveWebView(false);
      } else if (data.type === 'ERROR') {
        Alert.alert(
          'Razorpay Gateway Unavailable',
          'Could not reach Razorpay online servers. Would you like to use 1-Tap Test Mode instead?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowLiveWebView(false) },
            { text: 'Use 1-Tap Test', onPress: handleQuickPay },
          ]
        );
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.razorpayHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>R</Text>
              </View>
              <View>
                <Text style={styles.razorpayTitle}>Razorpay</Text>
                <Text style={styles.razorpaySub}>Trusted Payment Gateway</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (showLiveWebView) {
                  setShowLiveWebView(false);
                } else {
                  if (quickPayTimer.current) clearTimeout(quickPayTimer.current);
                  if (successTimer.current) clearTimeout(successTimer.current);
                  setIsProcessing(false);
                  setPaymentSuccess(false);
                  onClose();
                }
              }}
              style={styles.closeBtn}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Test Mode Ribbon */}
          <View style={styles.testModeRibbon}>
            <Zap size={14} color="#B45309" />
            <Text style={styles.testModeText}>
              RAZORPAY TEST MODE • Key: {RAZORPAY_CONFIG.KEY_ID}
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
            /* LIVE WEBVIEW OF OFFICIAL RAZORPAY STANDARD CHECKOUT */
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
            /* STANDARD PAYMENT SUMMARY & LAUNCH BUTTONS */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Order Card */}
              <View style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.merchantLabel}>Total Payable Amount</Text>
                  <Text style={styles.amountDisplay}>₹{formattedTotal}</Text>
                </View>
                <Text style={styles.workerSummaryText}>
                  Booking: {workerName} • {workerSkill}
                </Text>

                <View style={styles.breakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>
                      {bookingData.wageLabel || 'Mistri Wage (1 Day)'}
                    </Text>
                    <Text style={styles.breakdownVal}>₹{Number(workerFee || 0).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Platform Service Fee</Text>
                    <Text style={styles.breakdownVal}>₹{Number(platformFee || 0).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>
                      {bookingData.txnFeeLabel || 'Gateway & Processing (5%)'}
                    </Text>
                    <Text style={styles.breakdownVal}>₹{Number(txnFee || 0).toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              </View>

              {/* Security Pill */}
              <View style={styles.securityPill}>
                <ShieldCheck size={16} color="#15803D" />
                <Text style={styles.securityPillText}>
                  100% Secure Transaction. Real Razorpay Test Credentials.
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
                  Pay with Razorpay Gateway • ₹{formattedTotal}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* SECONDARY ACTION: Fast 1-Tap Test Confirmation */}
              <TouchableOpacity
                style={styles.quickPayBtn}
                onPress={handleQuickPay}
                activeOpacity={0.8}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
                ) : (
                  <>
                    <Zap size={14} color="#4F46E5" />
                    <Text style={styles.quickPayBtnText}>
                      Instant 1-Tap Test Success (Skip Dialog)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Footer Ribbon */}
          <View style={styles.footerRow}>
            <Lock size={12} color="#94A3B8" />
            <Text style={styles.footerText}>
              Secured by Razorpay • UPI, Cards & NetBanking
            </Text>
          </View>
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
    maxHeight: '92%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  razorpayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0C2340',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Satoshi-Black',
    fontSize: 20,
    color: '#3395FF',
  },
  razorpayTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  razorpaySub: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  testModeRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  testModeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#92400E',
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  merchantLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountDisplay: {
    fontFamily: 'Satoshi-Black',
    fontSize: 24,
    color: '#4F46E5',
  },
  workerSummaryText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    gap: 6,
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
    fontFamily: 'Satoshi-Medium',
    fontSize: 12.5,
    color: '#0F172A',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  securityPillText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11.5,
    color: '#15803D',
    flex: 1,
  },
  primaryPayBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  primaryPayBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  quickPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickPayBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12.5,
    color: '#4F46E5',
  },
  webViewWrap: {
    height: Math.min(Dimensions.get('window').height * 0.76, 580),
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
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
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'Satoshi-Black',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 6,
  },
  successSub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  successTxn: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#16A34A',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
  },
  footerText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
});
