import { apiRequest } from './api';

const parseResponse = (response) => {
  if (typeof response === 'string') {
    return JSON.parse(response);
  }

  return response;
};

// Create Razorpay order
export const createPaymentOrder = async (memberId) => {
  const response = await apiRequest(
    `/api/payments/create-order/${memberId}`,
    {
      method: 'POST',
    }
  );

  return parseResponse(response);
};

// Verify Razorpay payment
export const verifyPayment = async (data) => {
  const response = await apiRequest('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return parseResponse(response);
};

// Get payment history
export const getPaymentHistory = async (memberId) => {
  const response = await apiRequest(
    `/api/payments/history/${memberId}`
  );

  return parseResponse(response);
};