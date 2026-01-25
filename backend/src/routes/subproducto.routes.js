import { Router } from "express";
import { subproductoController } from "../controllers/subproducto.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadExcel } from "../middlewares/upload.middleware.js";

const router = Router();
router.use(authenticateJwt);

router.post("/", subproductoController.crearSubproducto);
router.post("/importar-excel", uploadExcel.single('excel'), subproductoController.importarSubproductosExcel);
router.get("/", subproductoController.obtenerSubproductos);
router.get("/:id", subproductoController.obtenerSubproductoPorId);
router.put("/:id", subproductoController.modificarSubproducto);
router.delete("/:id", subproductoController.eliminarSubproducto);

export default router;
