(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    var next = function () {
      show(current + 1);
    };
    var start = function () {
      timer = window.setInterval(next, 5200);
    };
    var reset = function () {
      window.clearInterval(timer);
      start();
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        reset();
      });
    });
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }
    if (slides.length > 1) {
      start();
    }
  }

  var forms = document.querySelectorAll('[data-filter-form]');
  forms.forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
    }
    var apply = function () {
      var term = input.value.trim().toLowerCase();
      var cards = list.querySelectorAll('.movie-card');
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', term && text.indexOf(term) === -1);
      });
    };
    input.addEventListener('input', apply);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  });

  var loadHls = function (callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-runtime]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-runtime', 'true');
    var done = false;
    var finish = function () {
      if (done) {
        return;
      }
      done = true;
      callback();
    };
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', finish, { once: true });
    window.setTimeout(finish, 2500);
    document.head.appendChild(script);
  };

  var startPlayer = function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }
    var play = function () {
      if (button) {
        button.classList.add('hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    };
    var attach = function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = source;
        }
        play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsAttached) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsAttached = true;
          video._hls = hls;
          hls.on(window.Hls.Events.MANIFEST_PARSED, play);
        } else {
          play();
        }
        return;
      }
      if (!video.src) {
        video.src = source;
      }
      play();
    };
    loadHls(attach);
  };

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var button = box.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }
    var video = box.querySelector('video');
    if (video) {
      video.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
})();
