document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.querySelector('.hamburger');
  var navMobile = document.getElementById('navMobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      navMobile.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!navMobile.classList.contains('open')) return;
      if (navMobile.contains(e.target) && e.target.tagName !== 'A') return;
      navMobile.classList.remove('open');
    });
  }

  var dropdowns = document.querySelectorAll('.nav-dropdown');
  var closeTimer;

  function closeAllDropdowns() {
    dropdowns.forEach(function (d) { d.classList.remove('open'); });
  }

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) dropdown.classList.add('open');
    });

    dropdown.addEventListener('mouseenter', function () {
      clearTimeout(closeTimer);
      closeAllDropdowns();
      dropdown.classList.add('open');
    });

    dropdown.addEventListener('mouseleave', function () {
      closeTimer = setTimeout(function () {
        dropdown.classList.remove('open');
      }, 250);
    });
  });

  document.addEventListener('click', function () {
    closeAllDropdowns();
  });

  var scrollCue = document.getElementById('heroScrollCue');
  var hero = document.getElementById('heroSlideshow');
  if (scrollCue && hero) {
    scrollCue.addEventListener('click', function (e) {
      e.preventDefault();
      var heroBottom = hero.getBoundingClientRect().bottom + window.pageYOffset;
      window.scrollTo({ top: heroBottom, behavior: 'smooth' });
    });
  }

  initScrollReveal();
});

/* Blago pojavljivanje elemenata pri skrolovanju: elementi sa klasom
   .reveal dobijaju .is-visible kad uđu u viewport. Klase se uklanjaju
   čim animacija završi, da ne bi trajno preklapale tranziciju na hover
   (npr. .card:hover) elemenata koji su i sami .reveal. */
function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        obs.unobserve(el);
        el.addEventListener(
          'transitionend',
          function () { el.classList.remove('reveal', 'is-visible'); },
          { once: true }
        );
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach(function (el) { observer.observe(el); });
}
