const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Load QUESTIONS from the app's data.ts (strip the type export, it's plain literals otherwise)
const dataTs = fs.readFileSync(
  path.join(__dirname, '..', 'which-happened-first', 'src', 'data.ts'),
  'utf8'
);
const dataJs = dataTs
  .replace(/export type HistoricalEvent = \{[\s\S]*?\};\n/, '')
  .replace(/export const QUESTIONS[^=]*=/, 'const QUESTIONS =');
const { QUESTIONS } = new Function(`${dataJs}; return { QUESTIONS };`)();
const correctOrders = QUESTIONS.map((q) => [...q].sort((a, b) => a.year - b.year));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5173/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`);
  if (!cond) failures++;
};

async function getTitles(page) {
  return page.$$eval('.text-lg.font-semibold', (els) => els.map((e) => e.textContent.trim()));
}
async function clickButtonByText(page, text) {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t);
    if (b) { b.click(); return true; }
    return false;
  }, text);
  if (!ok) throw new Error(`button "${text}" not found`);
}
async function bannerText(page) {
  return page.evaluate(() => {
    const el = document.querySelector(
      'div[class*="bg-emerald-500/20"], div[class*="bg-rose-500/20"]'
    );
    return el ? el.textContent.trim() : null;
  });
}
// Sort the on-screen cards into `wantTitles` order using only the Move up buttons
async function sortTo(page, wantTitles) {
  for (let i = 0; i < wantTitles.length; i++) {
    let cur = await getTitles(page);
    let k = cur.indexOf(wantTitles[i]);
    while (k > i) {
      const ups = await page.$$('button[aria-label="Move up"]');
      await ups[k].click();
      await sleep(60);
      cur = await getTitles(page);
      k = cur.indexOf(wantTitles[i]);
    }
  }
}
function slotsFor(shown, correct) {
  return correct.map((e, i) => shown[i] === e.title);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=420,900'],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // --- Start screen ---
  check('start screen title', await page.$eval('h1', (e) => e.textContent) === 'Which Happened First?');
  await clickButtonByText(page, 'Start');
  await sleep(300);

  // --- Q1: reorder with arrows, then sort correctly, submit ---
  let titles = await getTitles(page);
  check('Q1 shows 4 cards', titles.length === 4);
  const sortedQ1 = correctOrders[0].map((e) => e.title);
  check('Q1 not dealt pre-solved', JSON.stringify(titles) !== JSON.stringify(sortedQ1));

  const before = [...titles];
  const downs = await page.$$('button[aria-label="Move down"]');
  await downs[0].click();
  await sleep(100);
  titles = await getTitles(page);
  check('▼ swaps card 0 and 1', titles[0] === before[1] && titles[1] === before[0]);

  check('▲ disabled at index 0', await page.$eval(
    'button[aria-label="Move up"]', (b) => b.disabled));
  check('▼ disabled at last index', await page.$$eval(
    'button[aria-label="Move down"]', (bs) => bs[3].disabled));

  await sortTo(page, sortedQ1);
  titles = await getTitles(page);
  check('cards sorted to chronological via ▲', JSON.stringify(titles) === JSON.stringify(sortedQ1));

  const t1 = await page.$eval('span.tabular-nums', (e) => parseInt(e.textContent));
  await clickButtonByText(page, 'Submit');
  await sleep(300);
  let banner = await bannerText(page);
  check('Q1 correct banner', banner === `✓ Correct! +${100 + t1}`, `banner="${banner}" timeLeft=${t1}`);

  // revealed: labels in chronological order, all emerald
  const labels = await page.$$eval('div.ml-11', (els) => els.map((e) => e.textContent.trim()));
  check('revealed labels in correct order',
    JSON.stringify(labels) === JSON.stringify(correctOrders[0].map((e) => e.label)),
    JSON.stringify(labels));
  const borderClasses = await page.$$eval('.rounded-xl.bg-slate-800', (els) => els.map((e) => e.className));
  check('all 4 revealed cards emerald', borderClasses.every((c) => c.includes('border-emerald-500')));
  check('score header updated',
    (await page.$eval('body', (e) => e.innerText)).includes(`Score: ${100 + t1}`));

  let expectedScore = 100 + t1;
  let expectedCorrect = 1;
  let expectedStreak = 1;
  let expectedBest = 1;

  await clickButtonByText(page, 'Next');
  await sleep(300);

  // --- Q2: submit dealt order (guaranteed not all-correct), verify slot scoring ---
  titles = await getTitles(page);
  const q2slots = slotsFor(titles, correctOrders[1]);
  const q2pts = 10 * q2slots.filter(Boolean).length;
  await clickButtonByText(page, 'Submit');
  await sleep(300);
  banner = await bannerText(page);
  check('Q2 wrong banner + slot points', banner === `✗ Wrong · +${q2pts}`,
    `banner="${banner}" slots=${q2slots}`);
  const borders2 = await page.$$eval('.rounded-xl.bg-slate-800', (els) => els.map((e) => e.className));
  check('Q2 per-slot green/red borders',
    borders2.every((c, i) => c.includes(q2slots[i] ? 'border-emerald-500' : 'border-rose-500')));
  expectedScore += q2pts;
  expectedStreak = 0;

  await clickButtonByText(page, 'Next');
  await sleep(300);

  // --- Q3: let the timer auto-submit at 0 ---
  titles = await getTitles(page);
  const q3slots = slotsFor(titles, correctOrders[2]);
  const q3pts = 10 * q3slots.filter(Boolean).length;
  console.log('  waiting ~32s for timer auto-submit on Q3...');
  await sleep(32000);
  banner = await bannerText(page);
  check('Q3 auto-submitted at 0 (wrong, slot points, no time bonus)',
    banner === `✗ Wrong · +${q3pts}`, `banner="${banner}"`);
  const timerTxt = await page.$eval('span.tabular-nums', (e) => e.textContent.trim());
  check('timer shows 0s', timerTxt === '0s', timerTxt);
  expectedScore += q3pts;

  await clickButtonByText(page, 'Next');
  await sleep(300);

  // --- Q4..Q10: submit dealt order each time, track expected totals ---
  for (let q = 3; q < 10; q++) {
    titles = await getTitles(page);
    const slots = slotsFor(titles, correctOrders[q]);
    const pts = 10 * slots.filter(Boolean).length;
    const allOk = slots.every(Boolean);
    expectedScore += pts;
    if (allOk) { expectedCorrect++; expectedStreak++; expectedBest = Math.max(expectedBest, expectedStreak); }
    else expectedStreak = 0;
    await clickButtonByText(page, 'Submit');
    await sleep(250);
    const btn = q === 9 ? 'See results' : 'Next';
    const hasBtn = await page.evaluate((t) =>
      [...document.querySelectorAll('button')].some((x) => x.textContent.trim() === t), btn);
    check(`Q${q + 1} shows "${btn}" after submit`, hasBtn);
    await clickButtonByText(page, btn);
    await sleep(250);
  }

  // --- Results ---
  const bodyText = await page.$eval('body', (e) => e.innerText);
  const resultsScore = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => /^\d+$/.test(d.textContent.trim()));
    return el ? parseInt(el.textContent.trim()) : null;
  });
  check('results total score matches', resultsScore === expectedScore,
    `page=${resultsScore} expected=${expectedScore}`);
  check('results "N/10 correct"', bodyText.includes(`${expectedCorrect}/10 correct`),
    `expected ${expectedCorrect}/10`);
  check('results best streak', bodyText.includes(`Best streak: ${expectedBest}`),
    `expected ${expectedBest}`);

  await clickButtonByText(page, 'Play again');
  await sleep(300);
  const replay = await page.$eval('body', (e) => e.innerText);
  check('Play again resets to Q1 with score 0',
    replay.includes('Question 1/10') && replay.includes('Score: 0'));

  await browser.close();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
