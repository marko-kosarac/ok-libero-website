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
});
