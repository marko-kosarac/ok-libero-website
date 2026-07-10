document.addEventListener('DOMContentLoaded', function () {
  var galleryImages = [
    { src: 'images/finale_prve_lige.jpg', alt: 'Seniorska ekipa OK Libero na finalu Prve lige RS' },
    { src: 'images/galerija4.jpg', alt: 'OK Libero na utakmici pred punim tribinama' },
    { src: 'images/galerija8.jpg', alt: 'Kadetkinje OK Libero u dogovoru tokom utakmice' },
    { src: 'images/galerija10.jpg', alt: 'Igračice OK Libero nakon utakmice' },
    { src: 'images/skola_odbojke.jpg', alt: 'Trening škole odbojke OK Libero' },
    { src: 'images/galerija3.jpg', alt: 'Trening najmlađih polaznika škole odbojke' },
    { src: 'images/galerija14.jpg', alt: 'Trening OK Libero na otvorenom' },
    { src: 'images/juniorski_prvaci.jpg', alt: 'Juniorke OK Libero — prvakinje Republike Srpske' },
    { src: 'images/kadetkinje_vicesampionke.jpg', alt: 'Kadetkinje OK Libero — vicešampionke Republike Srpske' },
    { src: 'images/osvajaci_druge_lige_rs.jpg', alt: 'OK Libero — osvajačice Druge lige RS' },
    { src: 'images/galerija9.jpg', alt: 'Proslava titule na parketu' },
    { src: 'images/galerija11.jpg', alt: 'Ekipa OK Libero u obilasku grada na turniru' },
    { src: 'images/galerija12.jpg', alt: 'OK Libero na odbojkaškom kampu Volleyball Montenegro' },
    { src: 'images/galerija13.jpg', alt: 'Igračice OK Libero na izletu u prirodi' },
    { src: 'images/pocetna.jpg', alt: 'Sve ekipe OK Libero okupljene u sali' },
    { src: 'images/galerija1.jpg', alt: 'Klupsko okupljanje svih uzrasnih kategorija' },
    { src: 'images/galerija2.jpg', alt: 'Ekipa OK Libero — timska fotografija' },
    { src: 'images/galerija5.jpg', alt: 'Mlađe igračice OK Libero Bijeljina' },
    { src: 'images/galerija6.jpg', alt: 'Veliko okupljanje svih selekcija kluba' },
    { src: 'images/galerija7.jpg', alt: 'Igračice kluba pozdravljaju publiku' }
  ];
  var lightboxIndex = 0;

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCounter = document.getElementById('lightboxCounter');
  if (!lightbox) return;

  function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navLightbox(delta) {
    lightboxIndex = (lightboxIndex + delta + galleryImages.length) % galleryImages.length;
    updateLightbox();
  }

  function updateLightbox() {
    var item = galleryImages[lightboxIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + galleryImages.length;
  }

  document.querySelectorAll('.gallery-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLightbox(Number(btn.dataset.index));
    });
  });

  lightbox.addEventListener('click', function (e) {
    var actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      if (actionEl.dataset.action === 'close') closeLightbox();
      else if (actionEl.dataset.action === 'prev') navLightbox(-1);
      else if (actionEl.dataset.action === 'next') navLightbox(1);
      return;
    }
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });
});
