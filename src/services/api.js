import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  ios: 'http://localhost:8085',
  android: 'http://10.0.2.2:8085',
  default: 'http://localhost:8085',
});

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const responseText = await response.text();

  let result;

  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = responseText;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === 'string'
        ? result
        : result?.message || 'API request failed'
    );
  }

  return result;
};

export default BASE_URL;