/**
 * Test script for the Activity Preferences API
 * Run with: node test-preferences-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testPreferencesAPI() {
  console.log('🧪 Testing Activity Preferences API...\n');
  
  const testData = {
    sessionId: `test_${Date.now()}`,
    activityId: 'test-activity-1',
    activityTitle: 'Morning Meditation',
    customDuration: '45 min',
    customPoints: 50,
    customDifficulty: 4,
    customCategory: 'mindfulness'
  };

  try {
    // Test 1: Save a preference
    console.log('1️⃣ Testing POST /api/activities/preferences...');
    const saveResponse = await fetch(`${BASE_URL}/api/activities/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const saveResult = await saveResponse.json();
    console.log('✅ Save result:', saveResult);
    
    if (!saveResult.success) {
      throw new Error(`Save failed: ${saveResult.error}`);
    }

    // Test 2: Retrieve preferences
    console.log('\n2️⃣ Testing GET /api/activities/preferences...');
    const getResponse = await fetch(
      `${BASE_URL}/api/activities/preferences?sessionId=${testData.sessionId}`
    );
    
    const getResult = await getResponse.json();
    console.log('✅ Get result:', getResult);
    
    if (!getResult.success || !Array.isArray(getResult.data)) {
      throw new Error(`Get failed: ${getResult.error}`);
    }

    // Test 3: Retrieve specific activity preference
    console.log('\n3️⃣ Testing GET specific activity preference...');
    const specificResponse = await fetch(
      `${BASE_URL}/api/activities/preferences?sessionId=${testData.sessionId}&activityId=${testData.activityId}`
    );
    
    const specificResult = await specificResponse.json();
    console.log('✅ Specific get result:', specificResult);
    
    if (!specificResult.success) {
      throw new Error(`Specific get failed: ${specificResult.error}`);
    }

    // Test 4: Update preference (save again with different values)
    console.log('\n4️⃣ Testing preference update...');
    const updatedData = {
      ...testData,
      customDuration: '60 min',
      customPoints: 75
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/activities/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    const updateResult = await updateResponse.json();
    console.log('✅ Update result:', updateResult);
    
    if (!updateResult.success) {
      throw new Error(`Update failed: ${updateResult.error}`);
    }

    console.log('\n🎉 All tests passed! Activity Preferences API is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPreferencesAPI();
}

module.exports = { testPreferencesAPI };