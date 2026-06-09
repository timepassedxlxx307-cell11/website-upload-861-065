(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobilePanel = qs('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');

    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var index = 0;

        function showSlide(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((index + 1) % slides.length);
            }, 5200);
        }
    }

    var searchPage = qs('[data-search-page]');
    var localFilter = qs('[data-local-filter]');
    var filterList = qs('[data-filter-list]');
    var emptyState = qs('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function updateList(options) {
        if (!filterList) {
            return;
        }

        var query = normalize(options.query);
        var category = normalize(options.category);
        var sort = options.sort || 'default';
        var cards = qsa('[data-movie-card]', filterList);
        var visible = 0;

        cards.forEach(function (card) {
            var blob = normalize(card.getAttribute('data-search'));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var matchQuery = !query || blob.indexOf(query) !== -1;
            var matchCategory = !category || cardCategory === category;
            var active = matchQuery && matchCategory;
            card.style.display = active ? '' : 'none';
            if (active) {
                visible += 1;
            }
        });

        if (sort !== 'default') {
            var sorted = cards.slice().sort(function (a, b) {
                if (sort === 'new') {
                    return normalize(b.getAttribute('data-year')).localeCompare(normalize(a.getAttribute('data-year')));
                }
                if (sort === 'hot' || sort === 'score') {
                    return normalize(b.textContent).localeCompare(normalize(a.textContent));
                }
                return 0;
            });
            sorted.forEach(function (card) {
                filterList.appendChild(card);
            });
        }

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchPage && filterList) {
        var url = new URL(window.location.href);
        var input = qs('[data-search-input]', searchPage);
        var categorySelect = qs('[data-category-select]', searchPage);
        var sortSelect = qs('[data-sort-select]', searchPage);

        if (input) {
            input.value = url.searchParams.get('q') || '';
        }
        if (sortSelect && url.searchParams.get('sort')) {
            sortSelect.value = url.searchParams.get('sort');
        }

        function runSearch(event) {
            if (event) {
                event.preventDefault();
            }
            updateList({
                query: input ? input.value : '',
                category: categorySelect ? categorySelect.value : '',
                sort: sortSelect ? sortSelect.value : 'default'
            });
        }

        searchPage.addEventListener('submit', runSearch);
        if (input) {
            input.addEventListener('input', runSearch);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', runSearch);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', runSearch);
        }
        runSearch();
    }

    if (localFilter && filterList) {
        var localInput = qs('[data-filter-input]', localFilter);

        function runLocalFilter(event) {
            if (event) {
                event.preventDefault();
            }
            updateList({
                query: localInput ? localInput.value : '',
                category: '',
                sort: 'default'
            });
        }

        localFilter.addEventListener('submit', runLocalFilter);
        if (localInput) {
            localInput.addEventListener('input', runLocalFilter);
        }
    }
})();
