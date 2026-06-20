(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
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
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var keyword = scope.querySelector("[data-filter-keyword]");
        var year = scope.querySelector("[data-filter-year]");
        var type = scope.querySelector("[data-filter-type]");
        var region = scope.querySelector("[data-filter-region]");
        var empty = scope.querySelector("[data-empty]");

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : "";
        }

        function apply() {
            var q = valueOf(keyword);
            var y = valueOf(year);
            var t = valueOf(type);
            var r = valueOf(region);
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || "",
                    card.dataset.tags || "",
                    card.dataset.category || "",
                    card.dataset.region || ""
                ].join(" ").toLowerCase();
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (y && (card.dataset.year || "").toLowerCase() !== y) {
                    match = false;
                }
                if (t && (card.dataset.type || "").toLowerCase() !== t) {
                    match = false;
                }
                if (r && (card.dataset.region || "").toLowerCase().indexOf(r) === -1) {
                    match = false;
                }
                card.classList.toggle("hidden", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [keyword, year, type, region].forEach(function (input) {
            if (input) {
                input.addEventListener("input", apply);
                input.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer() {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-start");
            var stream = shell.getAttribute("data-stream");
            var loaded = false;
            var hlsObject = null;

            function load() {
                if (loaded || !video || !stream) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsObject = new window.Hls({ enableWorker: true });
                    hlsObject.loadSource(stream);
                    hlsObject.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                load();
                shell.classList.add("is-playing");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0) {
                        shell.classList.remove("is-playing");
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsObject) {
                    hlsObject.destroy();
                }
            });
        });
    }

    function initSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.siteMovies) {
            return;
        }
        var primary = root.querySelector("[data-search-primary]");
        var refine = root.querySelector("[data-search-refine]");
        var type = root.querySelector("[data-search-type]");
        var region = root.querySelector("[data-search-region]");
        var results = root.querySelector("[data-search-results]");
        var empty = root.querySelector("[data-search-empty]");
        var submit = root.querySelector(".search-submit");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (primary) {
            primary.value = initial;
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a href="./' + movie.file + '" class="movie-card-link">',
                '<div class="movie-cover">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
                '</div>',
                '<div class="movie-card-body">',
                '<h3>' + escapeHtml(movie.title) + '</h3>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="movie-tags">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
                '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function render() {
            var q = primary ? primary.value.trim().toLowerCase() : "";
            var refineText = refine ? refine.value.trim().toLowerCase() : "";
            var t = type ? type.value.trim() : "";
            var r = region ? region.value.trim() : "";
            var list = window.siteMovies.filter(function (movie) {
                var text = [movie.title, movie.oneLine, movie.genre, movie.region, movie.type, movie.tags.join(' ')].join(' ').toLowerCase();
                if (q && text.indexOf(q) === -1) {
                    return false;
                }
                if (refineText && text.indexOf(refineText) === -1) {
                    return false;
                }
                if (t && movie.type !== t) {
                    return false;
                }
                if (r && movie.region.indexOf(r) === -1) {
                    return false;
                }
                return true;
            }).slice(0, 120);
            if (results) {
                results.innerHTML = list.map(card).join('');
            }
            if (empty) {
                empty.classList.toggle("show", list.length === 0);
            }
        }

        [primary, refine, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });
        if (submit) {
            submit.addEventListener("click", render);
        }
        render();
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initPlayer();
        initSearchPage();
    });
}());
