(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function renderCard(movie) {
    var title = escapeHtml(movie.title);
    var line = escapeHtml(movie.oneLine || "");
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card small\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<span class=\"poster-wrap\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + title + "\" loading=\"lazy\">" +
      "<span class=\"poster-glow\"></span><span class=\"play-chip\">▶</span>" +
      "</span>" +
      "<span class=\"movie-card-body\">" +
      "<strong>" + title + "</strong>" +
      "<span class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>" +
      "<span class=\"movie-line\">" + line + "</span>" +
      "<span class=\"tag-row\">" + tags + "</span>" +
      "</span>" +
      "</a>";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.movieSearchData) {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var region = page.querySelector("[data-region-filter]");
    var type = page.querySelector("[data-type-filter]");
    var results = page.querySelector("[data-search-results]");
    var status = page.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function apply() {
      var query = input.value.trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var list = window.movieSearchData.filter(function (movie) {
        var text = movie.searchText.toLowerCase();
        var okQuery = !query || text.indexOf(query) !== -1;
        var okRegion = !regionValue || movie.region === regionValue;
        var okType = !typeValue || movie.type === typeValue;
        return okQuery && okRegion && okType;
      }).slice(0, 96);
      results.innerHTML = list.map(renderCard).join("");
      status.textContent = list.length ? "匹配结果" : "暂无匹配内容，换个关键词试试";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    input.addEventListener("input", apply);
    region.addEventListener("change", apply);
    type.addEventListener("change", apply);
    if (initial) {
      apply();
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-m3u8]");
      var trigger = player.querySelector("[data-play]");
      if (!video || !trigger) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;

      function attach() {
        if (loaded) {
          return;
        }
        var url = video.getAttribute("data-m3u8");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("emptied", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
