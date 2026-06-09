(function () {
  const panel = document.querySelector('.mobile-panel');
  const toggle = document.querySelector('.nav-toggle');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const topButton = document.querySelector('.back-top');

  if (topButton) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        topButton.classList.add('is-visible');
      } else {
        topButton.classList.remove('is-visible');
      }
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    if (slides.length > 1) {
      startTimer();
    }
  }

  function filterCards(input, grid) {
    const empty = document.querySelector('[data-empty-state]');
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const keyword = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute('data-search') || '').toLowerCase();
      const matched = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  const localInput = document.querySelector('[data-local-filter]');
  const localGrid = document.querySelector('.searchable-grid');

  if (localInput && localGrid) {
    localInput.addEventListener('input', function () {
      filterCards(localInput, localGrid);
    });

    const localForm = document.querySelector('.local-filter-form');
    if (localForm) {
      localForm.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards(localInput, localGrid);
      });
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const searchGrid = document.querySelector('.search-grid');
  const searchHeading = document.querySelector('[data-search-heading]');

  if (searchInput && searchGrid) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    searchInput.value = query;

    function updateHeading() {
      const value = searchInput.value.trim();
      if (searchHeading) {
        searchHeading.textContent = value ? '关键词：' + value : '全部影片';
      }
    }

    searchInput.addEventListener('input', function () {
      filterCards(searchInput, searchGrid);
      updateHeading();
    });

    filterCards(searchInput, searchGrid);
    updateHeading();
  }
}());
