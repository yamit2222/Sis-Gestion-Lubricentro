import { MovimientoStock } from "../entity/movimientoStock.entity.js";
import { Producto } from "../entity/producto.entity.js";
import { SubProducto } from "../entity/subproducto.entity.js";
import User from "../entity/user.entity.js";
import { sequelize } from "../config/configDb.js";

export const movimientoStockService = {
  async registrarMovimiento(dataMovimiento, externalTransaction = null) {
    const transaction = externalTransaction || await sequelize.transaction();
    
    try {
      // Soporte para formato nuevo (itemId/itemType) y formato antiguo (productoId)
      const { itemId, itemType, productoId, tipo, cantidad, observacion, usuarioId } = dataMovimiento;
      
      let item;
      let ItemModel;
      let actualItemId = itemId;
      let actualItemType = itemType;
      
      // Compatibilidad con formato antiguo
      if (productoId && !itemId) {
        actualItemId = productoId;
        actualItemType = 'producto';
      }
      
      // Determinar el modelo y buscar el item
      if (actualItemType === 'producto') {
        ItemModel = Producto;
      } else if (actualItemType === 'subproducto') {
        ItemModel = SubProducto;
      } else {
        const error = new Error("Tipo de item inválido. Debe ser 'producto' o 'subproducto'");
        error.statusCode = 400;
        throw error;
      }

      item = await ItemModel.findByPk(actualItemId, { transaction });
      if (!item) {
        const error = new Error(`${actualItemType === 'producto' ? 'Producto' : 'SubProducto'} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      let nuevoStock = item.stock;
      if (tipo === 'entrada') {
        nuevoStock += cantidad;
      } else if (tipo === 'salida') {
        if (item.stock < cantidad) {
          const error = new Error("Stock insuficiente para realizar la salida");
          error.statusCode = 400;
          throw error;
        }
        nuevoStock -= cantidad;
      } else {
        const error = new Error("Tipo de movimiento inválido. Debe ser 'entrada' o 'salida'");
        error.statusCode = 400;
        throw error;
      }

      const fecha = new Date().toLocaleDateString('es-ES');
      const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const movimientoData = {
        itemId: actualItemId,
        itemType: actualItemType,
        tipo,
        cantidad,
        observacion,
        usuarioId,
        fecha,
        hora
      };
      
      // Mantener compatibilidad con formato antiguo
      if (productoId && !itemId) {
        movimientoData.productoId = productoId;
      }

      const movimiento = await MovimientoStock.create(movimientoData, { transaction });

      await item.update({ stock: nuevoStock }, { transaction });

      if (!externalTransaction) {
        await transaction.commit();
      }
      return movimiento;

    } catch (error) {
      if (!externalTransaction) {
        await transaction.rollback();
      }
      throw error;
    }
  },

  async obtenerMovimientos() {
    const movimientos = await MovimientoStock.findAll({
      include: [
        {
          model: Producto,
          as: 'ProductoItem',
          attributes: ['id', 'nombre', 'codigoP', 'categoria'],
          required: false
        },
        {
          model: SubProducto,
          as: 'SubProductoItem',
          attributes: ['id', 'nombre', 'codigosubP', 'categoria'],
          required: false
        },
        // Mantener compatibilidad con relación antigua
        {
          model: Producto,
          as: 'Producto',
          attributes: ['id', 'nombre', 'codigoP', 'categoria'],
          required: false
        },
        {
          model: User,
          as: 'Usuario',
          attributes: ['id', 'nombreCompleto', 'email'],
          required: true
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Procesar los resultados para agregar información del item
    const movimientosConItems = movimientos.map(movimiento => {
      const movimientoJson = movimiento.toJSON();
      
      // Determinar el item según el tipo
      if (movimientoJson.itemType === 'producto' && movimientoJson.ProductoItem) {
        movimientoJson.item = {
          ...movimientoJson.ProductoItem,
          tipo: 'producto'
        };
      } else if (movimientoJson.itemType === 'subproducto' && movimientoJson.SubProductoItem) {
        movimientoJson.item = {
          ...movimientoJson.SubProductoItem,
          tipo: 'subproducto'
        };
      } else if (movimientoJson.Producto && !movimientoJson.itemType) {
        // Compatibilidad con registros antiguos
        movimientoJson.item = {
          ...movimientoJson.Producto,
          tipo: 'producto'
        };
      }
      
      return movimientoJson;
    });

    return movimientosConItems;
  },

  async obtenerMovimientosPorProducto(productoId) {
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Buscar tanto en formato nuevo como antiguo
    const movimientos = await MovimientoStock.findAll({
      where: {
        [sequelize.Op.or]: [
          { productoId }, // Formato antiguo
          { itemId: productoId, itemType: 'producto' } // Formato nuevo
        ]
      },
      include: [{ 
        model: Producto,
        as: 'Producto',
        attributes: ['id', 'nombre', 'codigoP']
      }],
      order: [['createdAt', 'DESC']]
    });

    return movimientos;
  },

  async obtenerMovimientosPorItem(itemId, itemType) {
    const ItemModel = itemType === 'producto' ? Producto : SubProducto;
    
    const item = await ItemModel.findByPk(itemId);
    if (!item) {
      const error = new Error(`${itemType === 'producto' ? 'Producto' : 'SubProducto'} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const movimientos = await MovimientoStock.findAll({
      where: { itemId, itemType },
      include: [
        {
          model: Producto,
          as: 'ProductoItem',
          attributes: ['id', 'nombre', 'codigoP', 'categoria'],
          required: false
        },
        {
          model: SubProducto,
          as: 'SubProductoItem',
          attributes: ['id', 'nombre', 'codigosubP', 'categoria'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return movimientos;
  }
};
