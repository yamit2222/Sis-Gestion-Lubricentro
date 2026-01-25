import { DataTypes } from "sequelize";
import { sequelize } from "../config/configDb.js";

export const SubProducto = sequelize.define("SubProducto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },   
  codigosubP: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },  precio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.ENUM("repuestos", "limpieza", "accesorios externos", "accesorios eléctricos"),
    allowNull: false
  }
}, {
  // Configuración de índices para mejorar rendimiento
  indexes: [
    // Índice para búsquedas por categoría
    {
      name: 'idx_subproducto_categoria',
      fields: ['categoria']
    },
    // Índice para búsquedas por marca
    {
      name: 'idx_subproducto_marca',
      fields: ['marca']
    },
    // Índice único para código de subproducto
    {
      name: 'idx_subproducto_codigo_unique',
      unique: true,
      fields: ['codigosubP']
    },
    // Índice para stock (alertas de stock bajo)
    {
      name: 'idx_subproducto_stock',
      fields: ['stock']
    },
    // Índice para búsquedas por nombre
    {
      name: 'idx_subproducto_nombre',
      fields: ['nombre']
    }
  ]
});
