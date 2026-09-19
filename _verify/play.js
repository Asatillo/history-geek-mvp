const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'which-happened-first', 'src');

// Load QUESTIONS and LEADERBOARD from the app source (plain literals; strip type exports)
function loadTs(file) {
  const src = fs.readFileSync(path.join(SRC, file), 'utf8');
  const js = src
    .replace(/export type [A-Za-z]+ = \{[\s\S]*?\};\n/g, '')
    .replaceAll('export const', 'const')
    .replace(/\(score: number\)/, '(score)')
    .replace(/const (\w+)[^=]*=/g, 'const $1 =');
  return new Function(`${js}; return { ${file === 'data.ts' ? 'QUESTIONS' : 'LEADERBOARD'} };`)();
}
const QUESTIONS = loadTs('data.ts').QUESTIONS;
const LEADERBOARD = loadTs('leaderboard.ts').LEADERBOARD;
const correctOrders = QUESTIONS.map((q) => [...q].sort((a, b) => a.year - b.year));
const rankFor = (score) => LEADERBOARD.filter((p) => p.score > score).length + 1;

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5173/';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`);
  if (!cond) failures++;
};

const tid = (t) => `[data-testid="${t}"]`;

async function getTitles(page) {
  return page.$$eval(tid('card-title'), (els) => els.map((e) => e.textContent.trim()));
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
  return page.$eval(tid('result-banner'), (e) => e.textContent.trim());
}
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

  // --- Start screen (leaderboard is inline on the landing page) ---
  check('start screen title', await page.$eval('h1', (e) => e.textContent) === 'Which Happened First?');
  const rows = await page.$$(tid('leaderboard-row'));
  check('leaderboard shows 15 rows on start page', rows.length === 15, `${rows.length} rows`);
  const rowScores = await page.$$eval(tid('leaderboard-row'), (els) =>
    els.map((e) => parseInt(e.lastElementChild.textContent.replace(/[^0-9]/g, ''), 10)));
  check('leaderboard rows in descending score order',
    rowScores.every((s, i) => i === 0 || rowScores[i - 1] >= s),
    JSON.stringify(rowScores.slice(0, 5)));
  check('no "You" row before a game', (await page.$(tid('leaderboard-you'))) === null);

  // --- Q1: reorder with arrows, sort correctly, submit ---
  await clickButtonByText(page, 'Start');
  await sleep(300);
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

  const t1 = await page.$eval(tid('timer-seconds'), (e) => parseInt(e.textContent));
  await clickButtonByText(page, 'Submit');
  await sleep(300);
  let banner = await bannerText(page);
  check('Q1 correct banner', banner.startsWith(`Correct — +${100 + t1}`), `banner="${banner}" t=${t1}`);

  const labels = await page.$$eval(tid('card-date'), (els) => els.map((e) => e.textContent.trim()));
  check('revealed dates in correct order',
    JSON.stringify(labels) === JSON.stringify(correctOrders[0].map((e) => e.label)),
    JSON.stringify(labels));
  const correctness = await page.$$eval(tid('card'), (els) =>
    els.map((e) => e.getAttribute('data-correct')));
  check('all 4 cards data-correct=true', correctness.every((c) => c === 'true'));
  check('score header updated', await page.$eval(tid('score'), (e) => e.textContent.trim()) === String(100 + t1));

  let expectedScore = 100 + t1;
  let expectedCorrect = 1;
  let expectedStreak = 1;
  let expectedBest = 1;

  await clickButtonByText(page, 'Next');
  await sleep(300);

  // --- Q2: submit dealt order (never all-correct), verify slot scoring ---
  titles = await getTitles(page);
  const q2slots = slotsFor(titles, correctOrders[1]);
  const q2pts = 10 * q2slots.filter(Boolean).length;
  await clickButtonByText(page, 'Submit');
  await sleep(300);
  banner = await bannerText(page);
  check('Q2 incorrect banner + slot points', banner.startsWith(`Incorrect — +${q2pts}`),
    `banner="${banner}" slots=${q2slots}`);
  const correctness2 = await page.$$eval(tid('card'), (els) =>
    els.map((e) => e.getAttribute('data-correct')));
  check('Q2 per-slot data-correct flags',
    correctness2.every((c, i) => c === String(q2slots[i])), JSON.stringify(correctness2));
  expectedScore += q2pts;
  expectedStreak = 0;

  await clickButtonByText(page, 'Next');
  await sleep(300);

  // --- Q3: timer auto-submits at 0 ---
  titles = await getTitles(page);
  const q3slots = slotsFor(titles, correctOrders[2]);
  const q3pts = 10 * q3slots.filter(Boolean).length;
  console.log('  waiting ~32s for timer auto-submit on Q3...');
  await sleep(32000);
  banner = await bannerText(page);
  check('Q3 auto-submitted at 0 (no time bonus)', banner.startsWith(`Incorrect — +${q3pts}`),
    `banner="${banner}"`);
  check('timer shows 0s',
    (await page.$eval(tid('timer-seconds'), (e) => e.textContent.trim())) === '0s');
  expectedScore += q3pts;

  await clickButtonByText(page, 'Next');
  await sleep(300);

  // --- Q4..Q10: submit dealt order, track totals ---
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
  const finalScore = await page.$eval(tid('final-score'), (e) => e.textContent.trim());
  check('results total score matches', finalScore === expectedScore.toLocaleString('en-US'),
    `page=${finalScore} expected=${expectedScore}`);
  const bodyText = await page.$eval('body', (e) => e.innerText);
  check('results correct count', bodyText.includes(`${expectedCorrect} / 10`),
    `expected "${expectedCorrect} / 10"`);
  check('results rank shown', bodyText.includes(`#${rankFor(expectedScore)}`),
    `expected #${rankFor(expectedScore)}`);

  // --- "Back to start" → landing shows the leaderboard with the "You" row ---
  await clickButtonByText(page, 'Back to start');
  await sleep(300);
  check('Back to start returns to landing',
    await page.$eval('h1', (e) => e.textContent) === 'Which Happened First?');
  const youRow = await page.$(tid('leaderboard-you'));
  check('"You" row present after a game', youRow !== null);
  if (youRow) {
    const youText = await page.$eval(tid('leaderboard-you'), (e) => e.textContent.trim());
    check('"You" row shows right rank',
      youText.includes(`rank #${rankFor(expectedScore)}`) &&
      youText.includes(expectedScore.toLocaleString('en-US')),
      `row="${youText}"`);
  }

  await clickButtonByText(page, 'Start');
  await sleep(300);
  const replay = await page.$eval('body', (e) => e.innerText);
  check('Play again resets to Q1 with score 0',
    replay.includes('Question 01 / 10') &&
    (await page.$eval(tid('score'), (e) => e.textContent.trim())) === '0');

  await browser.close();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
