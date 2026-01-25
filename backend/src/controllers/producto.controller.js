"use strict";
import { productoService } from "../services/producto.service.js";
import {handleErrorClient,handleErrorServer,handleSuccess} from "../handlers/responseHandlers.js";
import { productoValidation, excelFileValidationLoose } from "../validations/producto.validation.js";
import xlsx from 'xlsx';

export const productoController = {
  async crearProducto(req, res) {
    try {
      const data = req.body;

      const { error } = productoValidation().validate(data, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          const field = err.path[0];
          if (!errors[field]) errors[field] = err.message;
        });
        return handleErrorClient(res, 400, "Error de validación", errors);
      }

      const producto = await productoService.crearProducto(data);
      handleSuccess(res, 201, "Producto creado correctamente", producto);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },
  async obtenerProductos(req, res) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const resultado = await productoService.obtenerProductos(
        parseInt(pagina), 
        parseInt(limite)
      );
      handleSuccess(res, 200, "Productos obtenidos correctamente", resultado);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async obtenerProductoPorId(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoService.obtenerProductoPorId(id);
      handleSuccess(res, 200, "Producto obtenido correctamente", producto);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async modificarProducto(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const { error } = productoValidation().validate(data, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          const field = err.path[0];
          if (!errors[field]) errors[field] = err.message;
        });
        return handleErrorClient(res, 400, "Error de validación", errors);
      }

      const producto = await productoService.modificarProducto(id, data);
      handleSuccess(res, 200, "Producto actualizado correctamente", producto);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async eliminarProducto(req, res) {
    try {
      const { id } = req.params;
      await productoService.eliminarProducto(id);
      handleSuccess(res, 200, "Producto eliminado correctamente");
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async importarProductosExcel(req, res) {
    try {
      // Validar que se haya subido un archivo
      if (!req.file) {
        return handleErrorClient(res, 400, "No se ha subido ningún archivo");
      }

      // Validar el archivo (permitimos claves adicionales que agrega multer)
      const { error } = excelFileValidationLoose().validate(req.file);
      if (error) {
        return handleErrorClient(res, 400, "Archivo inválido", error.details[0].message);
      }

      // Leer el archivo Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Leer datos sin headers para detectar el formato
      const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('Raw data del Excel:', rawData);
      
      let jsonData = [];
      
      // Detectar si es formato vertical (plantilla con campos en columna A y valores en columnas B, C, etc.)
      if (rawData.length >= 7 && rawData[0] && rawData[0][0] === 'nombre') {
        console.log('Detectado formato vertical');
        
        // Determinar cuántos productos hay (columnas con datos después de la A)
        const numProductos = Math.max(...rawData.map(fila => fila.length)) - 1;
        console.log(`Detectados ${numProductos} productos en el Excel`);
        
        // Procesar cada producto (cada columna B, C, D, etc.)
        for (let colIndex = 1; colIndex <= numProductos; colIndex++) {
          const productoObj = {};
          let tieneValores = false;
          
          for (let i = 0; i < Math.min(rawData.length, 7); i++) {
            const fila = rawData[i];
            const campo = fila[0]; // Nombre del campo en columna A
            const valor = fila[colIndex] || ''; // Valor en la columna correspondiente
            
            if (campo && valor !== '') {
              productoObj[campo] = valor;
              tieneValores = true;
            }
          }
          
          // Solo agregar el producto si tiene al menos algunos valores
          if (tieneValores && productoObj.nombre) {
            console.log(`Producto ${colIndex} procesado desde formato vertical:`, productoObj);
            jsonData.push(productoObj);
          }
        }
        
      } else {
        console.log('Detectado formato horizontal');
        // Formato horizontal tradicional
        jsonData = xlsx.utils.sheet_to_json(worksheet, {
          header: ['nombre', 'codigoP', 'descripcion', 'precio', 'marca', 'categoria', 'subcategoria'],
          range: 1
        });
      }

      if (jsonData.length === 0) {
        return handleErrorClient(res, 400, "El archivo Excel está vacío o no tiene el formato correcto");
      }

      // Procesar los productos
      const resultado = await productoService.importarProductosDesdeExcel(jsonData);
      
      // Determinar el estado basado en los resultados
      const exitosos = resultado.productosCreados;
      const fallidos = resultado.errores.length;
      const total = jsonData.length;

      if (exitosos === 0 && fallidos > 0) {
        // Todos los productos fallaron
        return handleErrorClient(res, 400, "No se pudo importar ningún producto", {
          productosCreados: exitosos,
          errores: resultado.errores,
          total,
          exitosos,
          fallidos
        });
      }

      // Al menos un producto se importó correctamente
      const mensaje = exitosos === total 
        ? "Todos los productos fueron importados correctamente"
        : `Se importaron ${exitosos} de ${total} productos correctamente`;

      handleSuccess(res, 200, mensaje, {
        productosCreados: exitosos,
        errores: resultado.errores,
        total,
        exitosos,
        fallidos
      });

    } catch (error) {
      console.error('Error importando productos:', error);
      handleErrorServer(res, 500, error.message);
    }
  }
};
