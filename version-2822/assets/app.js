(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var willOpen = panel.hasAttribute('hidden');
      if (willOpen) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(index - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  startHero();

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var search = filterPanel.querySelector('[data-filter-search]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && search) {
      search.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(search && search.value);
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var title = normalize(card.getAttribute('data-title'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var keywordMatch = !keyword || text.indexOf(keyword) >= 0 || title.indexOf(keyword) >= 0;
        var yearMatch = !selectedYear || cardYear === selectedYear;
        var typeMatch = !selectedType || cardType === selectedType;
        card.classList.toggle('is-filter-hidden', !(keywordMatch && yearMatch && typeMatch));
      });
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    if (year) {
      year.addEventListener('change', applyFilters);
    }

    if (type) {
      type.addEventListener('change', applyFilters);
    }

    applyFilters();
  }
}());
