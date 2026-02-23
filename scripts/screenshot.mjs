import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'docs', 'images');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'admin@cortex.local');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/*', { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Screenshot 1: Topics overview
  console.log('Capturing topics page...');
  await page.goto('http://localhost:5173/topics');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outputDir, 'topics-overview.png'), fullPage: false });
  console.log('  -> topics-overview.png');

  // Screenshot 2: Topic detail - SPY VWAP (has first principles + scorecard)
  console.log('Capturing topic detail...');
  await page.goto('http://localhost:5173/topics/1420fda9-dad4-4ea2-876e-9e04891ef3ca');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(outputDir, 'topic-detail.png'), fullPage: false });
  console.log('  -> topic-detail.png');

  // Screenshot 3: Scroll to scorecard section
  console.log('Capturing scorecard...');
  // Find and scroll to the Progress Scorecard section
  const scorecardEl = await page.$('text=Progress Scorecard');
  if (scorecardEl) {
    await scorecardEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    // Scroll up a bit so the heading is visible
    await page.evaluate(() => window.scrollBy(0, -80));
    await page.waitForTimeout(500);
  } else {
    // Just scroll to success criteria area
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: join(outputDir, 'topic-scorecard.png'), fullPage: false });
  console.log('  -> topic-scorecard.png');

  // Screenshot 4: Scroll further to see pipeline / research
  console.log('Capturing pipeline...');
  const pipelineEl = await page.$('text=AI Research Pipeline') ||
                     await page.$('text=Run Full Cycle') ||
                     await page.$('text=Pipeline');
  if (pipelineEl) {
    await pipelineEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollBy(0, -80));
    await page.waitForTimeout(500);
  } else {
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: join(outputDir, 'topic-pipeline.png'), fullPage: false });
  console.log('  -> topic-pipeline.png');

  // Screenshot 5: Dashboard
  console.log('Capturing dashboard...');
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outputDir, 'dashboard.png'), fullPage: false });
  console.log('  -> dashboard.png');

  // Screenshot 6: Search with actual results
  console.log('Capturing search...');
  await page.goto('http://localhost:5173/search');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const searchInput = await page.$('input[type="text"], input[type="search"], input[placeholder*="earch"]');
  if (searchInput) {
    await searchInput.fill('decision architecture');
    await searchInput.press('Enter');
    await page.waitForTimeout(3000);
  }
  await page.screenshot({ path: join(outputDir, 'search.png'), fullPage: false });
  console.log('  -> search.png');

  // Screenshot 7: Try CSI backtesting topic for variety
  console.log('Capturing CSI topic...');
  // Find CSI topic ID from topics page
  await page.goto('http://localhost:5173/topics');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const csiLink = await page.$('a:has-text("CSI Backtesting")');
  if (csiLink) {
    await csiLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(outputDir, 'topic-csi.png'), fullPage: false });
    console.log('  -> topic-csi.png');
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to docs/images/');
}

main().catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
