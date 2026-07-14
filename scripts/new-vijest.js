'use strict';

/*
 * Interaktivni pomoćnik za dodavanje nove vijesti.
 * Pita za podatke, upisuje ih u src/news.json i pokreće build.js.
 * Run: npm run new-vijest
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const NEWS_PATH = path.join(ROOT, 'src', 'news.json');
const IMAGES_DIR = path.join(ROOT, 'images');

const MONTHS = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
];

const BADGE_OPTIONS = {
  '1': { badge: 'Rezultati', badgeClass: 'badge-crveni' },
  '2': { badge: 'Škola odbojke', badgeClass: 'badge-crveni' },
  '3': { badge: 'Klub', badgeClass: 'badge-sivi' }
};

const rl = readline.createInterface({ input: process.stdin });
// Consuming lines through the interface's own async iterator (instead of
// rl.question()'s one-shot 'line' listener) avoids dropping input when
// lines arrive faster than we re-attach the next listener.
const lines = rl[Symbol.asyncIterator]();

function slugify(text) {
  const map = { š: 's', đ: 'dj', č: 'c', ć: 'c', ž: 'z', Š: 'S', Đ: 'Dj', Č: 'C', Ć: 'C', Ž: 'Z' };
  return text
    .split('').map(function (ch) { return map[ch] || ch; }).join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function uniqueSlug(base, existing) {
  let slug = base;
  let n = 2;
  while (existing.indexOf(slug) !== -1) {
    slug = base + '-' + n;
    n++;
  }
  return slug;
}

function parseDate(input) {
  const now = new Date();
  if (!input.trim()) {
    return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
  }
  const m = input.trim().match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?$/);
  if (!m) return null;
  return { day: parseInt(m[1], 10), month: parseInt(m[2], 10), year: parseInt(m[3], 10) };
}

async function ask(question) {
  process.stdout.write(question);
  const next = await lines.next();
  return next.done ? '' : next.value.trim();
}

async function askBody() {
  console.log('Unesi tekst vijesti pasus po pasus. Prazan red + Enter = završi.');
  const paragraphs = [];
  for (;;) {
    const line = await ask('Pasus ' + (paragraphs.length + 1) + ': ');
    if (!line) break;
    paragraphs.push(line);
  }
  return paragraphs;
}

async function main() {
  const news = JSON.parse(fs.readFileSync(NEWS_PATH, 'utf8'));
  const existingSlugs = news.map(function (n) { return n.slug; });

  console.log('=== Nova vijest — OK Libero ===\n');

  const title = await ask('Naslov vijesti: ');
  if (!title) {
    console.log('Naslov je obavezan. Prekidam.');
    rl.close();
    return;
  }

  console.log('\nKategorija:\n  1) Rezultati\n  2) Škola odbojke\n  3) Klub');
  let badgeChoice = await ask('Izaberi (1/2/3): ');
  if (!BADGE_OPTIONS[badgeChoice]) badgeChoice = '3';
  const { badge, badgeClass } = BADGE_OPTIONS[badgeChoice];

  let dateParts = null;
  while (!dateParts) {
    const dateInput = await ask('\nDatum (DD.MM.GGGG), Enter za danas: ');
    dateParts = parseDate(dateInput);
    if (!dateParts) console.log('Neispravan format. Primjer: 14.7.2026.');
  }
  const dateISO = dateParts.year + '-' + String(dateParts.month).padStart(2, '0') + '-' + String(dateParts.day).padStart(2, '0');
  const dateDisplay = dateParts.day + '. ' + MONTHS[dateParts.month - 1] + ' ' + dateParts.year + '.';

  const imagesList = [];
  let first = true;
  for (;;) {
    const prompt = first
      ? '\nNaziv slike u images/ folderu (npr. slika.jpg, može i više odvojenih zarezom): '
      : 'Dodatna slika (Enter da završiš): ';
    const imgInput = await ask(prompt);
    if (!imgInput) {
      if (first) {
        console.log('Bar jedna slika je obavezna.');
        continue;
      }
      break;
    }
    const filenames = imgInput.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    filenames.forEach(function (raw) {
      const filename = raw.replace(/^images[\\/]/, '');
      if (!fs.existsSync(path.join(IMAGES_DIR, filename))) {
        console.log('  Upozorenje: images/' + filename + ' ne postoji na disku (nastavljam svejedno).');
      }
      imagesList.push('images/' + filename);
    });
    first = false;
  }

  const coverAlt = await ask('\nAlt tekst slike (opis za pristupačnost): ');
  const description = await ask('Kratak opis (1 rečenica, za SEO): ');
  const body = await askBody();

  const baseSlug = slugify(title) || 'vijest';
  const slug = uniqueSlug(baseSlug, existingSlugs);

  const entry = {
    slug: slug,
    title: title,
    badge: badge,
    badgeClass: badgeClass,
    dateDisplay: dateDisplay,
    dateISO: dateISO,
    cover: imagesList[0],
    coverAlt: coverAlt,
    images: imagesList,
    description: description,
    body: body.length ? body : [description]
  };

  news.push(entry);
  fs.writeFileSync(NEWS_PATH, JSON.stringify(news, null, 2) + '\n', 'utf8');

  console.log('\nVijest dodana u src/news.json. Pokrećem build...\n');
  rl.close();

  execSync('node build.js', { cwd: ROOT, stdio: 'inherit' });

  console.log('\nGotovo! Nova stranica: vesti/' + slug + '.html');
}

main().catch(function (err) {
  console.error(err);
  rl.close();
  process.exit(1);
});
