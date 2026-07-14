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
const NEWS_PAGE_SIZE = 12;

// Resolves a root-relative target (e.g. 'index.html', 'images/logo.png',
// 'vesti/some-slug.html') into a link usable from a page that itself lives
// `prefix` levels deep (prefix is '' at the root, '../' inside /vesti/).
function href(prefix, target) {
  if (!prefix) return target;
  if (target.indexOf('vesti/') === 0) return target.slice('vesti/'.length);
  return prefix + target;
}

const NAV_ITEMS = [
  { href: 'index.html', label: 'Početna' },
  {
    label: 'O klubu',
    children: [
      { href: 'istorija.html', label: 'Istorija' },
      { href: 'trofeji.html', label: 'Trofeji' },
      { href: 'galerija.html', label: 'Galerija' }
    ]
  },
  {
    label: 'Tim',
    children: [
      { href: 'treneri.html', label: 'Stručni štab' },
      { href: 'ekipe.html', label: 'Ekipe' }
    ]
  },
  { href: 'skola.html', label: 'Škola odbojke' },
  { href: 'kontakt.html', label: 'Kontakt' }
];

const FOOTER_LINKS = [
  { href: 'index.html', label: 'Početna' },
  { href: 'istorija.html', label: 'Istorija' },
  { href: 'trofeji.html', label: 'Trofeji' },
  { href: 'treneri.html', label: 'Stručni štab' },
  { href: 'ekipe.html', label: 'Ekipe' },
  { href: 'galerija.html', label: 'Galerija' },
  { href: 'skola.html', label: 'Škola odbojke' },
  { href: 'kontakt.html', label: 'Kontakt' }
];

function renderDesktopNavLinks(items, activeSlug, prefix) {
  return items
    .map(function (item) {
      if (item.children) {
        const groupActive = item.children.some(function (child) { return child.href === activeSlug; });
        const childLinks = item.children
          .map(function (child) {
            const active = child.href === activeSlug ? ' class="active"' : '';
            return '        <a href="' + href(prefix, child.href) + '"' + active + '>' + child.label + '</a>';
          })
          .join('\n');
        return [
          '    <div class="nav-dropdown">',
          '      <button type="button" class="nav-dropdown-toggle' + (groupActive ? ' active' : '') + '">',
          '        ' + item.label,
          '        <svg class="nav-caret" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6l6 -6"/></svg>',
          '      </button>',
          '      <div class="nav-dropdown-menu">',
          childLinks,
          '      </div>',
          '    </div>'
        ].join('\n');
      }
      const active = item.href === activeSlug ? ' class="active"' : '';
      return '    <a href="' + href(prefix, item.href) + '"' + active + '>' + item.label + '</a>';
    })
    .join('\n');
}

function renderMobileNavLinks(items, activeSlug, prefix) {
  return items
    .map(function (item) {
      if (item.children) {
        const groupActive = item.children.some(function (child) { return child.href === activeSlug; });
        const childLinks = item.children
          .map(function (child) {
            const active = child.href === activeSlug ? ' class="nav-mobile-sublink active"' : ' class="nav-mobile-sublink"';
            return '  <a href="' + href(prefix, child.href) + '"' + active + '>' + child.label + '</a>';
          })
          .join('\n');
        return [
          '  <details class="nav-mobile-group"' + (groupActive ? ' open' : '') + '>',
          '    <summary>' + item.label + '</summary>',
          childLinks,
          '  </details>'
        ].join('\n');
      }
      const active = item.href === activeSlug ? ' class="active"' : '';
      return '  <a href="' + href(prefix, item.href) + '"' + active + '>' + item.label + '</a>';
    })
    .join('\n');
}

function renderNav(activeSlug, prefix) {
  return [
    '<nav class="navbar">',
    '  <a href="' + href(prefix, 'index.html') + '" class="nav-logo">',
    '    <img src="' + href(prefix, 'images/logo.png') + '" alt="OK Libero logo">',
    '    OK Libero',
    '  </a>',
    '  <div class="nav-links">',
    renderDesktopNavLinks(NAV_ITEMS, activeSlug, prefix),
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
    renderMobileNavLinks(NAV_ITEMS, activeSlug, prefix),
    '</div>'
  ].join('\n');
}

function renderFooter(prefix) {
  const links = FOOTER_LINKS.map(function (item) {
    return '        <a href="' + href(prefix, item.href) + '">' + item.label + '</a>';
  }).join('\n');

  return [
    '<footer class="footer">',
    '  <div class="footer-grid">',
    '    <div>',
    '      <div class="footer-logo">',
    '        <img src="' + href(prefix, 'images/logo.png') + '" alt="OK Libero logo">',
    '        OK Libero',
    '      </div>',
    '      <p class="footer-tagline">Jedan tim. Jedna porodica. Jedan cilj.</p>',
    '      <p class="footer-copy">© 2015 OK Libero Bijeljina</p>',
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
    '        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/></svg>Ulica Save Mrkalja 38A, 76300 Bijeljina</span>',
    '        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/></svg>+387 65 208 982, Bojan Kvrgić</span>',
    '        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/><path d="M3 7l9 6l9 -6"/></svg><a href="mailto:okliberobn@gmail.com">okliberobn@gmail.com</a></span>',
    '      </div>',
    '      <div class="footer-social">',
    '        <a href="https://facebook.com/okliberobijeljina" target="_blank" rel="noopener" aria-label="Facebook">',
    '          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3"/></svg>',
    '        </a>',
    '        <a href="https://instagram.com/odbojkaskiklublibero" target="_blank" rel="noopener" aria-label="Instagram">',
    '          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3"/><circle cx="16.5" cy="7.5" r="1" fill="currentColor"/></svg>',
    '        </a>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="footer-bottom">Odbojkaški klub Libero · Bijeljina · Republika Srpska</div>',
    '</footer>'
  ].join('\n');
}

function loadNews() {
  const news = JSON.parse(fs.readFileSync(path.join(SRC, 'news.json'), 'utf8'));
  return news.slice().sort(function (a, b) {
    return a.dateISO < b.dateISO ? 1 : (a.dateISO > b.dateISO ? -1 : 0);
  });
}

function renderNewsCard(item, prefix) {
  return [
    '<a href="' + href(prefix, 'vesti/' + item.slug + '.html') + '" class="card news-card">',
    '  <div class="news-card-img"><img src="' + href(prefix, item.cover) + '" alt="' + item.coverAlt + '" loading="lazy"></div>',
    '  <div class="news-card-body">',
    '    <h3>' + item.title + '</h3>',
    '    <span class="news-date">' + item.dateDisplay + '</span>',
    '  </div>',
    '</a>'
  ].join('\n');
}

function renderNewsGrid(items, prefix) {
  return items.map(function (item) { return renderNewsCard(item, prefix); }).join('\n');
}

function renderSidebarNewsItem(item, prefix) {
  return [
    '<a href="' + href(prefix, 'vesti/' + item.slug + '.html') + '" class="sidebar-news-item">',
    '  <img src="' + href(prefix, item.cover) + '" alt="' + item.coverAlt + '" loading="lazy">',
    '  <div class="sidebar-news-item-body">',
    '    <h4>' + item.title + '</h4>',
    '    <span class="news-date">' + item.dateDisplay + '</span>',
    '  </div>',
    '</a>'
  ].join('\n');
}

function renderNewsDetail(item, otherItems, prefix) {
  const images = item.images.map(function (src, i) {
    const lazy = i === 0 ? '' : ' loading="lazy"';
    return '    <img src="' + href(prefix, src) + '" alt="' + item.coverAlt + '"' + lazy + '>';
  }).join('\n');

  const body = item.body.map(function (p) {
    return '    <p>' + p + '</p>';
  }).join('\n');

  const sidebarItems = otherItems.map(function (other) { return renderSidebarNewsItem(other, prefix); }).join('\n');

  return [
    '<header class="article-header">',
    '  <span class="badge ' + item.badgeClass + '">' + item.badge + '</span>',
    '  <h1>' + item.title + '</h1>',
    '  <div class="article-meta">',
    '    <span class="article-meta-city">Bijeljina</span>',
    '    <span class="article-meta-sep">|</span>',
    '    <span class="article-meta-date">' + item.dateDisplay + '</span>',
    '    <span class="article-meta-sep">|</span>',
    '    <span class="article-meta-source">OK Libero</span>',
    '  </div>',
    '</header>',
    '',
    '<section class="section article-layout">',
    '  <article class="article-content">',
    '    <div class="article-images">',
    images,
    '    </div>',
    '    <div class="article-body">',
    body,
    '    </div>',
    '  </article>',
    '  <aside class="article-sidebar">',
    '    <h4 class="article-sidebar-title">Ostale aktuelnosti</h4>',
    '    <div class="article-sidebar-list">',
    sidebarItems,
    '    </div>',
    '  </aside>',
    '</section>'
  ].join('\n');
}

function pageUrl(pageNum) {
  return pageNum === 1 ? 'vesti.html' : 'vesti/page-' + pageNum + '.html';
}

function renderPagination(prefix, currentPage, totalPages) {
  if (totalPages <= 1) return '';

  const numberLinks = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === currentPage) {
      numberLinks.push('    <span class="page-link active">' + p + '</span>');
    } else {
      numberLinks.push('    <a href="' + href(prefix, pageUrl(p)) + '" class="page-link">' + p + '</a>');
    }
  }

  const prev = currentPage > 1
    ? '    <a href="' + href(prefix, pageUrl(currentPage - 1)) + '" class="page-link page-prev">‹ Prethodna</a>'
    : '    <span class="page-link page-prev disabled">‹ Prethodna</span>';

  const next = currentPage < totalPages
    ? '    <a href="' + href(prefix, pageUrl(currentPage + 1)) + '" class="page-link page-next">Sledeća ›</a>'
    : '    <span class="page-link page-next disabled">Sledeća ›</span>';

  return [
    '  <nav class="pagination" aria-label="Navigacija kroz vijesti">',
    prev,
    numberLinks.join('\n'),
    next,
    '  </nav>'
  ].join('\n');
}

function renderNewsListPage(pageNum, totalPages, pageItems, prefix) {
  return [
    '<header class="page-header">',
    '  <h1>Vesti</h1>',
    '  <p class="intro-text">Sve novosti iz kluba na jednom mjestu — rezultati, upisi i klupski događaji.</p>',
    '</header>',
    '',
    '<section class="section">',
    '  <div class="grid-3">',
    renderNewsGrid(pageItems, prefix),
    '  </div>',
    renderPagination(prefix, pageNum, totalPages),
    '</section>'
  ].join('\n');
}

function renderExtraScripts(scripts) {
  if (!scripts || !scripts.length) return '';
  return scripts.map(function (src) {
    return '<script src="' + src + '" defer></script>';
  }).join('\n');
}

function renderExtraHead(links) {
  if (!links || !links.length) return '';
  return links.map(function (href) {
    return '<link rel="stylesheet" href="' + href + '">';
  }).join('\n');
}

function build() {
  const layout = fs.readFileSync(path.join(SRC, 'layout.html'), 'utf8');
  const pages = JSON.parse(fs.readFileSync(path.join(SRC, 'pages.json'), 'utf8'));
  const news = loadNews();
  const totalNewsPages = Math.max(1, Math.ceil(news.length / NEWS_PAGE_SIZE));

  fs.mkdirSync(path.join(ROOT, 'vesti'), { recursive: true });

  Object.keys(pages).forEach(function (slug) {
    const meta = pages[slug];
    const contentPath = path.join(SRC, 'pages', slug);
    const content = fs.readFileSync(contentPath, 'utf8').trim()
      .split('{{NEWS_HOME}}').join(renderNewsGrid(news.slice(0, 3), ''))
      .split('{{NEWS_ALL}}').join(renderNewsGrid(news.slice(0, NEWS_PAGE_SIZE), ''))
      .split('{{PAGINATION}}').join(renderPagination('', 1, totalNewsPages));

    const html = layout
      .split('{{TITLE}}').join(meta.title)
      .split('{{DESCRIPTION}}').join(meta.description)
      .split('{{OG_IMAGE}}').join(meta.ogImage)
      .split('{{SLUG}}').join(slug)
      .split('{{BASE}}').join('')
      .split('{{NAV}}').join(renderNav(slug, ''))
      .split('{{CONTENT}}').join(content)
      .split('{{FOOTER}}').join(renderFooter(''))
      .split('{{EXTRA_SCRIPTS}}').join(renderExtraScripts(meta.extraScripts))
      .split('{{EXTRA_HEAD}}').join(renderExtraHead(meta.extraHead));

    fs.writeFileSync(path.join(ROOT, slug), html + '\n', 'utf8');
    console.log('built ' + slug);
  });

  news.forEach(function (item) {
    const outPath = 'vesti/' + item.slug + '.html';
    const others = news.filter(function (n) { return n.slug !== item.slug; }).slice(0, 2);
    const content = renderNewsDetail(item, others, '../');

    const html = layout
      .split('{{TITLE}}').join(item.title + ' — OK Libero Bijeljina')
      .split('{{DESCRIPTION}}').join(item.description)
      .split('{{OG_IMAGE}}').join(item.cover)
      .split('{{SLUG}}').join(outPath)
      .split('{{BASE}}').join('../')
      .split('{{NAV}}').join(renderNav('vesti.html', '../'))
      .split('{{CONTENT}}').join(content)
      .split('{{FOOTER}}').join(renderFooter('../'))
      .split('{{EXTRA_SCRIPTS}}').join('')
      .split('{{EXTRA_HEAD}}').join('');

    fs.writeFileSync(path.join(ROOT, outPath), html + '\n', 'utf8');
    console.log('built ' + outPath);
  });

  for (let p = 2; p <= totalNewsPages; p++) {
    const pageItems = news.slice((p - 1) * NEWS_PAGE_SIZE, p * NEWS_PAGE_SIZE);
    const outPath = 'vesti/page-' + p + '.html';
    const content = renderNewsListPage(p, totalNewsPages, pageItems, '../');

    const html = layout
      .split('{{TITLE}}').join('Vesti — stranica ' + p + ' — OK Libero Bijeljina')
      .split('{{DESCRIPTION}}').join('Sve vesti Odbojkaškog kluba Libero iz Bijeljine — stranica ' + p + '.')
      .split('{{OG_IMAGE}}').join('images/pocetna.jpg')
      .split('{{SLUG}}').join(outPath)
      .split('{{BASE}}').join('../')
      .split('{{NAV}}').join(renderNav('vesti.html', '../'))
      .split('{{CONTENT}}').join(content)
      .split('{{FOOTER}}').join(renderFooter('../'))
      .split('{{EXTRA_SCRIPTS}}').join('')
      .split('{{EXTRA_HEAD}}').join('');

    fs.writeFileSync(path.join(ROOT, outPath), html + '\n', 'utf8');
    console.log('built ' + outPath);
  }
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
