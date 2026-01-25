import { DataTypes } from "sequelize";
import { sequelize } from "../config/configDb.js";

export const Vehiculo = sequelize.define("Vehiculo", {
  Marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },  Año: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Filtro_de_aire: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Filtro_de_aceite: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Filtro_de_combustible: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Bateria: {
    type: DataTypes.STRING
  },
  Posicion:{
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Configuración de índices para mejorar rendimiento
  indexes: [
    // Índice para búsquedas por marca
    {
      name: 'idx_vehiculo_marca',
      fields: ['Marca']
    },
    // Índice para búsquedas por modelo
    {
      name: 'idx_vehiculo_modelo',
      fields: ['Modelo']
    },
    // Índice para búsquedas por año
    {
      name: 'idx_vehiculo_año',
      fields: ['Año']
    },
    // Índice compuesto para búsquedas marca + modelo (muy común)
    {
      name: 'idx_vehiculo_marca_modelo',
      fields: ['Marca', 'Modelo']
    },
    // Índice compuesto marca + modelo + año (búsqueda exacta)
    {
      name: 'idx_vehiculo_marca_modelo_año',
      fields: ['Marca', 'Modelo', 'Año']
    }
  ]
});
