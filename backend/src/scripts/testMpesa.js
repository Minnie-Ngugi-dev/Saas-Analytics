import dotenv from 'dotenv';
import mpesaService from '../services/mpesaService.js';

dotenv.config();

async function testMpesa() {
  console.log('🧪 Testing M-Pesa Integration...\n');
  
  // Test 1: Get Access Token
  console.log('📡 Test 1: Getting Access Token...');
  try {
    const token = await mpesaService.getAccessToken();
    console.log('✅ Access Token acquired:', token ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
  
  // Test 2: STK Push
  console.log('\n💰 Test 2: STK Push...');
  try {
    const result = await mpesaService.stkPush(
      '254708374149',  // Test phone
      10,              // Amount Ksh 10
      'TEST123',       // Account reference
      'Test Payment'   // Description
    );
    console.log('✅ STK Push initiated:', result);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
}

testMpesa();