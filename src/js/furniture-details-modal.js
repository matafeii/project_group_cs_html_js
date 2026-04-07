import * as api from './api.js';
import { showLoader, hideLoader } from './loader.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const BASE_URL = import.meta.env.BASE_URL;

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


function generateRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHTML += '<span class="furniture-star">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      starsHTML += '<span class="furniture-star">★</span>';
    } else {
      starsHTML += '<span class="furniture-star empty">★</span>';
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


async function renderFurnitureDetails(furnitureId) {
  try {
    showLoader();
    const furniture = await api.getFurnitureById(furnitureId);

    if (!furniture) {
      iziToast.show({
        message: 'Помилка при завантажені деталей товару',
        color: 'red',
        position: 'topRight',
      });
      return;
    }

    console.log('Processing furniture data:', furniture);

    let currentIndex = 0;

    if (furniture.images && furniture.images.length > 0) {
      refs.mainImage.src = furniture.images[0];
      refs.mainImage.alt = furniture.name;
    }


    function renderThumbnails() {
      refs.thumbnailsList.innerHTML = '';
      if (furniture.images && furniture.images.length > 0) {
        furniture.images.forEach((image, index) => {
          if (index === currentIndex) return; 
          const li = document.createElement('li');
          li.className = 'furniture-thumbnail';
          li.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}" data-index="${index}">`;

          li.addEventListener('click', () => {
            currentIndex = index;
            refs.mainImage.src = image;
            renderThumbnails(); 
          });

          refs.thumbnailsList.appendChild(li);
        });
      }
    }

    renderThumbnails();

    refs.furnitureName.textContent = furniture.name || '';
    refs.furnitureCategory.textContent = furniture.category?.name || '';
    refs.furniturePrice.textContent = furniture.price ? `${furniture.price.toLocaleString('uk-UA')} грн` : '';


    console.log('Furniture rating:', furniture.rating);
    const rating = furniture.rate || 4;
    refs.furnitureRating.innerHTML = generateRatingStars(rating);


    refs.colorsList.innerHTML = '';
    if (furniture.color && furniture.color.length > 0) {
      currentSelectedColor = furniture.color[0];

      furniture.color.forEach((color, index) => {
        const li = document.createElement('li');
        li.className = 'furniture-color-item';

        const label = document.createElement('label');
        label.className = 'furniture-color-label';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'color';
        input.value = color;
        input.id = `color-${index}`;
        if (index === 0) {
          input.checked = true;
        }

        const circle = document.createElement('div');
        circle.className = 'furniture-color-circle';
        circle.style.backgroundColor = color;

        input.addEventListener('change', (e) => {
          if (e.target.checked) {
            currentSelectedColor = color;
          }
        });

        label.appendChild(input);
        label.appendChild(circle);
        li.appendChild(label);
        refs.colorsList.appendChild(li);
      });
    }


    refs.furnitureDescription.textContent = furniture.description || '';


    const dimensions = furniture.dimensions || { width: 120, height: 80, depth: 60 };
    const formattedDimensions = formatDimensions(dimensions);

    if (refs.furnitureSize) {
      refs.furnitureSize.textContent = furniture.sizes;
    }

    console.log('Furniture dimensions:', dimensions);


    toggleModal();
  } catch (error) {
    console.error('Error rendering furniture:', error);
    iziToast.show({
      message: `Помилка: ${error.message}`,
      color: 'red',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}


function toggleModal() {
  if (refs.backdropBtn) {
    refs.backdropBtn.classList.toggle('is-hidden');
    document.body.classList.toggle('no-scroll');
  }
}

function closeModal() {
  if (!refs.backdropBtn.classList.contains('is-hidden')) {
    toggleModal();
  }
}

function openOrderModal() {
  const orderBackdrop = document.querySelector('[data-order-modal]');
  if (orderBackdrop && orderBackdrop.classList.contains('is-hidden')) {
    orderBackdrop.classList.remove('is-hidden');

    if (!document.body.classList.contains('no-scroll')) {
      document.body.classList.add('no-scroll');
    }
  }
}

if (refs.closeBtn) {
  refs.closeBtn.addEventListener('click', closeModal);
}

if (refs.backdropBtn) {
  refs.backdropBtn.addEventListener('click', (e) => {
    if (e.target === refs.backdropBtn) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (
    e.key === 'Escape' &&
    refs.backdropBtn &&
    !refs.backdropBtn.classList.contains('is-hidden')
  ) {
    closeModal();
  }
});


if (refs.orderBtn) {
  refs.orderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
    setTimeout(() => {
      openOrderModal();
    }, 100);
  });
}

if (refs.itemsList) {
  refs.itemsList.addEventListener('click', async (e) => {
    const moreInfoBtn = e.target.closest('.more-info-btn');
    if (!moreInfoBtn) return;

    const itemCard = moreInfoBtn.closest('.item-card');
    const furnitureId = itemCard.dataset.id;

    await renderFurnitureDetails(furnitureId);
  });
}
