(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setHeaderState() {
    var header = qs('[data-header]');
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function initNavigation() {
    var header = qs('[data-header]');
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
    if (!button || !nav || !header) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      header.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initHeroSearch() {
    var form = qs('[data-hero-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }
    var search = qs('[data-movie-search]', panel);
    var region = qs('[data-filter-region]', panel);
    var type = qs('[data-filter-type]', panel);
    var year = qs('[data-filter-year]', panel);
    var sort = qs('[data-filter-sort]', panel);
    var empty = qs('[data-empty-state]');
    var cards = qsa('[data-movie-card]', grid);
    var defaultOrder = cards.slice();
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && search) {
      search.value = query;
    }

    function matches(card) {
      var q = search ? search.value.trim().toLowerCase() : '';
      var selectedRegion = region ? region.value : 'all';
      var selectedType = type ? type.value : 'all';
      var selectedYear = year ? year.value : 'all';
      var text = card.getAttribute('data-search') || '';
      var okQuery = !q || text.indexOf(q) !== -1;
      var okRegion = selectedRegion === 'all' || card.getAttribute('data-region') === selectedRegion;
      var okType = selectedType === 'all' || card.getAttribute('data-type') === selectedType;
      var okYear = selectedYear === 'all' || card.getAttribute('data-year') === selectedYear;
      return okQuery && okRegion && okType && okYear;
    }

    function sortCards(list) {
      var mode = sort ? sort.value : 'default';
      if (mode === 'year-desc') {
        return list.slice().sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (mode === 'year-asc') {
        return list.slice().sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }
      if (mode === 'title-asc') {
        return list.slice().sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }
      return defaultOrder.slice();
    }

    function render() {
      var ordered = sortCards(cards);
      var visible = 0;
      ordered.forEach(function (card) {
        grid.appendChild(card);
        var show = matches(card);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, region, type, year, sort].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', render);
    });
    render();
  }

  window.initMoviePlayer = function (source, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var ready = false;

    if (!video || !cover || !source) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      cover.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    cover.addEventListener('click', attach);
    video.addEventListener('click', function () {
      if (!ready) {
        attach();
        return;
      }
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initHeroSearch();
    initFilters();
  });
})();
