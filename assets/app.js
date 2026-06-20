(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('[data-menu-button]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('.hero-slide', slider);
    var dots = $all('.hero-dot', slider);
    var prev = $('.hero-prev', slider);
    var next = $('.hero-next', slider);
    var current = 0;
    var timer = null;

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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var panels = $all('.movie-filter');
    if (!panels.length) {
      return;
    }
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var keyword = $('[data-filter-keyword]', panel);
      var genre = $('[data-filter-genre]', panel);
      var year = $('[data-filter-year]', panel);
      var region = $('[data-filter-region]', panel);
      var cards = $all('.movie-card', root);
      var empty = $('.empty-state', root);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');

      if (keyword && initial) {
        keyword.value = initial;
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var g = normalize(genre && genre.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category
          ].join(' '));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (g && normalize(card.dataset.genre).indexOf(g) === -1) {
            ok = false;
          }
          if (y && normalize(card.dataset.year).indexOf(y) === -1) {
            ok = false;
          }
          if (r && normalize(card.dataset.region).indexOf(r) === -1) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [keyword, genre, year, region].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initPlayer(config) {
    var video = document.getElementById(config.id);
    var overlay = document.getElementById(config.overlay);
    var trigger = document.getElementById(config.trigger);
    var attached = false;
    var hls = null;

    if (!video || !config.source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
      attached = true;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('ended', function () {
      if (hls && typeof hls.stopLoad === 'function') {
        hls.stopLoad();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
