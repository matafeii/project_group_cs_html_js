// запити
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

axios.defaults.baseURL = 'https://furniture-store-v2.b.goit.study/api';

export async function getCategories() {
  try {
    const { data } = await axios.get('/categories');
    return data;
  } catch (error) {
    iziToast.show({
        message: `Помилка при завантажені категорій: ${error}`,
        color: 'red',
        position: 'topRight',
    });
    return [];
  }
}

export async function getFurniture(page = 1, id = null) {
  try {
    let params = { page, limit: 8 };
    if (id) params.category = id;
    const { data } = await axios.get('/furnitures', { params });
    return data;
  } catch (error) {
    iziToast.show({
        message: `Помилка при завантажені товарів: ${error}`,
        color: 'red',
        position: 'topRight',
    });
    return { results: [], totalPages: 0 };
  }
}

export async function getFurnitureById(id) {
  try {
    const { data } = await axios.get(`/furnitures/${id}`);
    return data;
  } catch (error) {
    console.error('API Error:', error.response?.status, error.message);
    iziToast.show({
        message: `Помилка при завантажені деталей товару: ${error}`,
        color: 'red',
        position: 'topRight',
    });
    return null;
  }
}