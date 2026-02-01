"use strict";

import express, { json, urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import indexRoutes from "./routes/index.routes.js";
import { cookieKey } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { createUsers } from "./config/initialSetup.js";
import { passportJwtSetup } from "./auth/passport.auth.js";

async function setupServer() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      credentials: true,
      origin: ["https://lubricentros.up.railway.app", "http://localhost:5173"],
    })
  );

  app.use(
    urlencoded({
      extended: true,
      limit: "1mb",
    })
  );

  app.use(
    json({
      limit: "1mb",
    })
  );

  app.use(cookieParser());
  app.use(morgan("dev"));

  
  // Solo usar JWT, que ya tienes configurado
  /*
  app.use(
    session({
      secret: cookieKey,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      },
      // Configuración para producción
      name: 'sessionId', // Cambiar nombre de cookie por seguridad
      store: undefined, // Usar store por defecto pero configurado correctamente
    })
  );
  */

  // app.use(passport.initialize());
  // app.use(passport.session());

  
  app.use(passport.initialize());

  passportJwtSetup();


  app.get("/", (req, res) => {
    res.json({ status: "API OK " });
  });

  app.use("/api", indexRoutes);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(` Servidor corriendo en puerto ${PORT}`);
    console.log(` Endpoints disponibles:`);
    console.log(` - /api/auth`);
    console.log(` - /api/user`);
    console.log(` - /api/productos`);
    console.log(` - /api/subproductos`);
    console.log(` - /api/vehiculos`);
    console.log(` - /api/movimientos`);
    console.log(` - /api/pedidos`);
  });
}

async function setupAPI() {
  try {
    await connectDB();
    await setupServer();
    await createUsers();
  } catch (error) {
    console.error(" Error al iniciar la API:", error);
    process.exit(1);
  }
}

setupAPI()
  .then(() => console.log(" API iniciada correctamente"))
  .catch((error) =>
    console.error(" Error al iniciar la API:", error)
  );
