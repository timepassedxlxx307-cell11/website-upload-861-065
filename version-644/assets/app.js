(function () {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && header) {
    menuToggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const previous = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  let currentSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) return;
    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function restartSlider() {
    if (timer) window.clearInterval(timer);
    startSlider();
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartSlider();
    });
  });

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartSlider();
    });
  }

  startSlider();

  const filterInput = document.getElementById('movie-filter');
  const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
  const searchableItems = Array.from(document.querySelectorAll('[data-search]'));
  const noResult = document.querySelector('.no-result');
  let chipValue = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!searchableItems.length) return;
    const query = normalize(filterInput ? filterInput.value : '');
    let visibleCount = 0;

    searchableItems.forEach(function (item) {
      const text = normalize(item.getAttribute('data-search'));
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesChip = chipValue === 'all' || text.indexOf(normalize(chipValue)) !== -1;
      const shouldShow = matchesQuery && matchesChip;
      item.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    if (noResult) {
      noResult.hidden = visibleCount !== 0;
    }
  }

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery) {
      filterInput.value = initialQuery;
    }
    filterInput.addEventListener('input', applyFilter);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      chipValue = chip.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  if (filterChips.length) {
    filterChips[0].classList.add('active');
  }

  applyFilter();

  function initializePlayer(player) {
    const video = player.querySelector('.media-video');
    const button = player.querySelector('.player-start');
    if (!video || !button) return;

    let ready = false;
    let hls = null;
    const stream = button.getAttribute('data-stream');

    function attachStream() {
      if (ready || !stream) return;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
      video.controls = true;
      ready = true;
    }

    button.addEventListener('click', function () {
      attachStream();
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }

  document.querySelectorAll('.media-player').forEach(initializePlayer);
})();
