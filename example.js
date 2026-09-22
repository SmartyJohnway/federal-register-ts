const { FederalRegisterClient } = require('./dist');

async function runExample() {
  console.log('🔍 Running federal-register-ts example...');

  try {
    if (!FederalRegisterClient) {
      throw new Error('Could not load FederalRegisterClient from the package.');
    }
    console.log('✅ FederalRegisterClient loaded successfully.');

    const client = new FederalRegisterClient();
    console.log('📡 Fetching agencies list...');
    const agencies = await client.agencies.list();

    if (Array.isArray(agencies)) {
      console.log(`✅ Retrieved ${agencies.length} agencies.`);
      if (agencies.length > 0) {
        console.log(`   Sample Agency: ${agencies[0].name || agencies[0].short_name}`);
      }
    }
  } catch (error) {
    console.error('❌ Example execution error:', error);
  }
}

runExample();