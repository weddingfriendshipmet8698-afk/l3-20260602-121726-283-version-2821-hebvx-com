(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            menuButton.textContent = mobileMenu.classList.contains('is-open') ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;
        var show = function (index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var keyword = filterPanel.querySelector('[data-filter-keyword]');
        var year = filterPanel.querySelector('[data-filter-year]');
        var region = filterPanel.querySelector('[data-filter-region]');
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-filter-empty]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var apply = function () {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.year
                ].join(' ').toLowerCase();
                var ok = (!q || text.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!r || card.dataset.region === r);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };
        [keyword, year, region].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
        apply();
    }

    var searchRoot = document.querySelector('[data-search-results]');
    if (searchRoot && window.SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');
        var emptyBox = document.querySelector('[data-search-empty]');
        if (input) {
            input.value = query;
        }
        var normalize = function (value) {
            return String(value || '').toLowerCase();
        };
        var renderCard = function (movie) {
            return '<a class="movie-card" href="' + movie.url + '" data-title="' + movie.title + '">' +
                '<div class="poster-frame"><img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy"><span class="poster-year">' + movie.year + '</span><span class="poster-play">▶</span></div>' +
                '<div class="movie-card-body"><h3>' + movie.title + '</h3><p>' + movie.desc + '</p><div class="movie-meta"><span>' + movie.year + ' · ' + movie.region + '</span><span>' + movie.genre + '</span></div></div>' +
                '</a>';
        };
        var results = [];
        if (query) {
            var q = normalize(query);
            results = window.SEARCH_INDEX.filter(function (movie) {
                return normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.year + ' ' + movie.desc).indexOf(q) !== -1;
            }).slice(0, 120);
        }
        searchRoot.innerHTML = results.map(renderCard).join('');
        if (emptyBox) {
            emptyBox.hidden = results.length > 0;
        }
    }
}());
