(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-menu-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var opened = menu.hasAttribute("hidden") === false;
        if (opened) {
          menu.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        } else {
          menu.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var next = carousel.querySelector("[data-hero-next]");
      var prev = carousel.querySelector("[data-hero-prev]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === current);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === current);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-index")) || 0);
          start();
        });
      });

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    }

    var filterGrid = document.querySelector("[data-filter-grid]");
    if (filterGrid) {
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
      var searchInput = document.querySelector("[data-search-input]");
      var yearSelect = document.querySelector("[data-year-filter]");
      var typeSelect = document.querySelector("[data-type-filter]");
      var categorySelect = document.querySelector("[data-category-filter]");
      var countNode = document.querySelector("[data-filter-count]");
      var emptyNode = document.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var category = normalize(categorySelect ? categorySelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = "当前显示 " + visible + " 部作品";
        }
        if (emptyNode) {
          emptyNode.style.display = visible === 0 ? "block" : "none";
        }
      }

      [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
