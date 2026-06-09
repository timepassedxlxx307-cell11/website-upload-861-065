(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  function scrollRow(id, direction) {
    var row = document.getElementById(id);
    if (!row) {
      return;
    }
    var distance = Math.min(520, row.clientWidth * 0.8);
    row.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-scroll-left]"), function(button) {
    button.addEventListener("click", function() {
      scrollRow(button.getAttribute("data-scroll-left"), -1);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-scroll-right]"), function(button) {
    button.addEventListener("click", function() {
      scrollRow(button.getAttribute("data-scroll-right"), 1);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-filter-panel]"), function(panel) {
    var root = panel.parentElement || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
    var searchInput = panel.querySelector("[data-search-input]");
    var regionFilter = panel.querySelector("[data-region-filter]");
    var yearFilter = panel.querySelector("[data-year-filter]");
    var categoryFilter = panel.querySelector("[data-category-filter]");

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionFilter ? regionFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var category = categoryFilter ? categoryFilter.value : "";
      cards.forEach(function(card) {
        var text = card.getAttribute("data-search") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var visible = true;
        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (region && cardRegion !== region) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (category && cardCategory !== category) {
          visible = false;
        }
        card.classList.toggle("is-hidden", !visible);
      });
    }

    [searchInput, regionFilter, yearFilter, categoryFilter].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
