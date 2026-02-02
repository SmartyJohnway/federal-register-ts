const { Client } = require('./'); // 這會自動引用 package.json 中定義的 "main": "dist/index.js"

async function runVerification() {
  console.log('🔍 Starting verification of federal-register-ts...');

  try {
    // 1. 驗證模組是否能正確載入
    if (!Client) {
      throw new Error('Could not load Client from the package. Check exports in index.ts.');
    }
    console.log('✅ Module loaded successfully (CommonJS require works).');

    // 2. 驗證 API 連線 (使用 Client.get 直接呼叫 /agencies)
    console.log('📡 Attempting to fetch agencies from Federal Register API...');
    // 請求 3 筆機構資料作為測試
    const response = await Client.get('/agencies', { per_page: 3 });
    
    if (Array.isArray(response)) {
      console.log(`✅ API Call Successful! Retrieved ${response.length} agencies.`);
      console.log(`   Sample Agency: ${response[0].name || response[0].short_name}`);
    } else {
      console.warn('⚠️ API responded but format was unexpected:', response);
    }
    
  } catch (error) {
    console.error('❌ Verification Failed:', error);
    if (error.message && error.message.includes('fetch is not defined')) {
      console.error('   👉 Note: You need Node.js v18+ to use the native fetch API.');
    }
  }
}

runVerification();