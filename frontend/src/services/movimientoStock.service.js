import axios from './root.service.js';

export const getMovimientos = async () => {
  try {
    const response = await axios.get('/movimientos');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createMovimiento = async (movimientoData) => {
  try {
    const response = await axios.post('/movimientos', movimientoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
