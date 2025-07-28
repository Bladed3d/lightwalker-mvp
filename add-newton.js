// Test adding just Isaac Newton
async function addNewton() {
  const newton = {
    fullName: 'Sir Isaac Newton',
    commonName: 'Isaac Newton',
    lifeSpan: '1643-1727 (84 years)',
    primaryDomain: 'Mathematical physics and natural philosophy',
    lifeMission: 'Understand the mathematical laws governing the natural world',
    coreValues: [
      'Pursuit of absolute truth through mathematics',
      'Systematic observation and experimentation',
      'Logical reasoning over accepted authority'
    ],
    famousQuotes: [
      'If I have seen further it is by standing on the shoulders of giants',
      'Nature is pleased with simplicity',
      'Genius is patience'
    ],
    contemporaryRelevance: 'Newton\'s systematic approach to problem-solving remains fundamental to modern science and logical thinking.',
    characterDevelopment: 'By studying Newton\'s methods, users can develop systematic thinking and dedication to truth.'
  };

  try {
    console.log('Adding Isaac Newton...');
    
    const response = await fetch('https://lightwalker-mvp.vercel.app/api/role-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newton)
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Successfully added Isaac Newton');
    } else {
      console.log('❌ Failed to add Isaac Newton');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

addNewton();