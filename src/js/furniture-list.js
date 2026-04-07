import * as api from './api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { showLoader, hideLoader } from './loader.js';

const BASE_URL = import.meta.env.BASE_URL;
const ITEMS_PER_PAGE = 8;
const categories = document.querySelector('.categories');
const items = document.querySelector('.items');
const pagination = document.querySelector('.pagination');
const loadBtn = document.querySelector('.load-more-btn');

let currentPage = 1;
let totalPages = 0;
let id = null;

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

function categoryTemplate(item) {
  const img = categoryImages[item._id];
  return `
    <li 
      data-id="${item._id}"
      class="category-item"
      style="
        background-image: ${
          img
            ? `image-set(
                url('${img.normal}') 1x,
                url('${img.retina}') 2x
              )`
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

function categoriesTemplate(itemsData) {
  let markup = `
    <li 
      data-id="all-categories"
      class="category-item active-category"
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
  `;
  markup += itemsData.map(categoryTemplate).join('');
  return markup;
}

function furnitureTemplate(item) {
  const colors = item.color
    .map(
      color =>
        `<li class="furnitures-color" style="background-color:${color}"></li>`
    )
    .join('');
  return `
    <li class="item-card" data-id="${item._id}">
      <img src="${item.images[0]}" alt="${item.name}">
      <div class="furnitures-description">
        <p class="furnitures-name">${item.name}</p>
        <ul class="furnitures-colors">${colors}</ul>
        <p class="furnitures-price">${item.price.toLocaleString('uk-UA')} грн</p>
      </div>
      <button class="more-info-btn">Детальніше</button>
    </li>
  `;
}

function furnituresTemplate(data) {
  return data.map(furnitureTemplate).join('');
}

async function loadFurniture(clearItems = false) {
  try {
    showLoader();
    if (clearItems) {
      items.innerHTML = '';
    }
    const data = await api.getFurniture(currentPage, id);
    items.insertAdjacentHTML('beforeend', furnituresTemplate(data.furnitures));
    totalPages = Math.ceil(data.totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = '';
    renderPagination(totalPages, currentPage);
    if (currentPage >= totalPages) {
      loadBtn.style.display = "none";
    } else {
      loadBtn.style.display = "block";
    }
  } catch (error) {
    iziToast.show({
      message: `Error: ${error}`,
      color: 'red',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

function renderPagination(totalPages, currentPage = 1) {
  if (totalPages <= 1) return;
  pagination.style.display = "flex";
  pagination.innerHTML = '';
  let markup = `<button type="button" class="pagination-arrows back-arrow"><svg class="left-arrow" width="24" height="24">
        <use href="${BASE_URL}/img/left-arrow.svg"></use>
      </svg></button>`;
  if (currentPage <= 2) {
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      markup += `<div class="pagination-choice" data-page-number="${i}">${i}</div>`;
    }
  } else {
    markup += `<div class="pagination-choice" data-page-number="1">1</div>`;
    markup += `<div class="pagination-dots">...</div>`;
    for (
      let i = currentPage - 1;
      i <= currentPage + 1 && i <= totalPages - 1;
      i++
    ) {
      markup += `<div class="pagination-choice" data-page-number="${i}">${i}</div>`;
    }
  }
  if (currentPage < totalPages - 1) {
    markup += `<div class="pagination-dots">...</div>`;
  }
  markup += `<div class="pagination-choice" data-page-number="${totalPages}">${totalPages}</div>`;
  markup += `<button type="button" class="pagination-arrows forward-arrow"><svg class="left-arrow" width="24" height="24">
        <use href="${BASE_URL}/img/right-arrow.svg"></use>
      </svg></button>`;
  pagination.insertAdjacentHTML('beforeend', markup);
  const pages = document.querySelectorAll('[data-page-number]');
  pages.forEach(page => {
    page.classList.toggle(
      'active-page',
      Number(page.dataset.pageNumber) === currentPage
    );
  });
}

loadBtn.addEventListener('click', async () => {
  if (currentPage >= totalPages) return;
  currentPage++;
  const lastItem = items.lastElementChild;
  await loadFurniture(false);
  if (lastItem) {
    lastItem.nextElementSibling?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
  loadBtn.blur();
});

pagination.addEventListener('click', async e => {
  const pageBtn = e.target.closest('[data-page-number]');
  const arrowBtn = e.target.closest('.pagination-arrows');
  if (pageBtn) {
    currentPage = Number(pageBtn.dataset.pageNumber);
    items.style.height = '790px';
    await loadFurniture(true);
    items.style.height = 'auto';
    items.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (arrowBtn) {
    if (
      arrowBtn.classList.contains('forward-arrow') &&
      currentPage < totalPages
    ) {
      currentPage++;
      items.style.height = '790px';
      await loadFurniture(true);
      items.style.height = 'auto';
      items.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (arrowBtn.classList.contains('back-arrow') && currentPage > 1) {
      currentPage--;
      items.style.height = '790px';
      await loadFurniture(true);
      items.style.height = 'auto';
      items.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    arrowBtn.blur();
  }
});

categories.addEventListener('click', async e => {
  const target = e.target.closest('.category-item');
  if (!target) return;
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.remove('active-category');
  });
  target.classList.add('active-category');
  id = target.dataset.id === 'all-categories' ? null : target.dataset.id;
  currentPage = 1;
  items.scrollIntoView({ behavior: 'smooth', block: 'start' });
  await loadFurniture(true);
});

async function init() {
  try {
    const categoriesData = await api.getCategories();
    categories.insertAdjacentHTML(
      'beforeend',
      categoriesTemplate(categoriesData)
    );
    await loadFurniture(true);
  } catch (error) {
    iziToast.show({
      message: `Error: ${error}`,
      color: 'red',
      position: 'topRight',
    });
  }
}

init();
