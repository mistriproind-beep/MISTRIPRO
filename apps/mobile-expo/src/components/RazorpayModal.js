import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  X,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react-native';
import { DeviceFeedback } from '../services/deviceFeedback';
import { RAZORPAY_CONFIG } from '../services/razorpayConfig';

export default function RazorpayModal({
  visible,
  onClose,
  bookingData,
  onPaymentSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!bookingData) return null;

  const {
    workerName = 'Mistri',
    workerSkill = 'Labour',
    workerFee = 950,
    platformFee = 99,
    txnFee = 48,
    totalAmount = 1097,
  } = bookingData;

  const handlePay = () => {
    setIsProcessing(true);
    DeviceFeedback.triggerAlertHaptics();

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      DeviceFeedback.triggerSuccessHaptics();

      setTimeout(() => {
        setPaymentSuccess(false);
        const paymentId = `pay_${RAZORPAY_CONFIG.KEY_ID.slice(9, 13)}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...bookingData,
            paymentId,
            paymentMethod: selectedMethod,
            paidAt: new Date().toISOString(),
          });
        }
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Razorpay Brand Header */}
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
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Test Mode Warning Ribbon */}
          <View style={styles.testModeRibbon}>
            <Zap size={14} color="#B45309" />
            <Text style={styles.testModeText}>RAZORPAY LIVE GATEWAY • Key: {RAZORPAY_CONFIG.KEY_ID}</Text>
          </View>

          {paymentSuccess ? (
            <View style={styles.successState}>
              <View style={styles.successCircle}>
                <CheckCircle2 size={44} color="#16A34A" />
              </View>
              <Text style={styles.successTitle}>Payment Verified via Razorpay!</Text>
              <Text style={styles.successSub}>₹{totalAmount} locked safely in Digital Escrow</Text>
              <Text style={styles.successTxn}>Key: {RAZORPAY_CONFIG.KEY_ID}</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Order Summary Box */}
              <View style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.merchantLabel}>Paying to Mistri Pro Escrow</Text>
                  <Text style={styles.amountDisplay}>₹{totalAmount}</Text>
                </View>
                <Text style={styles.workerSummaryText}>
                  Booking: {workerName} • {workerSkill}
                </Text>

                <View style={styles.breakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Mistri Wage (1 Day)</Text>
                    <Text style={styles.breakdownVal}>₹{workerFee}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Platform Service Fee</Text>
                    <Text style={styles.breakdownVal}>₹{platformFee}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Digital Escrow & Processing (5%)</Text>
                    <Text style={styles.breakdownVal}>₹{txnFee}</Text>
                  </View>
                </View>
              </View>

              {/* Payment Methods Selector */}
              <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
              <View style={styles.methodsRow}>
                <TouchableOpacity
                  style={[styles.methodTab, selectedMethod === 'UPI' && styles.methodTabActive]}
                  onPress={() => setSelectedMethod('UPI')}
                  activeOpacity={0.8}
                >
                  <Smartphone size={18} color={selectedMethod === 'UPI' ? '#0C2340' : '#64748B'} />
                  <Text style={[styles.methodTabText, selectedMethod === 'UPI' && styles.methodTabTextActive]}>
                    UPI / QR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodTab, selectedMethod === 'CARD' && styles.methodTabActive]}
                  onPress={() => setSelectedMethod('CARD')}
                  activeOpacity={0.8}
                >
                  <CreditCard size={18} color={selectedMethod === 'CARD' ? '#0C2340' : '#64748B'} />
                  <Text style={[styles.methodTabText, selectedMethod === 'CARD' && styles.methodTabTextActive]}>
                    Test Card
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodTab, selectedMethod === 'NETBANKING' && styles.methodTabActive]}
                  onPress={() => setSelectedMethod('NETBANKING')}
                  activeOpacity={0.8}
                >
                  <Building2 size={18} color={selectedMethod === 'NETBANKING' ? '#0C2340' : '#64748B'} />
                  <Text style={[styles.methodTabText, selectedMethod === 'NETBANKING' && styles.methodTabTextActive]}>
                    Net Banking
                  </Text>
                </TouchableOpacity>
              </View>

              {/* UPI Tab View */}
              {selectedMethod === 'UPI' && (
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>UPI ID (Google Pay / PhonePe / Paytm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="mobile@upi or username@bank"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />
                  <View style={styles.quickUpiRow}>
                    <TouchableOpacity style={styles.upiChip} onPress={() => setUpiId('customer@okaxis')}>
                      <Text style={styles.upiChipText}>GPay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.upiChip} onPress={() => setUpiId('customer@ybl')}>
                      <Text style={styles.upiChipText}>PhonePe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.upiChip} onPress={() => setUpiId('customer@paytm')}>
                      <Text style={styles.upiChipText}>Paytm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.upiChip} onPress={() => setUpiId('success@razorpay')}>
                      <Text style={styles.upiChipText}>Test Auto-Pass</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Test Card Tab View */}
              {selectedMethod === 'CARD' && (
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Razorpay Sandbox Test Card</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="4111 2222 3333 4444"
                    keyboardType="numeric"
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Expiry</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        placeholder="MM/YY"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <TextInput
                        style={styles.textInput}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        placeholder="123"
                        secureTextEntry
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Netbanking Tab View */}
              {selectedMethod === 'NETBANKING' && (
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Select Bank (Simulated)</Text>
                  <View style={styles.bankGrid}>
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b) => (
                      <View key={b} style={styles.bankPill}>
                        <Building2 size={14} color="#4F46E5" />
                        <Text style={styles.bankPillText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Escrow Guarantee Footer Note */}
              <View style={styles.escrowNote}>
                <Lock size={14} color="#15803D" />
                <Text style={styles.escrowNoteText}>
                  Razorpay 256-bit SSL Escrow: Money is held securely in escrow and only released to the worker when you confirm job completion.
                </Text>
              </View>

              {/* Pay Button */}
              <TouchableOpacity
                style={styles.payBtn}
                onPress={handlePay}
                disabled={isProcessing}
                activeOpacity={0.85}
              >
                {isProcessing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.payBtnText}>Processing via Razorpay...</Text>
                  </View>
                ) : (
                  <Text style={styles.payBtnText}>Pay ₹{totalAmount} via Razorpay</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
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
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    color: '#3395FF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 18,
    fontWeight: '900',
  },
  razorpayTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: '#0C2340',
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
  testModeRibbon: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testModeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#B45309',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  orderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchantLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  amountDisplay: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 20,
    color: '#0F172A',
  },
  workerSummaryText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#4F46E5',
    marginBottom: 8,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    gap: 4,
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
    fontSize: 12,
    color: '#334155',
  },
  sectionTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  methodTabActive: {
    borderColor: '#0C2340',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
  },
  methodTabText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  methodTabTextActive: {
    fontFamily: 'Satoshi-Bold',
    color: '#0C2340',
  },
  inputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'Satoshi-Medium',
    fontSize: 13,
    color: '#0F172A',
  },
  quickUpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  upiChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upiChipText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#4F46E5',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bankPillText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#334155',
  },
  escrowNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  escrowNoteText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: '#15803D',
    flex: 1,
    lineHeight: 15,
  },
  payBtn: {
    backgroundColor: '#0C2340',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#0C2340',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  successState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  },
  successSub: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: '#16A34A',
    marginBottom: 4,
  },
  successTxn: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: '#64748B',
  },
});
