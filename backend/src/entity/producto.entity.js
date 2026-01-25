import { DataTypes } from "sequelize";
import { sequelize } from "../config/configDb.js";

export const Producto = sequelize.define("Producto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },  
  codigoP: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING
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
    allowNull: false,
  },
  categoria: {
    type: DataTypes.ENUM('aceite', 'filtro', 'bateria'),
    allowNull: false
  },
  subcategoria: {
    type: DataTypes.ENUM("auto", "camioneta", "vehiculo comercial", "motocicleta", "maquinaria"),
    allowNull: false
  }
}, {
  // Configuración de índices para mejorar rendimiento
  indexes: [
    // Índice para búsquedas por categoría (muy común en lubricentro)
    {
      name: 'idx_producto_categoria',
      fields: ['categoria']
    },
    // Índice para búsquedas por marca
    {
      name: 'idx_producto_marca', 
      fields: ['marca']
    },
    // Índice único para código de producto (debe ser único)
    {
      name: 'idx_producto_codigo_unique',
      unique: true,
      fields: ['codigoP']
    },
    // Índice compuesto para búsquedas combinadas categoria + subcategoria
    {
      name: 'idx_producto_categoria_subcategoria',
      fields: ['categoria', 'subcategoria']
    },
    // Índice para ordenar por stock (útil para alertas de stock bajo)
    {
      name: 'idx_producto_stock',
      fields: ['stock']
    },
    // Índice para búsquedas por nombre (búsquedas de productos)
    {
      name: 'idx_producto_nombre',
      fields: ['nombre']
    }
  ]
});
