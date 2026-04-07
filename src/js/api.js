import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

axios.defaults.baseURL = 'https://furniture-store-v2.b.goit.study/api';

function showApiError(message) {
  iziToast.show({
    message,
    color: 'red',
    position: 'topRight',
  });
}

export async function getCategories() {
  try {
    const { data } = await axios.get('/categories');
    return data;
  } catch (error) {
    showApiError(`Помилка завантаження категорій: ${error.message}`);
    return [];
  }
}

export async function getFurniture(page = 1, id = null) {
  try {
    const params = { page, limit: 8 };
    if (id) params.category = id;

    const { data } = await axios.get('/furnitures', { params });
    return data;
  } catch (error) {
    showApiError(`Помилка завантаження товарів: ${error.message}`);
    return { furnitures: [], totalItems: 0, totalPages: 0 };
  }
}

export async function getFurnitureById(id) {
  try {
    const { data } = await axios.get(`/furnitures/${id}`);
    return data;
  } catch (error) {
    showApiError(`Помилка завантаження деталей товару: ${error.message}`);
    return null;
  }
}
