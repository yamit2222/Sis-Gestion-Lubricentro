import axios from './root.service.js';

export const getSubProductos = async (pagina = 1, limite = 10) => {
  try {
    const response = await axios.get(`/subproductos?pagina=${pagina}&limite=${limite}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Función auxiliar para obtener todos los subproductos (sin paginación)
export const getAllSubProductos = async () => {
  try {
    const response = await axios.get('/subproductos?limite=1000'); // Límite alto para obtener todos
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createSubProducto = async (subproductoData) => {
  try {
    const response = await axios.post('/subproductos', subproductoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSubProducto = async (id, subproductoData) => {
  try {
    const response = await axios.put(`/subproductos/${id}`, subproductoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteSubProducto = async (id) => {
  try {
    const response = await axios.delete(`/subproductos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const importarSubproductosExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('excel', file);
    
    const response = await axios.post('/subproductos/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
