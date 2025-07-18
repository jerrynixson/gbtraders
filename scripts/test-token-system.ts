/**
 * Test script for the Token System
 * Run this in the browser console or as a Node.js script to test token functionality
 */

// Test configuration
const TEST_CONFIG = {
  USER_ID: 'test-dealer-123',
  USER_TYPE: 'dealer' as const,
  PLAN_NAME: 'Traders Gold',
  TOTAL_TOKENS: 15,
  VALIDITY: 30
};

// Import required functions (adjust path as needed)
import { tokenRepository } from '../lib/db/repositories/tokenRepository';
import { canCreateListing, getTokenErrorMessage } from '../lib/utils/tokenUtils';

async function testTokenSystem() {
  console.log('🚀 Starting Token System Tests...');
  
  try {
    // Test 1: Check initial token availability
    console.log('\n📊 Test 1: Check Token Availability');
    const availability = await tokenRepository.checkTokenAvailability(
      TEST_CONFIG.USER_ID, 
      TEST_CONFIG.USER_TYPE
    );
    console.log('Token Availability:', availability);

    // Test 2: Update user plan (simulate successful payment)
    console.log('\n💳 Test 2: Update User Plan');
    await tokenRepository.updateUserPlan(
      TEST_CONFIG.USER_ID,
      TEST_CONFIG.USER_TYPE,
      {
        planName: TEST_CONFIG.PLAN_NAME,
        totalTokens: TEST_CONFIG.TOTAL_TOKENS,
        validity: TEST_CONFIG.VALIDITY,
        amount: 250.00,
        stripeSessionId: 'test_session_123'
      }
    );
    console.log('✅ Plan updated successfully');

    // Test 3: Check availability after plan update
    console.log('\n📊 Test 3: Check Token Availability After Plan Update');
    const newAvailability = await tokenRepository.checkTokenAvailability(
      TEST_CONFIG.USER_ID, 
      TEST_CONFIG.USER_TYPE
    );
    console.log('New Token Availability:', newAvailability);

    // Test 4: Test listing creation permission
    console.log('\n🆕 Test 4: Check Listing Creation Permission');
    const canCreate = await canCreateListing(TEST_CONFIG.USER_ID, TEST_CONFIG.USER_TYPE);
    console.log('Can Create Listing:', canCreate);

    // Test 5: Activate token for a test vehicle
    console.log('\n🔄 Test 5: Activate Vehicle Token');
    const testVehicleId = 'test-vehicle-456';
    const activateResult = await tokenRepository.activateVehicleToken(
      TEST_CONFIG.USER_ID,
      testVehicleId,
      TEST_CONFIG.USER_TYPE
    );
    console.log('Token Activation Result:', activateResult);

    // Test 6: Check availability after token activation
    console.log('\n📊 Test 6: Check Availability After Token Use');
    const afterUseAvailability = await tokenRepository.checkTokenAvailability(
      TEST_CONFIG.USER_ID, 
      TEST_CONFIG.USER_TYPE
    );
    console.log('Availability After Use:', afterUseAvailability);

    // Test 7: Deactivate token
    console.log('\n🔄 Test 7: Deactivate Vehicle Token');
    const deactivateResult = await tokenRepository.deactivateVehicleToken(
      TEST_CONFIG.USER_ID,
      testVehicleId,
      'user_choice',
      TEST_CONFIG.USER_TYPE
    );
    console.log('Token Deactivation Result:', deactivateResult);

    // Test 8: Final availability check
    console.log('\n📊 Test 8: Final Token Availability Check');
    const finalAvailability = await tokenRepository.checkTokenAvailability(
      TEST_CONFIG.USER_ID, 
      TEST_CONFIG.USER_TYPE
    );
    console.log('Final Availability:', finalAvailability);

    // Test 9: Get all vehicles for dealer
    console.log('\n🚗 Test 9: Get All Dealer Vehicles');
    const allVehicles = await tokenRepository.getDealerAllVehicles(TEST_CONFIG.USER_ID);
    console.log('All Vehicles:', allVehicles);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test error message generation
function testErrorMessages() {
  console.log('\n📝 Testing Error Messages:');
  console.log('Plan Expired:', getTokenErrorMessage('plan_expired'));
  console.log('No Plan:', getTokenErrorMessage('no_plan'));
  console.log('No Tokens:', getTokenErrorMessage('no_tokens'));
  console.log('Unknown:', getTokenErrorMessage('unknown'));
}

// Export test functions
export {
  testTokenSystem,
  testErrorMessages
};

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('Token System Test Script Loaded');
  console.log('Run testTokenSystem() to start tests');
  console.log('Run testErrorMessages() to test error messages');
}

// Example usage:
// testTokenSystem();
// testErrorMessages();
