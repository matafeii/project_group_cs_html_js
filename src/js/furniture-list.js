import * as api from './api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { showLoader, hideLoader } from './loader.js';

const BASE_URL = import.meta.env.BASE_URL;
const ITEMS_PER_PAGE = 8;
const LEFT_ARROW_ICON = `${BASE_URL}img/left-arrow.svg`;
const RIGHT_ARROW_ICON = `${BASE_URL}img/right-arrow.svg`;

const categories = document.querySelector('.categories');
const items = document.querySelector('.items');
const pagination = document.querySelector('.pagination');
const loadBtn = document.querySelector('.load-more-btn');

let currentPage = 1;
let totalPages = 0;
let selectedCategoryId = null;

const categoryImages = {
  '66504a50a1b2c3d4e5f6a7c0': {
    normal: `${BASE_URL}img/categories-img/hallway-furniture.jpg`,
    retina: `${BASE_URL}img/categories-img/hallway-furniture-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7bd': {
    normal: `${BASE_URL}img/categories-img/kitchens.jpg`,
    retina: `${BASE_URL}img/categories-img/kitchens-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7c2': {
    normal: `${BASE_URL}img/categories-img/garden-furniture.jpg`,
    retina: `${BASE_URL}img/categories-img/garden-furniture-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7bb': {
    normal: `${BASE_URL}img/categories-img/tables.jpg`,
    retina: `${BASE_URL}img/categories-img/tables-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7b8': {
    normal: `${BASE_URL}img/categories-img/sofa.jpg`,
    retina: `${BASE_URL}img/categories-img/sofa-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7be': {
    normal: `${BASE_URL}img/categories-img/childrens-furniture.jpg`,
    retina: `${BASE_URL}img/categories-img/childrens-furniture-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7c3': {
    normal: `${BASE_URL}img/categories-img/decor.jpg`,
    retina: `${BASE_URL}img/categories-img/decor-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7c1': {
    normal: `${BASE_URL}img/categories-img/bathroom.jpg`,
    retina: `${BASE_URL}img/categories-img/bathroom-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7bf': {
    normal: `${BASE_URL}img/categories-img/office.jpg`,
    retina: `${BASE_URL}img/categories-img/office-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7b9': {
    normal: `${BASE_URL}img/categories-img/wardrobe.jpg`,
    retina: `${BASE_URL}img/categories-img/wardrobe-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7ba': {
    normal: `${BASE_URL}img/categories-img/bed.jpg`,
    retina: `${BASE_URL}img/categories-img/bed-2x.jpg`,
  },
  '66504a50a1b2c3d4e5f6a7bc': {
    normal: `${BASE_URL}img/categories-img/chairs.jpg`,
    retina: `${BASE_URL}img/categories-img/chairs-2x.jpg`,
  },
};

function showError(message) {
  iziToast.show({
    message,
    color: 'red',
    position: 'topRight',
  });
}

function categoryTemplate(item) {
  const image = categoryImages[item._id];

  return `
    <li
      data-id="${item._id}"
      class="category-item"
      role="button"
      tabindex="0"
      aria-label="Категорія: ${item.name}"
      style="
        background-image: ${
          image
            ? `image-set(url('${image.normal}') 1x, url('${image.retina}') 2x)`
            : 'none'
        };
        background-size: cover;
        background-position: center;
      "
    >
      ${item.name}
    </li>
  `;
}

function categoriesTemplate(list) {
  return `
    <li
      data-id="all-categories"
      class="category-item active-category"
      role="button"
      tabindex="0"
      aria-label="Усі товари"
      style="
        background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
          image-set(
            url('${BASE_URL}img/categories-img/all-items.jpg') 1x,
            url('${BASE_URL}img/categories-img/all-items-2x.jpg') 2x
          );
        background-size: cover;
        background-position: center;
      "
    >
      Всі товари
    </li>
  ${list.map(categoryTemplate).join('')}`;
}

function furnitureTemplate(item) {
  const colors = (item.color || [])
    .map(
      color =>
        `<li class="furnitures-color" style="background-color:${color}" aria-hidden="true"></li>`
    )
    .join('');

  const mainImage = item.images?.[0] || `${BASE_URL}img/categories-img/all-items.jpg`;

  return `
    <li class="item-card" data-id="${item._id}">
      <img src="${mainImage}" alt="${item.name}" loading="lazy" decoding="async">
      <div class="furnitures-description">
        <p class="furnitures-name">${item.name}</p>
        <ul class="furnitures-colors" aria-label="Доступні кольори">${colors}</ul>
        <p class="furnitures-price">${item.price.toLocaleString('uk-UA')} грн</p>
      </div>
      <button type="button" class="more-info-btn" aria-label="Детальніше про ${item.name}">Детальніше</button>
    </li>
  `;
}

function furnituresTemplate(list) {
  return list.map(furnitureTemplate).join('');
}

function setActiveCategoryElement(target) {
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.remove('active-category');
  });
  target.classList.add('active-category');
}

async function loadFurniture(clearItems = false) {
  if (!items || !pagination || !loadBtn) return;

  try {
    showLoader();

    if (clearItems) {
      items.innerHTML = '';
    }

    const data = await api.getFurniture(currentPage, selectedCategoryId);
    const furnitures = data.furnitures || data.results || [];
    const totalItems = data.totalItems ?? furnitures.length;

    items.insertAdjacentHTML('beforeend', furnituresTemplate(furnitures));

    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = '';
    renderPagination(totalPages, currentPage);

    loadBtn.hidden = currentPage >= totalPages || totalPages === 0;
  } catch (error) {
    showError(`Помилка: ${error.message}`);
  } finally {
    hideLoader();
  }
}

function renderPagination(pagesTotal, pageCurrent = 1) {
  if (!pagination || pagesTotal <= 1) return;

  let markup = `
    <button type="button" class="pagination-arrows back-arrow" aria-label="Попередня сторінка">
      <svg class="left-arrow" width="24" height="24" aria-hidden="true">
        <use href="${LEFT_ARROW_ICON}"></use>
      </svg>
    </button>
  `;

  if (pageCurrent <= 2) {
    for (let i = 1; i <= Math.min(3, pagesTotal); i++) {
      markup += `
        <button type="button" class="pagination-choice" data-page-number="${i}" ${
          i === pageCurrent ? 'aria-current="page"' : ''
        }>${i}</button>
      `;
    }
  } else {
    markup += `<button type="button" class="pagination-choice" data-page-number="1">1</button>`;
    markup += `<div class="pagination-dots" aria-hidden="true">...</div>`;

    for (let i = pageCurrent - 1; i <= pageCurrent + 1 && i <= pagesTotal - 1; i++) {
      markup += `
        <button type="button" class="pagination-choice" data-page-number="${i}" ${
          i === pageCurrent ? 'aria-current="page"' : ''
        }>${i}</button>
      `;
    }
  }

  if (pageCurrent < pagesTotal - 1) {
    markup += `<div class="pagination-dots" aria-hidden="true">...</div>`;
  }

  markup += `
    <button type="button" class="pagination-choice" data-page-number="${pagesTotal}" ${
      pagesTotal === pageCurrent ? 'aria-current="page"' : ''
    }>${pagesTotal}</button>
    <button type="button" class="pagination-arrows forward-arrow" aria-label="Наступна сторінка">
      <svg class="left-arrow" width="24" height="24" aria-hidden="true">
        <use href="${RIGHT_ARROW_ICON}"></use>
      </svg>
    </button>
  `;

  pagination.insertAdjacentHTML('beforeend', markup);

  const pageElements = pagination.querySelectorAll('[data-page-number]');
  pageElements.forEach(page => {
    page.classList.toggle('active-page', Number(page.dataset.pageNumber) === pageCurrent);
  });
}

function onCategoryActivate(target) {
  if (!target) return;

  setActiveCategoryElement(target);
  selectedCategoryId = target.dataset.id === 'all-categories' ? null : target.dataset.id;
  currentPage = 1;
  loadFurniture(true);
}

function bindEvents() {
  if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
      if (currentPage >= totalPages) return;

      currentPage += 1;
      const lastItem = items?.lastElementChild;
      await loadFurniture(false);

      if (lastItem) {
        lastItem.nextElementSibling?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      loadBtn.blur();
    });
  }

  if (pagination) {
    pagination.addEventListener('click', async e => {
      const pageBtn = e.target.closest('[data-page-number]');
      const arrowBtn = e.target.closest('.pagination-arrows');

      if (pageBtn) {
        currentPage = Number(pageBtn.dataset.pageNumber);
        await loadFurniture(true);
        items?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (!arrowBtn) return;

      if (arrowBtn.classList.contains('forward-arrow') && currentPage < totalPages) {
        currentPage += 1;
      }

      if (arrowBtn.classList.contains('back-arrow') && currentPage > 1) {
        currentPage -= 1;
      }

      await loadFurniture(true);
      items?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      arrowBtn.blur();
    });
  }

  if (categories) {
    categories.addEventListener('click', e => {
      const target = e.target.closest('.category-item');
      onCategoryActivate(target);
    });

    categories.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;

      const target = e.target.closest('.category-item');
      if (!target) return;

      e.preventDefault();
      onCategoryActivate(target);
    });
  }
}

async function init() {
  if (!categories || !items || !pagination || !loadBtn) return;

  try {
    const categoriesData = await api.getCategories();
    categories.insertAdjacentHTML('beforeend', categoriesTemplate(categoriesData));
    await loadFurniture(true);
  } catch (error) {
    showError(`Помилка ініціалізації: ${error.message}`);
  }
}

bindEvents();
init();
