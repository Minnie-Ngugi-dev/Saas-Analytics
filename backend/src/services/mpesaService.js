import axios from 'axios';
import mpesaConfig from '../config/mpesa.js';
import { getTimestamp, formatPhoneNumber } from '../utils/helpers.js';

class MpesaService {
  constructor() {
    this.consumerKey = mpesaConfig.consumerKey;
    this.consumerSecret = mpesaConfig.consumerSecret;
    this.passkey = mpesaConfig.passkey;
    this.shortCode = mpesaConfig.shortCode;
    this.baseUrl = mpesaConfig.baseUrl;
    this.callbackUrl = mpesaConfig.callbackUrl;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    try {
      // Check if token is still valid (with 5 min buffer)
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        { 
          headers: { 
            Authorization: `Basic ${auth}` 
          } 
        }
      );
      
      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, set expiry to 50 minutes
      this.tokenExpiry = Date.now() + 50 * 60 * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('M-Pesa Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token. Check your credentials.');
    }
  }

  async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      // Validate configuration first
      if (!this.consumerKey || !this.consumerSecret || !this.passkey) {
        throw new Error('M-Pesa credentials not configured. Add MPESA_* variables to .env');
      }

      const token = await this.getAccessToken();
      const timestamp = getTimestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${timestamp}`
      ).toString('base64');

      const formattedPhone = formatPhoneNumber(phoneNumber);

      const requestBody = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // Ensure integer
        PartyA: formattedPhone,
        PartyB: this.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${this.callbackUrl}/api/payments/mpesa-callback`,
        AccountReference: accountReference.substring(0, 12), // Max 12 chars
        TransactionDesc: transactionDesc.substring(0, 13) // Max 13 chars
      };

      console.log('M-Pesa STK Push Request:', {
        ...requestBody,
        Password: '***HIDDEN***'
      });

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('M-Pesa STK Push Response:', response.data);

      if (response.data.ResponseCode !== '0') {
        throw new Error(response.data.ResponseDescription || 'STK Push failed');
      }

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDesc: response.data.ResponseDescription,
        merchantRequestId: response.data.MerchantRequestID
      };
    } catch (error) {
      console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
      
      // Provide user-friendly error messages
      if (error.response?.data?.errorCode === '500.002.1001') {
        throw new Error('Invalid M-Pesa credentials. Check your consumer key and secret.');
      } else if (error.response?.data?.errorCode === '500.002.1002') {
        throw new Error('Invalid M-Pesa shortcode or passkey.');
      } else {
        throw new Error(error.message || 'Failed to initiate M-Pesa payment. Please try again.');
      }
    }
  }

  async queryStatus(checkoutRequestId) {
    try {
      const token = await this.getAccessToken();
      const timestamp = getTimestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${timestamp}`
      ).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        result: response.data
      };
    } catch (error) {
      console.error('M-Pesa Query Error:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }

  async simulateC2B(phoneNumber, amount, reference) {
    // For sandbox testing only
    if (mpesaConfig.environment !== 'sandbox') {
      throw new Error('C2B simulation only available in sandbox');
    }

    try {
      const token = await this.getAccessToken();
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const response = await axios.post(
        `${this.baseUrl}/mpesa/c2b/v1/simulate`,
        {
          ShortCode: this.shortCode,
          CommandID: 'CustomerPayBillOnline',
          Amount: amount,
          Msisdn: formattedPhone,
          BillRefNumber: reference
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('C2B Simulation Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Register URLs for C2B (for production)
  async registerUrls(confirmationUrl, validationUrl) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/mpesa/c2b/v1/registerurl`,
        {
          ShortCode: this.shortCode,
          ResponseType: 'Completed',
          ConfirmationURL: confirmationUrl,
          ValidationURL: validationUrl
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Register URLs Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export singleton instance
const mpesaService = new MpesaService();
export default mpesaService;