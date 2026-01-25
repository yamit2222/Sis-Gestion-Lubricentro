import { Pedido } from "../entity/pedido.entity.js";
import { Producto } from "../entity/producto.entity.js";
import { SubProducto } from "../entity/subproducto.entity.js";
import User from "../entity/user.entity.js";
import { Op } from "sequelize";
import { sequelize } from "../config/configDb.js";
import { movimientoStockService } from "./movimientoStock.service.js";

export const pedidoService = {
  async obtenerPedidos() {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Producto,
          as: 'Producto',
          attributes: ['id', 'nombre', 'precio', 'stock'],
          required: false
        },
        {
          model: SubProducto,
          as: 'SubProducto', 
          attributes: ['id', 'nombre', 'precio', 'stock'],
          required: false
        },
        {
          model: User,
          as: 'Usuario',
          attributes: ['id', 'nombreCompleto', 'email'],
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    
    return pedidos;
  },

  async crearPedido(dataPedido) {
    const transaction = await sequelize.transaction();
    
    try {
      const { comentario, productoId, subproductoId, cantidad, estado, usuarioId } = dataPedido;
      
      if (!comentario || !cantidad || !usuarioId) {
        const error = new Error("Campos obligatorios: comentario, cantidad, usuarioId");
        error.statusCode = 400;
        throw error;
      }

      // Validar que solo uno de los IDs esté presente
      if ((!productoId && !subproductoId) || (productoId && subproductoId)) {
        const error = new Error("Debe especificar exactamente un producto o un subproducto");
        error.statusCode = 400;
        throw error;
      }

      // Buscar el item según el ID proporcionado
      let item, itemId, itemType;
      if (productoId) {
        item = await Producto.findByPk(productoId, { transaction });
        if (!item) {
          const error = new Error("Producto no encontrado");
          error.statusCode = 404;
          throw error;
        }
        itemId = productoId;
        itemType = 'producto';
      } else {
        item = await SubProducto.findByPk(subproductoId, { transaction });
        if (!item) {
          const error = new Error("SubProducto no encontrado");
          error.statusCode = 404;
          throw error;
        }
        itemId = subproductoId;
        itemType = 'subproducto';
      }

      if (item.stock < cantidad) {
        const error = new Error("Stock insuficiente");
        error.statusCode = 400;
        throw error;
      }

      // Registrar movimiento de stock (salida por pedido) - esto también actualiza el stock
      await movimientoStockService.registrarMovimiento({
        itemId,
        itemType,
        tipo: 'salida',
        cantidad,
        observacion: `Pedido: ${comentario}`,
        usuarioId
      }, transaction);

      const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = new Date().toTimeString().split(' ')[0]; // HH:mm:ss
      const pedido = await Pedido.create({ 
        comentario,
        productoId: productoId || null,
        subproductoId: subproductoId || null,
        cantidad, 
        fecha,
        hora, 
        estado: estado || 'en proceso',
        usuarioId
      }, { transaction });

      await transaction.commit();
      return pedido;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async obtenerPedidoPorId(id) {
    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: Producto,
          as: 'Producto',
          attributes: ['id', 'nombre', 'precio', 'stock'],
          required: false
        },
        {
          model: SubProducto,
          as: 'SubProducto',
          attributes: ['id', 'nombre', 'precio', 'stock'],
          required: false
        }
      ]
    });
    
    if (!pedido) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      throw error;
    }
    
    return pedido;
  },
  async actualizarPedido(id, dataPedido, usuarioId) {
    const transaction = await sequelize.transaction();
    
    try {
      const pedido = await Pedido.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido no encontrado");
        error.statusCode = 404;
        throw error;
      }

      // Si SOLO se está actualizando el estado, usar el método específico
      const soloEstado = Object.keys(dataPedido).length === 1 && dataPedido.estado !== undefined;
      if (soloEstado) {
        await pedido.update({ estado: dataPedido.estado }, { transaction });
        await transaction.commit();
        return pedido;
      }

      // Si se está actualizando el item o la cantidad, manejar el stock
      const haycambiosEnStock = (dataPedido.productoId && dataPedido.productoId !== pedido.productoId) ||
                                (dataPedido.subproductoId && dataPedido.subproductoId !== pedido.subproductoId) ||
                                (dataPedido.cantidad && dataPedido.cantidad !== pedido.cantidad);
      
      if (haycambiosEnStock && (dataPedido.productoId || dataPedido.subproductoId) && dataPedido.cantidad) {
        const nuevoProductoId = dataPedido.productoId;
        const nuevoSubproductoId = dataPedido.subproductoId;
        
        // Validar que solo uno esté presente
        if ((!nuevoProductoId && !nuevoSubproductoId) || (nuevoProductoId && nuevoSubproductoId)) {
          const error = new Error("Debe especificar exactamente un producto o un subproducto");
          error.statusCode = 400;
          throw error;
        }

        // Buscar nuevo item
        let nuevoItem, nuevoItemId, nuevoItemType;
        if (nuevoProductoId) {
          nuevoItem = await Producto.findByPk(nuevoProductoId, { transaction });
          if (!nuevoItem) {
            const error = new Error("Producto no encontrado");
            error.statusCode = 404;
            throw error;
          }
          nuevoItemId = nuevoProductoId;
          nuevoItemType = 'producto';
        } else {
          nuevoItem = await SubProducto.findByPk(nuevoSubproductoId, { transaction });
          if (!nuevoItem) {
            const error = new Error("SubProducto no encontrado");
            error.statusCode = 404;
            throw error;
          }
          nuevoItemId = nuevoSubproductoId;
          nuevoItemType = 'subproducto';
        }

        // Si cambió el item, restaurar stock del item anterior
        if (pedido.productoId !== nuevoProductoId || pedido.subproductoId !== nuevoSubproductoId) {
          let itemAnterior, itemAnteriorId, itemAnteriorType;
          if (pedido.productoId) {
            itemAnterior = await Producto.findByPk(pedido.productoId, { transaction });
            itemAnteriorId = pedido.productoId;
            itemAnteriorType = 'producto';
          } else {
            itemAnterior = await SubProducto.findByPk(pedido.subproductoId, { transaction });
            itemAnteriorId = pedido.subproductoId;
            itemAnteriorType = 'subproducto';
          }
          
          if (itemAnterior) {
            // Registrar movimiento de entrada (restauración) - esto también actualiza el stock
            await movimientoStockService.registrarMovimiento({
              itemId: itemAnteriorId,
              itemType: itemAnteriorType,
              tipo: 'entrada',
              cantidad: pedido.cantidad,
              observacion: `Actualización pedido: Restauración por cambio de item`,
              usuarioId
            }, transaction);
          }
          
          // Verificar stock del nuevo item
          if (nuevoItem.stock < dataPedido.cantidad) {
            const error = new Error("Stock insuficiente");
            error.statusCode = 400;
            throw error;
          }
          
          // Registrar movimiento de salida (nuevo item) - esto también actualiza el stock
          await movimientoStockService.registrarMovimiento({
            itemId: nuevoItemId,
            itemType: nuevoItemType,
            tipo: 'salida',
            cantidad: dataPedido.cantidad,
            observacion: `Actualización pedido: ${dataPedido.comentario}`,
            usuarioId
          }, transaction);
        } else {
          // Mismo item, verificar si cambió la cantidad
          const diferenciaCantidad = dataPedido.cantidad - pedido.cantidad;
          if (diferenciaCantidad !== 0) {
            if (diferenciaCantidad > 0) {
              // Aumentó la cantidad - verificar stock
              if (nuevoItem.stock < diferenciaCantidad) {
                const error = new Error("Stock insuficiente");
                error.statusCode = 400;
                throw error;
              }
              
              // Registrar movimiento de salida (aumento cantidad) - esto también actualiza el stock
              await movimientoStockService.registrarMovimiento({
                itemId: nuevoItemId,
                itemType: nuevoItemType,
                tipo: 'salida',
                cantidad: diferenciaCantidad,
                observacion: `Actualización pedido: Aumento cantidad`,
                usuarioId
              }, transaction);
            } else {
              // Disminuyó la cantidad - devolver stock mediante movimiento de entrada
              await movimientoStockService.registrarMovimiento({
                itemId: nuevoItemId,
                itemType: nuevoItemType,
                tipo: 'entrada',
                cantidad: Math.abs(diferenciaCantidad),
                observacion: `Actualización pedido: Disminución cantidad`,
                usuarioId
              }, transaction);
            }
          }
        }
      }

      await pedido.update(dataPedido, { transaction });

      await transaction.commit();
      return pedido;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async actualizarEstadoPedido(id, { estado }, usuarioId = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const pedido = await Pedido.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido no encontrado");
        error.statusCode = 404;
        throw error;
      }

      const estadoAnterior = pedido.estado;
      
      // Si se cancela un pedido que no estaba cancelado, restaurar stock
      if (estado === 'cancelado' && estadoAnterior !== 'cancelado') {
        let item, itemId, itemType;
        if (pedido.productoId) {
          item = await Producto.findByPk(pedido.productoId, { transaction });
          itemId = pedido.productoId;
          itemType = 'producto';
        } else if (pedido.subproductoId) {
          item = await SubProducto.findByPk(pedido.subproductoId, { transaction });
          itemId = pedido.subproductoId;
          itemType = 'subproducto';
        }
        
        if (item) {
          // Registrar movimiento de entrada (restauración por cancelación) - esto también actualiza el stock
          await movimientoStockService.registrarMovimiento({
            itemId,
            itemType,
            tipo: 'entrada',
            cantidad: pedido.cantidad,
            observacion: `Cancelación pedido: ${pedido.comentario}`,
            usuarioId: usuarioId || 1 // Usuario del sistema si no se especifica
          }, transaction);
        }
      }
      
      // Si se reactiva un pedido cancelado, volver a descontar stock
      if (estadoAnterior === 'cancelado' && estado !== 'cancelado') {
        let item, itemId, itemType;
        if (pedido.productoId) {
          item = await Producto.findByPk(pedido.productoId, { transaction });
          itemId = pedido.productoId;
          itemType = 'producto';
        } else if (pedido.subproductoId) {
          item = await SubProducto.findByPk(pedido.subproductoId, { transaction });
          itemId = pedido.subproductoId;
          itemType = 'subproducto';
        }
        
        if (item) {
          // Verificar stock disponible
          if (item.stock < pedido.cantidad) {
            const error = new Error("Stock insuficiente para reactivar el pedido");
            error.statusCode = 400;
            throw error;
          }
          
          // Registrar movimiento de salida (reactivación) - esto también actualiza el stock
          await movimientoStockService.registrarMovimiento({
            itemId,
            itemType,
            tipo: 'salida',
            cantidad: pedido.cantidad,
            observacion: `Reactivación pedido: ${pedido.comentario}`,
            usuarioId: usuarioId || 1 // Usuario del sistema si no se especifica
          }, transaction);
        }
      }

      await pedido.update({ estado }, { transaction });

      await transaction.commit();
      return pedido;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async eliminarPedido(id, usuarioId) {
    const transaction = await sequelize.transaction();
    
    try {
      const pedido = await Pedido.findByPk(id, { transaction });
      if (!pedido) {
        const error = new Error("Pedido no encontrado");
        error.statusCode = 404;
        throw error;
      }

      // Restaurar stock según el tipo de item
      let item, itemId, itemType;
      if (pedido.productoId) {
        item = await Producto.findByPk(pedido.productoId, { transaction });
        itemId = pedido.productoId;
        itemType = 'producto';
      } else if (pedido.subproductoId) {
        item = await SubProducto.findByPk(pedido.subproductoId, { transaction });
        itemId = pedido.subproductoId;
        itemType = 'subproducto';
      }
      
      if (item) {
        // Registrar movimiento de entrada (restauración por eliminación) - esto también actualiza el stock
        await movimientoStockService.registrarMovimiento({
          itemId,
          itemType,
          tipo: 'entrada',
          cantidad: pedido.cantidad,
          observacion: `Eliminación pedido: ${pedido.comentario}`,
          usuarioId
        }, transaction);
      }

      await pedido.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
