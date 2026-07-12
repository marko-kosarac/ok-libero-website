document.addEventListener('DOMContentLoaded', function () {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxTitle = document.getElementById('lightboxTitle');
  var lightboxCounter = document.getElementById('lightboxCounter');
  if (!lightbox) return;

  var albumImages = [];
  var albumTitle = '';
  var albumIndex = 0;

  function openLightbox(images, title, index) {
    albumImages = images;
    albumTitle = title;
    albumIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navLightbox(delta) {
    albumIndex = (albumIndex + delta + albumImages.length) % albumImages.length;
    updateLightbox();
  }

  function updateLightbox() {
    var item = albumImages[albumIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxTitle.textContent = albumTitle;
    lightboxCounter.textContent = (albumIndex + 1) + ' / ' + albumImages.length;
  }

  document.querySelectorAll('.gallery-category').forEach(function (category) {
    var titleEl = category.querySelector('.gallery-category-title');
    var title = titleEl ? titleEl.textContent.trim() : '';
    var buttons = Array.prototype.slice.call(category.querySelectorAll('.gallery-item'));
    var images = buttons.map(function (btn) {
      var img = btn.querySelector('img');
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
    });

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        openLightbox(images, title, i);
      });
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
