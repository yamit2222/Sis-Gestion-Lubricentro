"use strict";
import { vehiculoService } from "../services/vehiculo.service.js";
import {handleErrorClient,handleErrorServer,handleSuccess} from "../handlers/responseHandlers.js";
import { vehiculoValidation } from "../validations/vehiculo.validation.js";

export const vehiculoController = {
  async crearVehiculo(req, res) {
    try {
      const data = req.body;

      const { error } = vehiculoValidation().validate(data, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          const field = err.path[0];
          if (!errors[field]) errors[field] = err.message;
        });
        return handleErrorClient(res, 400, "Error de validación", errors);
      }

      const vehiculo = await vehiculoService.crearVehiculo(data);
      handleSuccess(res, 201, "vehiculo habitual creado correctamente", vehiculo);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async obtenerVehiculos(req, res) {
    try {
      const vehiculos = await vehiculoService.obtenerVehiculos();
      handleSuccess(res, 200, "Vehículos obtenidos correctamente", vehiculos);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },
  async obtenerVehiculoPorId(req, res) {
    try {
      const { id } = req.params;
      const vehiculo = await vehiculoService.obtenerVehiculoPorId(id);
      handleSuccess(res, 200, "vehiculo habitual obtenido correctamente", vehiculo);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async modificarVehiculo(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const { error } = vehiculoValidation().validate(data, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          const field = err.path[0];
          if (!errors[field]) errors[field] = err.message;
        });
        return handleErrorClient(res, 400, "Error de validación", errors);
      }

      const vehiculo = await vehiculoService.modificarVehiculo(id, data);
      handleSuccess(res, 200, "Vehículo actualizado correctamente", vehiculo);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async eliminarVehiculo(req, res) {
    try {
      const { id } = req.params;
      await vehiculoService.eliminarVehiculo(id);
      handleSuccess(res, 200, "vehiculo habitual eliminado correctamente");
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  }
};
