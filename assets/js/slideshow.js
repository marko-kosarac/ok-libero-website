document.addEventListener('DOMContentLoaded', function () {
  var hero = document.getElementById('heroSlideshow');
  if (!hero) return;

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  var current = slides.findIndex(function (slide) { return slide.classList.contains('is-active'); });
  if (current < 0) current = 0;

  setInterval(function () {
    var next = (current + 1) % slides.length;
    slides[current].classList.remove('is-active');
    slides[next].classList.add('is-active');
    current = next;
  }, 3200);
});
