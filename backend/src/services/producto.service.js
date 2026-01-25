import { Producto } from "../entity/producto.entity.js";
import { productoExcelValidation } from "../validations/producto.validation.js";

export const productoService = {
  async crearProducto(data) {
    const nuevo = await Producto.create(data);
    return nuevo;
  },

  async obtenerProductos(pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    
    const { count, rows: productos } = await Producto.findAndCountAll({
      limit: parseInt(limite),
      offset: offset,
      order: [['id', 'DESC']] // Mostrar los más recientes primero
    });

    return {
      productos,
      totalProductos: count,
      totalPaginas: Math.ceil(count / limite),
      paginaActual: parseInt(pagina),
      limite: parseInt(limite)
    };
  },

  async obtenerProductoPorId(id) {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }
    return producto;
  },

  async modificarProducto(id, data) {
    if ('stock' in data) {
      delete data.stock;
    }
    const producto = await Producto.findByPk(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }
    await producto.update(data);
    return producto;
  },

  async eliminarProducto(id) {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }
    await producto.destroy();
    return true;
  },

  async actualizarStock(id, nuevoStock) {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }
    await producto.update({ stock: nuevoStock });
    return producto;
  },

  async importarProductosDesdeExcel(datosExcel) {
    console.log('INICIO - importarProductosDesdeExcel - Versión actualizada con logs');
    const productosCreados = [];
    const errores = [];

    for (let i = 0; i < datosExcel.length; i++) {
      const fila = i + 2; 
      const producto = datosExcel[i];

      try {
        // Limpiar y procesar los datos (stock se establece automáticamente en 0)
        const productoLimpio = {
          nombre: typeof producto.nombre === 'string' ? producto.nombre.trim() : '',
          codigoP: this.procesarCodigo(producto.codigoP),
          descripcion: typeof producto.descripcion === 'string' ? producto.descripcion.trim() : '',
          precio: this.procesarPrecio(producto.precio),
          stock: 0, // Stock inicial siempre 0 para productos importados
          marca: typeof producto.marca === 'string' ? producto.marca.trim().toLowerCase() : '',
          categoria: typeof producto.categoria === 'string' ? producto.categoria.trim().toLowerCase() : '',
          subcategoria: typeof producto.subcategoria === 'string' ? producto.subcategoria.trim().toLowerCase() : ''
        };

        // Validar el producto
        const { error } = productoExcelValidation().validate(productoLimpio);
        if (error) {
          console.log(`Error validación fila ${fila}:`, error.details.map(err => err.message));
          console.log(`Datos originales:`, producto);
          console.log(`Datos procesados:`, productoLimpio);
          errores.push({
            fila,
            errores: error.details.map(err => err.message),
            datos: producto,
            datosLimpios: productoLimpio
          });
          continue;
        }

        // Verificar si ya existe un producto con el mismo código
        const productoExistente = await Producto.findOne({ 
          where: { codigoP: productoLimpio.codigoP } 
        });

        if (productoExistente) {
          errores.push({
            fila,
            errores: [`El código ${productoLimpio.codigoP} ya existe en la base de datos`],
            datos: producto,
            datosLimpios: productoLimpio
          });
          continue;
        }

        // Crear el producto
        console.log(`Creando producto fila ${fila}:`, productoLimpio);
        const nuevoProducto = await Producto.create(productoLimpio);
        console.log(`Producto creado exitosamente - ID: ${nuevoProducto.id}, Código: ${nuevoProducto.codigoP}`);
        productosCreados.push(nuevoProducto);

      } catch (error) {
        console.log(`Error creando producto fila ${fila}:`, error.message);
        console.log(`Stack trace:`, error.stack);
        errores.push({
          fila,
          errores: [error.message || 'Error desconocido'],
          datos: producto
        });
      }
    }

    console.log(`Resultado final - Productos creados: ${productosCreados.length}, Errores: ${errores.length}`);
    
    return {
      productosCreados: productosCreados.length,
      errores
    };
  },

  procesarCodigo(codigo) {
    if (typeof codigo === 'number') return Math.floor(codigo);
    
    if (typeof codigo === 'string') {
      const codigoLimpio = codigo.trim().toUpperCase();
      
      // Si es solo números, convertir a número
      if (/^\d+$/.test(codigoLimpio)) {
        const numero = parseInt(codigoLimpio, 10);
        return isNaN(numero) ? null : numero;
      }
      
      // Si es alfanumérico, mantener como string
      if (/^[A-Z0-9]+$/i.test(codigoLimpio)) {
        return codigoLimpio;
      }
      
      return null;
    }
    
    return null;
  },

  procesarPrecio(precio) {
    if (typeof precio === 'number') return Math.floor(precio);
    if (typeof precio === 'string') {
      const numero = parseFloat(precio.replace(/[^0-9.]/g, ''));
      return isNaN(numero) ? null : Math.floor(numero);
    }
    return null;
  },

  procesarStock(stock) {
    if (typeof stock === 'number') return Math.floor(stock);
    if (typeof stock === 'string') {
      const numero = parseInt(stock.replace(/\D/g, ''), 10);
      return isNaN(numero) ? 0 : numero;
    }
    return 0;
  }
};
