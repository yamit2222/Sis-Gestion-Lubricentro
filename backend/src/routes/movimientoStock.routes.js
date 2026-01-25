import { Router } from 'express';
import { 
  registrarMovimiento, 
  listarMovimientos, 
  obtenerMovimientosPorProducto,
  obtenerMovimientosPorItem
} from '../controllers/movimientoStock.controller.js';
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();
router.use(authenticateJwt);

router.post('/', registrarMovimiento);
router.get('/', listarMovimientos);
router.get('/producto/:productoId', obtenerMovimientosPorProducto);
router.get('/item/:itemType/:itemId', obtenerMovimientosPorItem);

export default router;
