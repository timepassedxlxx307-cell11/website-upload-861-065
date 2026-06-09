(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, "");
  }

  function bindMenu() {
    var button = qs("[data-menu-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function bindSearchForms() {
    qsa("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function initHero() {
    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("hero-slide-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + tag + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"./" + item.url + "\" aria-label=\"观看" + item.title + "\">",
      "<img src=\"./" + item.cover + "\" alt=\"" + item.title + " 封面\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"card-year\">" + item.year + "</span>",
      "<span class=\"play-chip\">播放</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h2><a href=\"./" + item.url + "\">" + item.title + "</a></h2>",
      "<p>" + item.oneLine + "</p>",
      "<div class=\"card-meta\"><span>" + item.region + "</span><span>" + item.type + "</span></div>",
      "<div class=\"card-tags\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function renderSearch() {
    var resultsNode = qs("[data-search-results]");
    if (!resultsNode || !window.MovieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var titleNode = qs("[data-search-title]");
    var pageInput = qs(".search-page-form input[name='q']");
    if (pageInput) {
      pageInput.value = query;
    }
    if (!query.trim()) {
      resultsNode.innerHTML = "<div class=\"empty-state\">输入关键词后即可搜索影片。</div>";
      return;
    }
    var keyword = normalize(query);
    var results = window.MovieSearchIndex.filter(function (item) {
      return normalize([item.title, item.region, item.type, item.genre, item.year, (item.tags || []).join("")].join(" ")).indexOf(keyword) !== -1;
    }).slice(0, 80);
    if (titleNode) {
      titleNode.textContent = "“" + query + "”的搜索结果";
    }
    if (!results.length) {
      resultsNode.innerHTML = "<div class=\"empty-state\">没有找到匹配影片，可更换关键词再试。</div>";
      return;
    }
    resultsNode.innerHTML = results.map(movieCard).join("");
  }

  function initPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    if (!video || !overlay || !config.source) {
      return;
    }
    var ready = false;

    function useHls(HlsLibrary) {
      if (HlsLibrary && HlsLibrary.isSupported()) {
        var hls = new HlsLibrary({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    function attach() {
      if (ready) {
        return Promise.resolve();
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        useHls(window.Hls);
        return Promise.resolve();
      }
      return import("./assets/js/hls-vendor.js").then(function (module) {
        window.Hls = module.H || module.default || window.Hls;
        useHls(window.Hls);
      }).catch(function () {
        video.src = config.source;
      });
    }

    function play() {
      overlay.classList.add("is-hidden");
      attach().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      });
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        play();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindSearchForms();
    initHero();
    renderSearch();
  });
})();
