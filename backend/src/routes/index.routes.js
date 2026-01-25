"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import productoRoutes from "./producto.routes.js";
import subproductoRoutes from "./subproducto.routes.js";
import vehiculoRoutes from "./vehiculo.routes.js";
import movimientoStockRoutes from './movimientoStock.routes.js';
import pedidoRoutes from "./pedido.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/productos", productoRoutes)
    .use("/subproductos", subproductoRoutes)
    .use("/vehiculos", vehiculoRoutes)
    .use("/movimientos", movimientoStockRoutes)
    .use("/pedidos", pedidoRoutes);

export default router;