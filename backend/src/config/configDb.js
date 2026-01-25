"use strict";
import { Sequelize } from "sequelize";
import { 
  DB_HOST, 
  DB_PORT,
  DB_USERNAME, 
  DB_PASSWORD, 
  DATABASE,
  NODE_ENV
} from "./configEnv.js";


export const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: {
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    retry: {
      max: 10,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /SequelizeConnectionAcquireTimeoutError/
      ]
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Conexión exitosa a la base de datos!");

    // Sincronizar modelos con manejo mejorado
    await sequelize.sync({ alter: NODE_ENV === 'development' });
    console.log("Modelos sincronizados con la base de datos");

    return sequelize;
  } catch (error) {
    console.error("Error al conectar con la base de datos");
    console.error("Detalles del error:", error.message);
    if (NODE_ENV === 'development') {
      console.error("Stack completo:", error.stack);
    }
    // Lanzar error en lugar de process.exit para mejor manejo
    throw error;
  }
}
