import axios from "./root.service.js";

export const getPedidos = async (pagina = 1, limite = 10) => {
  try {
    const response = await axios.get(`/pedidos?pagina=${pagina}&limite=${limite}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPedido = async (pedidoData) => {
  try {
    const response = await axios.post('/pedidos', pedidoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPedidoById = async (id) => {
  try {
    const response = await axios.get(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePedido = async (id, pedidoData) => {
  try {
    const response = await axios.put(`/pedidos/${id}`, pedidoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePedidoEstado = async (id, estado) => {
  try {
    const response = await axios.patch(`/pedidos/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePedido = async (id) => {
  try {
    const response = await axios.delete(`/pedidos/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
