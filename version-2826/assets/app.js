const menuButton = document.querySelector("[data-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", () => {
    mobilePanel.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let index = 0;

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, itemIndex) => {
      slide.classList.toggle("is-active", itemIndex === index);
    });
    dots.forEach((dot, itemIndex) => {
      dot.classList.toggle("is-active", itemIndex === index);
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => showSlide(dotIndex));
  });

  if (slides.length > 1) {
    setInterval(() => showSlide(index + 1), 5600);
  }
}

const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));

scopes.forEach((scope) => {
  const grid = scope.parentElement.querySelector("[data-filter-grid]") || document.querySelector("[data-filter-grid]");
  const input = scope.querySelector("[data-filter-input]");
  const year = scope.querySelector("[data-year-filter]");
  const category = scope.querySelector("[data-category-filter]");
  const sort = scope.querySelector("[data-sort-filter]");

  if (!grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll(".movie-card"));

  function applyFilters() {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const chosenYear = year ? year.value : "";
    const chosenCategory = category ? category.value : "";
    const mode = sort ? sort.value : "default";

    cards.forEach((card) => {
      const text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags
      ].join(" ").toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword);
      const matchYear = !chosenYear || card.dataset.year === chosenYear;
      const matchCategory = !chosenCategory || text.includes(chosenCategory.toLowerCase());
      card.hidden = !(matchKeyword && matchYear && matchCategory);
    });

    const visible = cards.filter((card) => !card.hidden);

    if (mode === "year-desc") {
      visible.sort((a, b) => Number(b.dataset.year) - Number(a.dataset.year));
    } else if (mode === "year-asc") {
      visible.sort((a, b) => Number(a.dataset.year) - Number(b.dataset.year));
    } else if (mode === "title") {
      visible.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title, "zh-Hans-CN"));
    } else {
      visible.sort((a, b) => Number(a.dataset.order || 0) - Number(b.dataset.order || 0));
    }

    visible.forEach((card) => grid.appendChild(card));
  }

  cards.forEach((card, cardIndex) => {
    card.dataset.order = String(cardIndex);
  });

  [input, year, category, sort].forEach((control) => {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
});
