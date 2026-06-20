(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
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
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var pageFilter = document.querySelector("[data-page-filter]");
    if (pageFilter) {
      var grid = document.querySelector("[data-card-grid]");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
      var empty = document.querySelector("[data-empty]");
      pageFilter.addEventListener("input", function () {
        var q = pageFilter.value.trim().toLowerCase();
        var count = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var visible = text.indexOf(q) !== -1;
          card.style.display = visible ? "" : "none";
          if (visible) {
            count += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", count === 0);
        }
      });
    }

    var library = document.querySelector("[data-library]");
    if (library) {
      var libraryCards = Array.prototype.slice.call(library.querySelectorAll(".movie-card"));
      var qInput = document.querySelector("[data-library-q]");
      var yearSelect = document.querySelector("[data-library-year]");
      var regionSelect = document.querySelector("[data-library-region]");
      var typeSelect = document.querySelector("[data-library-type]");
      var reset = document.querySelector("[data-library-reset]");
      var libraryEmpty = document.querySelector("[data-library-empty]");

      function filterLibrary() {
        var q = qInput ? qInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var count = 0;
        libraryCards.forEach(function (card) {
          var text = [card.getAttribute("data-title"), card.getAttribute("data-tags")].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            ok = false;
          }
          if (region && card.getAttribute("data-region") !== region) {
            ok = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            count += 1;
          }
        });
        if (libraryEmpty) {
          libraryEmpty.classList.toggle("is-visible", count === 0);
        }
      }

      [qInput, yearSelect, regionSelect, typeSelect].forEach(function (field) {
        if (field) {
          field.addEventListener(field.tagName === "SELECT" ? "change" : "input", filterLibrary);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (qInput) qInput.value = "";
          if (yearSelect) yearSelect.value = "";
          if (regionSelect) regionSelect.value = "";
          if (typeSelect) typeSelect.value = "";
          filterLibrary();
        });
      }
    }

    var searchMount = document.querySelector("[data-search-results]");
    if (searchMount && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      var searchInput = document.querySelector("[data-search-input]");
      var searchTitle = document.querySelector("[data-search-title]");
      if (searchInput) {
        searchInput.value = query;
      }

      function renderSearch(term) {
        var q = term.trim().toLowerCase();
        var results = window.SEARCH_MOVIES.filter(function (item) {
          if (!q) {
            return true;
          }
          return [item.title, item.year, item.region, item.type, item.tags, item.category].join(" ").toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120);
        if (searchTitle) {
          searchTitle.textContent = q ? "搜索结果" : "影片搜索";
        }
        searchMount.innerHTML = results.map(function (item) {
          return [
            '<article class="movie-card">',
            '<a href="' + item.url + '" class="card-link">',
            '<div class="card-poster">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<div class="card-shade"><span class="play-dot">▶</span></div>',
            '<span class="card-type">' + escapeHtml(item.category) + '</span>',
            '<span class="card-score">' + escapeHtml(item.rating) + '</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<p class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>',
            '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-line">' + item.tags.split(" ").slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
            '</div>',
            '</a>',
            '</article>'
          ].join("");
        }).join("");
        var empty = document.querySelector("[data-search-empty]");
        if (empty) {
          empty.classList.toggle("is-visible", results.length === 0);
        }
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
          }[char];
        });
      }

      renderSearch(query);
      var form = document.querySelector("[data-search-form]");
      if (form && searchInput) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          renderSearch(searchInput.value);
          var url = new URL(window.location.href);
          url.searchParams.set("q", searchInput.value.trim());
          window.history.replaceState({}, "", url.toString());
        });
      }
    }
  });
})();
