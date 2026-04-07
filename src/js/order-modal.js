import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const refs = {
  openBtns: document.querySelectorAll('[data-order-modal-open]'),
  closeBtn: document.querySelector('[data-order-modal-close]'),
  backdrop: document.querySelector('[data-order-modal]'),
  form: document.querySelector('.order-form'),
  nameInput: document.querySelector('#user-name'),
  phoneInput: document.querySelector('#user-phone'),
  orderTitle: document.querySelector('#order-title'),
};

if (refs.form) {
  refs.form.setAttribute('novalidate', '');
}

const NAME_REGEX = /^[\p{L}\s'-]+$/u;
let currentProductId = '';
let lastFocusedElement = null;

function toggleModal() {
  if (!refs.backdrop) return;

  const isHidden = refs.backdrop.classList.contains('is-hidden');

  if (isHidden) {
    lastFocusedElement = document.activeElement;
    refs.backdrop.classList.remove('is-hidden');
    document.body.classList.add('no-scroll');
    refs.orderTitle?.setAttribute('tabindex', '-1');
    refs.orderTitle?.focus();
    return;
  }

  refs.backdrop.classList.add('is-hidden');
  document.body.classList.remove('no-scroll');

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

refs.openBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const productId = btn.getAttribute('data-id');
    if (productId) {
      currentProductId = productId;
      window.currentOrderProductId = productId;
    }
    toggleModal();
  });
});

refs.closeBtn?.addEventListener('click', toggleModal);

refs.backdrop?.addEventListener('click', e => {
  if (e.target === refs.backdrop) {
    toggleModal();
  }
});

document.addEventListener('keydown', e => {
  if (!refs.backdrop || refs.backdrop.classList.contains('is-hidden')) return;
  if (e.key === 'Escape') {
    toggleModal();
  }
});

function showError(input, message) {
  const error = input.parentElement.querySelector('.error-text');
  input.classList.add('error');

  if (error) {
    error.textContent = message;
    error.style.display = 'block';
  }
}

function hideError(input) {
  const error = input.parentElement.querySelector('.error-text');
  input.classList.remove('error');

  if (error) {
    error.style.display = 'none';
  }
}

refs.nameInput?.addEventListener('input', e => {
  const input = e.target;
  const value = input.value.trim();

  if (value.length > 0 && !NAME_REGEX.test(value)) {
    showError(input, 'Тільки букви');
    return;
  }

  if (value.length >= 2 && NAME_REGEX.test(value)) {
    hideError(input);
  }
});

refs.nameInput?.addEventListener('blur', e => {
  const input = e.target;
  const value = input.value.trim();

  if (value.length > 0 && value.length < 2) {
    showError(input, 'Мінімум 2 букви');
  }
});

refs.phoneInput?.addEventListener('input', e => {
  const input = e.target;
  input.value = input.value.replace(/\D/g, '');
  const value = input.value;

  if (value.length === 12 && value.startsWith('380')) {
    hideError(input);
  }
});

refs.phoneInput?.addEventListener('blur', e => {
  const input = e.target;
  const value = input.value;

  if (value.length > 0 && (value.length !== 12 || !value.startsWith('380'))) {
    showError(input, 'Введіть 12 цифр (380...)');
  }
});

refs.form?.addEventListener('submit', async e => {
  e.preventDefault();

  const nameValue = refs.nameInput.value.trim();
  const phoneValue = refs.phoneInput.value.trim();
  const userComment = e.currentTarget.elements.userComment.value.trim();

  let hasError = false;

  if (nameValue.length < 2 || !NAME_REGEX.test(nameValue)) {
    showError(refs.nameInput, 'Мінімум 2 букви');
    hasError = true;
  } else {
    hideError(refs.nameInput);
  }

  const normalizedPhone = phoneValue.replace(/\D/g, '');
  if (normalizedPhone.length !== 12 || !normalizedPhone.startsWith('380')) {
    showError(refs.phoneInput, 'Введіть 12 цифр (380...)');
    hasError = true;
  } else {
    hideError(refs.phoneInput);
  }

  if (hasError) {
    iziToast.error({
      title: 'Помилка',
      message: 'Заповніть поля коректно',
      position: 'topRight',
    });
    return;
  }

  const modelId = currentProductId || window.currentOrderProductId || '';

  if (!modelId) {
    iziToast.error({
      title: 'Помилка',
      message: 'Не вдалося визначити товар для замовлення',
      position: 'topRight',
    });
    return;
  }

  const payload = {
    name: nameValue,
    phone: normalizedPhone,
    modelId,
    color: window.currentOrderColor || '#1212ca',
    comment:
      userComment.length >= 5
        ? userComment
        : "Чекатиму на зворотний зв'язок",
  };

  try {
    const response = await fetch('https://furniture-store-v2.b.goit.study/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const orderData = await response.json();

    if (!response.ok) {
      throw new Error(orderData.message || 'Помилка сервера');
    }

    iziToast.success({
      title: 'Успіх',
      message: `Ви замовили ${orderData.model}, номер вашого замовлення: ${orderData.orderNum}`,
      position: 'topRight',
      timeout: 5000,
    });

    e.target.reset();
    toggleModal();
  } catch (error) {
    iziToast.error({
      title: 'Помилка',
      message: error.message,
      position: 'topRight',
    });
  }
});
