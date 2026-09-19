const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5173/';
const OUT = path.join(__dirname, 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SRC = path.join(__dirname, '..', 'which-happened-first', 'src');
const dataJs = fs.readFileSync(path.join(SRC, 'data.ts'), 'utf8')
  .replace(/export type [A-Za-z]+ = \{[\s\S]*?\};\n/g, '')
  .replaceAll('export const', 'const')
  .replace(/const (\w+)[^=]*=/g, 'const $1 =');
const { QUESTIONS } = new Function(`${dataJs}; return { QUESTIONS };`)();
const correctQ1 = [...QUESTIONS[0]].sort((a, b) => a.year - b.year);

async function clickButtonByText(page, text) {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t);
    if (b) { b.click(); return true; }
    return false;
  }, text);
  if (!ok) throw new Error(`button "${text}" not found`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  // Start screen — mobile 420px, full page
  await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, 'start-mobile.png'), fullPage: true });

  // Start screen — desktop 1024px
  await page.setViewport({ width: 1024, height: 800, deviceScaleFactor: 1 });
  await sleep(200);
  await page.screenshot({ path: path.join(OUT, 'start-desktop.png'), fullPage: true });

  // Back to mobile width for gameplay shots
  await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });
  await sleep(200);

  // Playing mid-question — arrange a MIXED result: slot 0 correct, slot 1 deliberately wrong
  await clickButtonByText(page, 'Start');
  await sleep(400);
  const getTitles = () =>
    page.$$eval('[data-testid="card-title"]', (els) => els.map((e) => e.textContent.trim()));
  let cur = await getTitles();
  let k = cur.indexOf(correctQ1[0].title);
  while (k > 0) {
    const ups = await page.$$('button[aria-label="Move up"]');
    await ups[k].click();
    await sleep(60);
    cur = await getTitles();
    k = cur.indexOf(correctQ1[0].title);
  }
  cur = await getTitles();
  const j = cur.indexOf(correctQ1[1].title);
  const downs = await page.$$('button[aria-label="Move down"]');
  await downs[j].click();
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, 'playing.png'), fullPage: true });

  // Revealed state — guaranteed mix of correct/incorrect cards
  await clickButtonByText(page, 'Submit');
  await sleep(400);
  const flags = await page.$$eval('[data-testid="card"]', (els) =>
    els.map((e) => e.getAttribute('data-correct')));
  const classes = await page.$$eval('[data-testid="card"]', (els) => els.map((e) => e.className));
  console.log('revealed data-correct:', JSON.stringify(flags));
  console.log('emerald cards:', classes.filter((c) => c.includes('border-emerald-600')).length,
    '| red cards:', classes.filter((c) => c.includes('border-red-700')).length);
  await page.screenshot({ path: path.join(OUT, 'revealed.png'), fullPage: true });

  // Play through the remaining 9 questions
  for (let q = 1; q < 10; q++) {
    await clickButtonByText(page, q === 9 ? 'Next' : 'Next');
    await sleep(250);
    await clickButtonByText(page, 'Submit');
    await sleep(250);
  }
  await clickButtonByText(page, 'See results');
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, 'results.png'), fullPage: true });

  // Leaderboard (with "You" row)
  await clickButtonByText(page, 'Leaderboard');
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, 'leaderboard.png'), fullPage: true });

  await browser.close();
  console.log('Saved to', OUT);
  fs.readdirSync(OUT).forEach((f) => console.log(' -', f));
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
