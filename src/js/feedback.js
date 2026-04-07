import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/pagination';
import 'swiper/css';
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import Raty from 'raty-js';

const API_URL = 'https://furniture-store.b.goit.study/api/feedbacks';

function getCustomRoundedRating(rate) {
  const parsed = parseFloat(rate);
  if (parsed >= 3.3 && parsed <= 3.7) return 3.5;
  if (parsed >= 3.8 && parsed <= 4.2) return 4.0;
  return parsed;
}

async function fetchFeedbacks() {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page: '1',
        limit: '10',
      },
    });

    return Array.isArray(response.data)
      ? response.data
      : response.data.feedbacks || [];
  } catch (error) {
    iziToast.error({
      message: 'Не вдалося завантажити відгуки',
      position: 'topRight',
      titleColor: 'red',
    });
    return [];
  }
}

function createMarkup(feedbacks) {
  return feedbacks
    .map(({ name, descr, rate }) => {
      const displayRate = getCustomRoundedRating(rate);
      return `
      <li class="swiper-slide feedback-item">
        <div class="feedback-card">
          <div class="star-rating-container" data-rating="${displayRate}" aria-label="Рейтинг ${displayRate} з 5"></div>
          <p class="feedback-comment">"${descr}"</p>
          <h3 class="feedback-user-name">${name}</h3>
        </div>
      </li>
    `;
    })
    .join('');
}

export function initRatings() {
  const ratings = document.querySelectorAll('.star-rating-container');

  ratings.forEach(el => {
    const score = parseFloat(el.getAttribute('data-rating'));
    const raty = new Raty(el, {
      score,
      readOnly: true,
      half: true,
      halfShow: true,
      starType: 'i',
      starOn: 'fas fa-star',
      starOff: 'far fa-star',
      starHalf: 'fas fa-star-half-alt',
      space: false,
    });

    raty.init();
  });
}

async function initFeedbackSection() {
  const container = document.querySelector('.feedback-list');
  if (!container) return;

  const data = await fetchFeedbacks();
  if (data.length === 0) return;

  container.innerHTML = createMarkup(data);
  initRatings();

  new Swiper('.feedback-swiper', {
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: '.feedback-dots',
      clickable: true,
      renderBullet: (index, className) => `<li class="${className}"></li>`,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 32 },
      1440: { slidesPerView: 3, spaceBetween: 32 },
    },
  });
}

initFeedbackSection();
