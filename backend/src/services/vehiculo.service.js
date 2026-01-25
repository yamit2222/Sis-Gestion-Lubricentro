import { Vehiculo } from "../entity/vehiculo.entity.js";

export const vehiculoService = {
  async crearVehiculo(data) {
    const nuevo = await Vehiculo.create(data);
    return nuevo;
  },

  async obtenerVehiculos() {
    const vehiculos = await Vehiculo.findAll();
    return vehiculos;
  },

  async obtenerVehiculoPorId(id) {
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      const error = new Error("Vehículo no encontrado");
      error.statusCode = 404;
      throw error;
    }
    return vehiculo;
  },

  async modificarVehiculo(id, data) {
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      const error = new Error("Vehículo no encontrado");
      error.statusCode = 404;
      throw error;
    }
    await vehiculo.update(data);
    return vehiculo;
  },

  async eliminarVehiculo(id) {
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      const error = new Error("Vehículo no encontrado");
      error.statusCode = 404;
      throw error;
    }
    await vehiculo.destroy();
    return true;
  },
};


