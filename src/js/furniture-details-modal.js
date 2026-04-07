import * as api from './api.js';
import { showLoader, hideLoader } from './loader.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const refs = {
  backdropBtn: document.querySelector('[data-furniture-details-modal]'),
  closeBtn: document.querySelector('[data-furniture-details-close]'),
  orderBtn: document.querySelector('.furniture-order-btn'),
  mainImage: document.getElementById('mainImage'),
  thumbnailsList: document.getElementById('thumbnailsList'),
  furnitureName: document.getElementById('furnitureName'),
  furnitureCategory: document.getElementById('furnitureCategory'),
  furniturePrice: document.getElementById('furniturePrice'),
  furnitureRating: document.getElementById('furnitureRating'),
  colorsList: document.getElementById('colorsList'),
  furnitureDescription: document.getElementById('furnitureDescription'),
  furnitureSize: document.getElementById('furnitureSize'),
  itemsList: document.querySelector('.items'),
};

let currentSelectedColor = null;
let currentFurnitureId = '';
let lastFocusedElement = null;

function updateThumbnailSelection(activeItem) {
  if (!refs.thumbnailsList) return;

  refs.thumbnailsList.querySelectorAll('.furniture-thumbnail').forEach(item => {
    const button = item.querySelector('.furniture-thumbnail-btn');
    const isActive = item === activeItem;

    item.classList.toggle('active', isActive);
    button?.setAttribute('aria-pressed', String(isActive));
  });
}

function generateRatingStars(rating) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 !== 0;
  let starsHTML = '';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHTML += '<span class="furniture-star" aria-hidden="true">&#9733;</span>';
    } else if (i === fullStars && hasHalfStar) {
      starsHTML += '<span class="furniture-star half" aria-hidden="true">&#9733;</span>';
    } else {
      starsHTML += '<span class="furniture-star empty" aria-hidden="true">&#9733;</span>';
    }
  }

  return starsHTML;
}

function formatDimensions(dimensions) {
  if (!dimensions) return '';

  const { width, height, depth } = dimensions;
  if (width && height && depth) {
    return `${width}x${height}x${depth}`;
  }

  return '';
}

function openModal() {
  if (!refs.backdropBtn || !refs.backdropBtn.classList.contains('is-hidden')) return;

  lastFocusedElement = document.activeElement;
  refs.backdropBtn.classList.remove('is-hidden');
  document.body.classList.add('no-scroll');
  refs.closeBtn?.focus();
}

function closeModal() {
  if (!refs.backdropBtn || refs.backdropBtn.classList.contains('is-hidden')) return;

  refs.backdropBtn.classList.add('is-hidden');
  document.body.classList.remove('no-scroll');

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function openOrderModal() {
  const orderBackdrop = document.querySelector('[data-order-modal]');
  if (!orderBackdrop || !orderBackdrop.classList.contains('is-hidden')) return;

  if (currentFurnitureId) {
    window.currentOrderProductId = currentFurnitureId;
  }

  if (currentSelectedColor) {
    window.currentOrderColor = currentSelectedColor;
  }

  orderBackdrop.classList.remove('is-hidden');
  document.body.classList.add('no-scroll');

  const orderTitle = orderBackdrop.querySelector('#order-title');
  orderTitle?.focus?.();
}

function renderThumbnails(images, productName) {
  refs.thumbnailsList.innerHTML = '';
  refs.thumbnailsList.setAttribute('aria-label', `Галерея товару ${productName}`);

  images.forEach((image, index) => {
    const li = document.createElement('li');
    li.className = `furniture-thumbnail ${index === 0 ? 'active' : ''}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'furniture-thumbnail-btn';
    button.setAttribute('aria-pressed', String(index === 0));
    button.setAttribute('aria-label', `Показати фото ${index + 1} для ${productName}`);

    const imageElement = document.createElement('img');
    imageElement.src = image;
    imageElement.alt = `${productName} thumbnail ${index + 1}`;
    imageElement.loading = 'lazy';
    imageElement.decoding = 'async';

    button.appendChild(imageElement);

    button.addEventListener('click', () => {
      refs.mainImage.src = image;
      refs.mainImage.alt = productName;

      updateThumbnailSelection(li);
    });

    li.appendChild(button);
    refs.thumbnailsList.appendChild(li);
  });
}

function renderColors(colors) {
  refs.colorsList.innerHTML = '';
  if (!colors?.length) return;

  currentSelectedColor = colors[0];
  window.currentOrderColor = currentSelectedColor;

  colors.forEach((color, index) => {
    const li = document.createElement('li');
    li.className = 'furniture-color-item';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'color';
    input.value = color;
    input.id = `color-${index}`;
    input.setAttribute('aria-label', `Колір ${color}`);

    if (index === 0) {
      input.checked = true;
    }

    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.className = 'furniture-color-circle';
    label.style.backgroundColor = color;

    input.addEventListener('change', e => {
      if (!e.target.checked) return;
      currentSelectedColor = color;
      window.currentOrderColor = color;
    });

    li.appendChild(input);
    li.appendChild(label);
    refs.colorsList.appendChild(li);
  });
}

async function renderFurnitureDetails(furnitureId) {
  try {
    showLoader();

    currentFurnitureId = furnitureId;
    const furniture = await api.getFurnitureById(furnitureId);

    if (!furniture) {
      iziToast.show({
        message: 'Помилка при завантаженні деталей товару',
        color: 'red',
        position: 'topRight',
      });
      return;
    }

    const images = furniture.images || [];

    if (images.length > 0) {
      refs.mainImage.src = images[0];
      refs.mainImage.alt = furniture.name;
      renderThumbnails(images, furniture.name);
    } else {
      refs.mainImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      refs.mainImage.alt = `${furniture.name} image unavailable`;
      refs.thumbnailsList.innerHTML = '';
    }

    refs.furnitureName.textContent = furniture.name || '';
    refs.furnitureCategory.textContent = furniture.category?.name || '';
    refs.furniturePrice.textContent = furniture.price
      ? `${furniture.price.toLocaleString('uk-UA')} грн`
      : '';

    const ratingValue = furniture.rate ?? furniture.rating ?? 0;
    refs.furnitureRating.innerHTML = generateRatingStars(ratingValue);
    refs.furnitureRating.setAttribute('aria-label', `Рейтинг товару: ${ratingValue} з 5`);

    renderColors(furniture.color || []);

    refs.furnitureDescription.textContent = furniture.description || '';
    refs.furnitureSize.textContent = formatDimensions(furniture.dimensions || null);

    openModal();
  } catch (error) {
    iziToast.show({
      message: `Помилка: ${error.message}`,
      color: 'red',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

if (refs.closeBtn) {
  refs.closeBtn.addEventListener('click', closeModal);
}

if (refs.backdropBtn) {
  refs.backdropBtn.addEventListener('click', e => {
    if (e.target === refs.backdropBtn) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', e => {
  if (
    e.key === 'Escape' &&
    refs.backdropBtn &&
    !refs.backdropBtn.classList.contains('is-hidden')
  ) {
    closeModal();
  }
});

if (refs.orderBtn) {
  refs.orderBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    closeModal();
    setTimeout(openOrderModal, 100);
  });
}

if (refs.itemsList) {
  refs.itemsList.addEventListener('click', async e => {
    const moreInfoBtn = e.target.closest('.more-info-btn');
    if (!moreInfoBtn) return;

    const itemCard = moreInfoBtn.closest('.item-card');
    const furnitureId = itemCard?.dataset?.id;
    if (!furnitureId) return;

    await renderFurnitureDetails(furnitureId);
  });
}
