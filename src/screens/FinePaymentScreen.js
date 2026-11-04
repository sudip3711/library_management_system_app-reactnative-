
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import RazorpayCheckout from 'react-native-razorpay';

import {
  createPaymentOrder,
  verifyPayment,
} from '../services/paymentService';

const COLORS = {
  primary: '#315CFF',
  primaryDark: '#2448D8',
  background: '#F5F7FB',
  white: '#FFFFFF',
  text: '#172033',
  secondary: '#758096',
  border: '#E7EAF0',
  success: '#16A36A',
  danger: '#E5484D',
  lightBlue: '#EAF0FF',
  lightGreen: '#E8F8F0',
};

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const FinePaymentScreen = ({ navigation, route }) => {
  const member = route?.params?.member;

  const [loading, setLoading] = useState(false);

  if (!member) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={55}
          color={COLORS.danger}
        />
        <Text style={styles.errorTitle}>Member details not found</Text>
        <Text style={styles.errorText}>
          Please go back and select a member again.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const fineAmount = Number(member.fineAmount || 0);

  const handlePayment = async () => {
    if (loading) return;

    if (fineAmount <= 0) {
      Alert.alert('No Pending Fine', 'This member has no outstanding fine.');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create Razorpay order from backend
      const order = await createPaymentOrder(member.id);

      if (!order?.orderId || !order?.keyId || !order?.amount) {
        throw new Error('Invalid payment order received from server.');
      }

      // Step 2: Open Razorpay Checkout
      const options = {
        key: order.keyId,
        amount: String(order.amount),
        currency: order.currency || 'INR',
        order_id: order.orderId,

        name: 'Library Management System',
        description: 'Library Fine Payment',

        prefill: {
          name: member.name || '',
          email: member.email || '',
          contact: member.phone ? String(member.phone) : '',
        },

        theme: {
          color: COLORS.primary,
        },
      };

      const paymentResponse = await RazorpayCheckout.open(options);

      // Step 3: Verify payment on backend
      const verification = await verifyPayment({
        memberId: member.id,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      if (
        verification?.success === true ||
        verification?.success === 'true'
      ) {
        Alert.alert(
          'Payment Successful',
          `Your payment of ${formatCurrency(
            order.fineAmount ?? Number(order.amount) / 100
          )} was successful.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(
          verification?.message || 'Payment verification failed.'
        );
      }
    } catch (error) {
      const description =
        error?.description ||
        error?.message ||
        'Something went wrong while processing your payment.';

      // Razorpay cancellation is not a payment success.
      const isCancelled =
        error?.code === 'PAYMENT_CANCELLED' ||
        error?.code === '2';

      Alert.alert(
        isCancelled ? 'Payment Cancelled' : 'Payment Failed',
        isCancelled
          ? 'You cancelled the payment. No successful payment was recorded.'
          : description
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pay Fine</Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountIcon}>
            <Ionicons name="wallet-outline" size={27} color={COLORS.white} />
          </View>

          <Text style={styles.amountLabel}>Total Outstanding Fine</Text>

          <Text style={styles.amountValue}>
            {formatCurrency(fineAmount)}
          </Text>

          <Text style={styles.amountSubtext}>
            Please complete your pending fine payment.
          </Text>
        </View>

        {/* Member Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member Information</Text>

          <View style={styles.memberCard}>
            <View style={styles.avatar}>
              <Ionicons
                name="person-outline"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.name || 'Unknown Member'}
              </Text>
              <Text style={styles.memberId}>
                Member ID: {member.id}
              </Text>
            </View>

            <View style={styles.memberStatus}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.success}
              />
            </View>

            <View style={styles.memberDetails}>
              <View style={styles.detailRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.secondary}
                />
                <Text style={styles.detailText}>
                  {member.email || 'Email not available'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={COLORS.secondary}
                />
                <Text style={styles.detailText}>
                  {member.phone || 'Phone not available'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fine Amount</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(fineAmount)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(fineAmount)}
              </Text>
            </View>

            <Text style={styles.currencyNote}>
              Currency: Indian Rupee (INR)
            </Text>
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (loading || fineAmount <= 0) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={loading || fineAmount <= 0}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.payButtonText}>
                Pay {formatCurrency(fineAmount)}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={COLORS.white}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Security Information */}
        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={23}
            color={COLORS.success}
          />

          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityText}>
              Payments are processed securely through Razorpay. Your payment
              is verified by our server.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Powered by Razorpay
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FinePaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 25,
  },

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
  },

  headerRight: {
    width: 42,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  amountCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },

  amountIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  amountLabel: {
    fontSize: 14,
    color: '#E2E9FF',
    fontWeight: '500',
  },

  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 8,
  },

  amountSubtext: {
    fontSize: 12,
    color: '#E2E9FF',
    marginTop: 9,
    textAlign: 'center',
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 13,
  },

  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberInfo: {
    flex: 1,
    marginLeft: 13,
  },

  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  memberId: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 5,
  },

  memberStatus: {
    marginLeft: 8,
  },

  memberDetails: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 17,
    paddingTop: 14,
    gap: 13,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  detailText: {
    fontSize: 13,
    color: COLORS.secondary,
    flex: 1,
  },

  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 17,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  totalValue: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.primary,
  },

  currencyNote: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 14,
  },

  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 57,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 11,
    marginTop: 27,
    elevation: 3,
  },

  disabledButton: {
    opacity: 0.55,
  },

  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  securityCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGreen,
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    gap: 12,
    alignItems: 'flex-start',
  },

  securityInfo: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  securityText: {
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 18,
    marginTop: 4,
  },

  footerText: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 22,
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 15,
  },

  errorText: {
    fontSize: 13,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 8,
  },

  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 22,
  },

  backButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
