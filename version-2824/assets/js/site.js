
(function () {
    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        const toggle = document.querySelector('[data-menu-toggle]');
        const nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        start();
    }

    function initPosterFallback() {
        document.querySelectorAll('.poster-wrap img, .hero-poster img, .detail-poster img').forEach(function (img) {
            img.addEventListener('error', function () {
                const wrap = img.closest('.poster-wrap') || img.parentElement;
                if (wrap) {
                    wrap.classList.add('missing-poster');
                }
                img.style.opacity = '0';
            }, { once: true });
        });
    }

    function sortCards(cards, mode) {
        return cards.sort(function (a, b) {
            if (mode === 'hot') {
                return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
            }
            if (mode === 'title') {
                return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
            }
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
    }

    function initFilters() {
        const list = document.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        const cards = Array.from(list.children);
        const localInput = document.querySelector('[data-local-search]');
        const globalInput = document.querySelector('[data-global-search]');
        const categoryFilter = document.querySelector('[data-category-filter]');
        const typeFilter = document.querySelector('[data-type-filter]');
        const sortSelect = document.querySelector('[data-local-sort]');
        const resultCount = document.querySelector('[data-result-count]');
        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get('q') || '';
        const input = globalInput || localInput;

        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }

        function apply() {
            const keyword = normalize(input ? input.value : '');
            const category = normalize(categoryFilter ? categoryFilter.value : '');
            const type = normalize(typeFilter ? typeFilter.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize(card.dataset.keywords + ' ' + card.dataset.title);
                const inCategory = !category || normalize(card.dataset.category) === category;
                const inType = !type || haystack.indexOf(type) !== -1;
                const inKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const shouldShow = inCategory && inType && inKeyword;
                card.classList.toggle('is-filter-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = '共 ' + visible + ' 部影片';
            }
        }

        function sortAndApply() {
            const sorted = sortCards(cards.slice(), sortSelect ? sortSelect.value : 'year');
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            apply();
        }

        [input, categoryFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', sortAndApply);
        }

        sortAndApply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initPosterFallback();
        initFilters();
    });
}());
