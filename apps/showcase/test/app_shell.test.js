import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('App Shell & Foundation Components Structure', async (t) => {
  await t.test('All primary UI surface components exist', () => {
    const componentsDir = path.resolve(__dirname, '../src/components');
    const requiredComponents = [
      'Navbar.tsx',
      'Card.tsx',
      'Button.tsx',
      'Badge.tsx',
      'FeedbackStates.tsx',
      'ExploreView.tsx',
      'DeveloperView.tsx',
      'TradeExamplesView.tsx',
      'CapabilitiesView.tsx',
    ];

    for (const comp of requiredComponents) {
      const fullPath = path.join(componentsDir, comp);
      assert.ok(fs.existsSync(fullPath), `Component ${comp} must exist`);
    }
  });

  await t.test('App.tsx integrates TanStack QueryClientProvider and navigation tabs', () => {
    const appPath = path.resolve(__dirname, '../src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');

    assert.ok(appContent.includes('QueryClientProvider'), 'App must include QueryClientProvider');
    assert.ok(appContent.includes('Navbar'), 'App must include Navbar');
    assert.ok(appContent.includes('ExploreView'), 'App must include ExploreView');
    assert.ok(appContent.includes('DeveloperView'), 'App must include DeveloperView');
    assert.ok(appContent.includes('TradeExamplesView'), 'App must include TradeExamplesView');
    assert.ok(appContent.includes('CapabilitiesView'), 'App must include CapabilitiesView');
  });
});
