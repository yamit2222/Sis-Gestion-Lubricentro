import { Router } from "express";
import { vehiculoController } from "../controllers/vehiculo.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();
router.use(authenticateJwt);

router.post("/", vehiculoController.crearVehiculo);
router.get("/", vehiculoController.obtenerVehiculos);
router.get("/:id", vehiculoController.obtenerVehiculoPorId);
router.put("/:id", vehiculoController.modificarVehiculo);
router.delete("/:id", vehiculoController.eliminarVehiculo);

export default router;
