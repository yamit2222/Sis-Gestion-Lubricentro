import { Router } from "express";
import { pedidoController } from "../controllers/pedido.controller.js";
import { Pedido } from "../entity/pedido.entity.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();
router.use(authenticateJwt);

router.get("/", pedidoController.obtenerPedidos);
router.post("/", pedidoController.crearPedido);
router.get("/:id", pedidoController.obtenerPedidoPorId);
router.put("/:id", pedidoController.actualizarPedido);
router.patch("/:id/estado", pedidoController.actualizarEstadoPedido);
router.delete("/:id", pedidoController.eliminarPedido);

export default router;
