import { pedidoService } from "../services/pedido.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { pedidoValidation } from "../validations/pedido.validation.js";

export const pedidoController = {
  async obtenerPedidos(req, res) {
    try {
      const pedidos = await pedidoService.obtenerPedidos();
      handleSuccess(res, 200, "Pedidos obtenidos", pedidos);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async crearPedido(req, res) {
    try {
      const { error, value } = pedidoValidation.crearPedido.validate(req.body);
      if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
      }

      // Agregar el ID del usuario del token JWT
      const dataPedido = {
        ...value,
        usuarioId: req.user.id
      };

      const pedido = await pedidoService.crearPedido(dataPedido);
      handleSuccess(res, 201, "Pedido creado", pedido);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 400 && statusCode < 500) {
        return handleErrorClient(res, statusCode, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async obtenerPedidoPorId(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.obtenerPedidoPorId(id);
      handleSuccess(res, 200, "Pedido obtenido", pedido);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async actualizarPedido(req, res) {
    try {
      // IMPORTANTE: Este endpoint (PUT) debe usarse solo para cambios de producto/cantidad
      // Para cambios ÚNICAMENTE de estado, usar PATCH /:id/estado
      
      // Adapter temporal: convertir formato antiguo a nuevo para actualizaciones
      let requestData = { ...req.body };
      if (requestData.itemId && requestData.itemType) {
        if (requestData.itemType === 'producto') {
          requestData.productoId = requestData.itemId;
          delete requestData.itemId;
          delete requestData.itemType;
        } else if (requestData.itemType === 'subproducto') {
          requestData.subproductoId = requestData.itemId;
          delete requestData.itemId;
          delete requestData.itemType;
        }
      }

      const { error, value } = pedidoValidation.actualizarPedido.validate(requestData);
      if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
      }
      
      const { id } = req.params;
      const pedido = await pedidoService.actualizarPedido(id, value, req.user.id);
      handleSuccess(res, 200, "Pedido actualizado", pedido);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 400 && statusCode < 500) {
        return handleErrorClient(res, statusCode, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async actualizarEstadoPedido(req, res) {
    try {
      // IMPORTANTE: Este endpoint (PATCH) debe usarse ÚNICAMENTE para cambios de estado
      // No afecta stock a menos que se cancele/reactive un pedido
      
      const { error, value } = pedidoValidation.actualizarEstadoPedido.validate(req.body);
      if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
      }
      
      const { id } = req.params;
      const pedido = await pedidoService.actualizarEstadoPedido(id, value, req.user.id);
      handleSuccess(res, 200, "Estado del pedido actualizado", pedido);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 400 && statusCode < 500) {
        return handleErrorClient(res, statusCode, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async eliminarPedido(req, res) {
    try {
      const { id } = req.params;
      await pedidoService.eliminarPedido(id, req.user.id);
      handleSuccess(res, 200, "Pedido eliminado", null);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  }
};
