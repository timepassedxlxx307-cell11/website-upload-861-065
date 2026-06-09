(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function initPlayer(player) {
        var video = player.querySelector('video[data-video-src]');
        var trigger = player.querySelector('[data-play-trigger]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-video-src');
        var isLoaded = false;

        function loadSource() {
            if (isLoaded || !source) {
                return;
            }

            isLoaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            loadSource();

            if (trigger) {
                trigger.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            loadSource();
        });

        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);

    var searchForm = document.querySelector('[data-search-form]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchStatus = document.querySelector('[data-search-status]');

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function renderSearch(query) {
        if (!searchResults || !searchStatus || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var keyword = query.trim().toLowerCase();

        if (!keyword) {
            searchResults.innerHTML = '';
            searchStatus.textContent = '输入关键词后即可查看匹配影片。';
            return;
        }

        var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            return movie.searchText.indexOf(keyword) !== -1;
        }).slice(0, 120);

        searchStatus.textContent = '找到 ' + matched.length + ' 个相关结果';

        searchResults.innerHTML = matched.map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a class="card-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
                '<span class="card-play">▶</span>',
                '</a>',
                '<div class="card-body">',
                '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
                '<p class="card-meta">' + escapeHtml(movie.meta) + '</p>',
                '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
                '<div class="card-tags"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.categoryName) + '</a></div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    if (searchForm) {
        var searchInput = searchForm.querySelector('input[name="q"]');
        var initialQuery = getQueryParam('q');

        if (searchInput) {
            searchInput.value = initialQuery;
            renderSearch(initialQuery);

            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = searchInput.value || '';
                var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState({}, '', url);
                renderSearch(query);
            });

            searchInput.addEventListener('input', function () {
                renderSearch(searchInput.value || '');
            });
        }
    }
})();
