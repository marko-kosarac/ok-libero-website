'use strict';

/*
 * Zero-dependency static site builder.
 * Reads src/layout.html + src/pages.json + src/pages/*.html and writes the
 * final, deployable *.html files back to the project root — exactly what
 * gets uploaded to the host. Run: node build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

const NAV_ITEMS = [
  { href: 'index.html', label: 'Početna' },
  { href: 'istorija.html', label: 'Istorija' },
  { href: 'trofeji.html', label: 'Trofeji' },
  { href: 'treneri.html', label: 'Treneri' },
  { href: 'ekipe.html', label: 'Ekipe' },
  { href: 'galerija.html', label: 'Galerija' },
  { href: 'skola.html', label: 'Škola odbojke' },
  { href: 'kontakt.html', label: 'Kontakt' }
];

const FOOTER_LINKS = [
  { href: 'index.html', label: 'Početna' },
  { href: 'vesti.html', label: 'Vesti' },
  { href: 'istorija.html', label: 'Istorija' },
  { href: 'trofeji.html', label: 'Trofeji' },
  { href: 'treneri.html', label: 'Treneri' },
  { href: 'ekipe.html', label: 'Ekipe' },
  { href: 'galerija.html', label: 'Galerija' },
  { href: 'skola.html', label: 'Škola odbojke' },
  { href: 'kontakt.html', label: 'Kontakt' }
];

function renderNavLinks(items, activeSlug) {
  return items
    .map(function (item) {
      const active = item.href === activeSlug ? ' class="active"' : '';
      return '    <a href="' + item.href + '"' + active + '>' + item.label + '</a>';
    })
    .join('\n');
}

function renderNav(activeSlug) {
  return [
    '<nav class="navbar">',
    '  <a href="index.html" class="nav-logo">',
    '    <img src="images/logo.png" alt="OK Libero logo">',
    '    OK Libero',
    '  </a>',
    '  <div class="nav-links">',
    renderNavLinks(NAV_ITEMS, activeSlug),
    '  </div>',
    '  <div class="nav-social">',
    '    <a href="https://instagram.com/odbojkaskiklublibero" target="_blank" rel="noopener" aria-label="Instagram">',
    '      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3"/><circle cx="16.5" cy="7.5" r="1" fill="currentColor"/></svg>',
    '    </a>',
    '    <a href="https://facebook.com/okliberobijeljina" target="_blank" rel="noopener" aria-label="Facebook">',
    '      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"/></svg>',
    '    </a>',
    '  </div>',
    '  <button class="hamburger" aria-label="Meni">☰</button>',
    '</nav>',
    '<div class="nav-mobile" id="navMobile">',
    renderNavLinks(NAV_ITEMS, activeSlug),
    '</div>'
  ].join('\n');
}

function renderFooter() {
  const links = FOOTER_LINKS.map(function (item) {
    return '        <a href="' + item.href + '">' + item.label + '</a>';
  }).join('\n');

  return [
    '<footer class="footer">',
    '  <div class="footer-grid">',
    '    <div>',
    '      <div class="footer-logo">',
    '        <img src="images/logo.png" alt="OK Libero logo">',
    '        OK Libero',
    '      </div>',
    '      <p class="footer-tagline">Jedan tim. Jedna porodica. Jedan cilj.</p>',
    '      <p class="footer-copy">© 2025 OK Libero Bijeljina</p>',
    '    </div>',
    '    <div>',
    '      <h4>Stranice</h4>',
    '      <div class="footer-links">',
    links,
    '      </div>',
    '    </div>',
    '    <div>',
    '      <h4>Kontakt</h4>',
    '      <div class="footer-contact">',
    '        <span>Bijeljina, RS, BiH</span>',
    '        <span>info@oklibero.ba</span>',
    '        <span>Instagram: @odbojkaskiklublibero</span>',
    '        <span>Facebook: @okliberobijeljina</span>',
    '      </div>',
    '      <div class="footer-social">',
    '        <a href="https://facebook.com/okliberobijeljina" target="_blank" rel="noopener" aria-label="Facebook">',
    '          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"/></svg>',
    '        </a>',
    '        <a href="https://instagram.com/odbojkaskiklublibero" target="_blank" rel="noopener" aria-label="Instagram">',
    '          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3"/><circle cx="16.5" cy="7.5" r="1" fill="currentColor"/></svg>',
    '        </a>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="footer-bottom">Odbojkaški klub Libero · Bijeljina · Republika Srpska</div>',
    '</footer>'
  ].join('\n');
}

function renderExtraScripts(scripts) {
  if (!scripts || !scripts.length) return '';
  return scripts.map(function (src) {
    return '<script src="' + src + '" defer></script>';
  }).join('\n');
}

function build() {
  const layout = fs.readFileSync(path.join(SRC, 'layout.html'), 'utf8');
  const pages = JSON.parse(fs.readFileSync(path.join(SRC, 'pages.json'), 'utf8'));

  Object.keys(pages).forEach(function (slug) {
    const meta = pages[slug];
    const contentPath = path.join(SRC, 'pages', slug);
    const content = fs.readFileSync(contentPath, 'utf8').trim();

    const html = layout
      .split('{{TITLE}}').join(meta.title)
      .split('{{DESCRIPTION}}').join(meta.description)
      .split('{{OG_IMAGE}}').join(meta.ogImage)
      .split('{{SLUG}}').join(slug)
      .split('{{NAV}}').join(renderNav(slug))
      .split('{{CONTENT}}').join(content)
      .split('{{FOOTER}}').join(renderFooter())
      .split('{{EXTRA_SCRIPTS}}').join(renderExtraScripts(meta.extraScripts));

    fs.writeFileSync(path.join(ROOT, slug), html + '\n', 'utf8');
    console.log('built ' + slug);
  });
}

build();

if (process.argv.includes('--watch')) {
  console.log('\nwatching src/ for changes... (Ctrl+C to stop)');
  let pending = false;
  const rebuild = function () {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      try {
        build();
      } catch (err) {
        console.error('build failed:', err.message);
      }
    }, 100);
  };
  fs.watch(SRC, { recursive: true }, rebuild);
}
