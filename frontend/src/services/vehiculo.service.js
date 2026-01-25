import axios from "./root.service.js";

const API_URL = import.meta.env.VITE_BASE_URL;

export const vehiculoService = {
  crear: async (vehiculo) => {
    try {
      const response = await axios.post("/vehiculos", vehiculo);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  obtenerTodos: async () => {
    try {
      const response = await axios.get("/vehiculos");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await axios.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  actualizar: async (id, vehiculo) => {
    try {
      const response = await axios.put(`/vehiculos/${id}`, vehiculo);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  eliminar: async (id) => {
    try {
      const response = await axios.delete(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
