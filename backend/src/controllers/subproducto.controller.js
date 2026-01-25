"use strict";

import { subproductoService } from "../services/subproducto.service.js";
import {handleErrorClient,handleErrorServer,handleSuccess} from "../handlers/responseHandlers.js";
import { subproductoValidation, excelFileValidationLoose } from "../validations/subproducto.validation.js";
import xlsx from 'xlsx';

export const subproductoController = {
  async crearSubproducto(req, res) {
    try {
      const data = req.body;

      const { error } = subproductoValidation().validate(data, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          const field = err.path[0];
          if (!errors[field]) errors[field] = err.message;
        });
        return handleErrorClient(res, 400, "Error de validación", errors);
      }

      const subproducto = await subproductoService.crearSubproducto(data);
      handleSuccess(res, 201, "Subproducto creado correctamente", subproducto);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async obtenerSubproductos(req, res) {
    try {
      const { pagina = 1, limite = 10 } = req.query;
      const resultado = await subproductoService.obtenerSubproductos(
        parseInt(pagina), 
        parseInt(limite)
      );
      handleSuccess(res, 200, "Subproductos obtenidos correctamente", resultado);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async obtenerSubproductoPorId(req, res) {
    try {
      const { id } = req.params;
      const subproducto = await subproductoService.obtenerSubproductoPorId(id);
      handleSuccess(res, 200, "Subproducto obtenido correctamente", subproducto);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async modificarSubproducto(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { error } = subproductoValidation().validate(data, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          const field = err.path[0];
          if (!errors[field]) errors[field] = err.message;
        });
        return handleErrorClient(res, 400, "Error de validación", errors);
      }

      const subproducto = await subproductoService.modificarSubproducto(id, data);
      handleSuccess(res, 200, "Subproducto actualizado correctamente", subproducto);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async eliminarSubproducto(req, res) {
    try {
      const { id } = req.params;
      await subproductoService.eliminarSubproducto(id);
      handleSuccess(res, 200, "Subproducto eliminado correctamente");
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode === 404) {
        return handleErrorClient(res, 404, error.message);
      }
      handleErrorServer(res, 500, error.message);
    }
  },

  async importarSubproductosExcel(req, res) {
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
      
      let jsonData = [];
      
      // Detectar si es formato vertical (plantilla con campos en columna A y valores en columnas B, C, etc.)
      if (rawData.length >= 6 && rawData[0] && rawData[0][0] === 'nombre') {
        
        // Determinar cuántos subproductos hay (columnas con datos después de la A)
        const numSubproductos = Math.max(...rawData.map(row => row.length - 1));
        
        // Procesar cada subproducto (cada columna B, C, D, etc.)
        for (let colIndex = 1; colIndex <= numSubproductos; colIndex++) {
          const subproductoObj = {};
          let tieneValores = false;
          
          for (let i = 0; i < rawData.length; i++) {
            const fila = rawData[i];
            let campo = fila[0]; // Nombre del campo en columna A
            const valor = fila[colIndex] || ''; // Valor en la columna correspondiente
            
            // Mapear nombres de campos alternativos ANTES de usar el campo
            if (campo === 'codigoSP') {
              campo = 'codigosubP';
            }
            
            // Ignorar campos que no corresponden a subproductos
            if (campo === 'productoId') {
              continue;
            }
            
            if (campo && valor !== '') {
              subproductoObj[campo] = valor;
              tieneValores = true;
            }
          }
          
          // Solo agregar el subproducto si tiene al menos algunos valores
          if (tieneValores && subproductoObj.nombre) {
            // Arreglo final: asegurar que codigoSP se mapee a codigosubP
            if (subproductoObj.codigoSP && !subproductoObj.codigosubP) {
              subproductoObj.codigosubP = subproductoObj.codigoSP;
              delete subproductoObj.codigoSP;
            }
            // Eliminar campos no deseados
            delete subproductoObj.productoId;
            
            jsonData.push(subproductoObj);
          }
        }
        
      } else {
        console.log('Detectado formato horizontal');
        // Formato horizontal tradicional - primero leer los datos tal como vienen
        const rawJsonData = xlsx.utils.sheet_to_json(worksheet, { range: 1 });
        
        // Mapear y limpiar los datos
        jsonData = rawJsonData.map(row => {
          const cleanRow = {};
          
          // Mapear los campos con nombres alternativos
          Object.keys(row).forEach(key => {
            let mappedKey = key.toLowerCase().trim();
            
            // Mapear nombres alternativos
            if (mappedKey === 'codigosp' || mappedKey === 'codigo') {
              mappedKey = 'codigosubP';
            }
            
            // Ignorar campos no válidos
            if (mappedKey === 'productoid') {
              return;
            }
            
            // Solo incluir campos válidos
            if (['nombre', 'codigosubP', 'descripcion', 'precio', 'marca', 'categoria'].includes(mappedKey)) {
              cleanRow[mappedKey] = row[key];
            }
          });
          
          return cleanRow;
        }).filter(row => Object.keys(row).length > 0);
      }

      if (jsonData.length === 0) {
        return handleErrorClient(res, 400, "El archivo Excel está vacío o no tiene el formato correcto");
      }

      // Mapeo final: asegurar que todos los datos tengan los campos correctos
      const jsonDataMapeado = jsonData.map(item => {
        const itemMapeado = { ...item };
        
        // Mapear codigoSP a codigosubP
        if (itemMapeado.codigoSP) {
          itemMapeado.codigosubP = itemMapeado.codigoSP;
          delete itemMapeado.codigoSP;
        }
        
        // Eliminar productoId ya que no corresponde a subproductos
        delete itemMapeado.productoId;
        
        return itemMapeado;
      });
      
      // Procesar los subproductos
      const resultado = await subproductoService.importarSubproductosDesdeExcel(jsonDataMapeado);
      
      // Determinar el estado basado en los resultados
      const exitosos = resultado.subproductosCreados;
      const fallidos = resultado.errores.length;
      const total = jsonData.length;

      if (exitosos === 0 && fallidos > 0) {
        // Todos los subproductos fallaron
        return handleErrorClient(res, 400, "No se pudo importar ningún subproducto", {
          subproductosCreados: exitosos,
          errores: resultado.errores,
          total,
          exitosos,
          fallidos
        });
      }

      // Al menos un subproducto se importó correctamente
      const mensaje = exitosos === total 
        ? "Todos los subproductos fueron importados correctamente"
        : `Se importaron ${exitosos} de ${total} subproductos correctamente`;

      handleSuccess(res, 200, mensaje, {
        subproductosCreados: exitosos,
        errores: resultado.errores,
        total,
        exitosos,
        fallidos
      });

    } catch (error) {
      console.error('Error importando subproductos:', error);
      handleErrorServer(res, 500, error.message);
    }
  }
};
