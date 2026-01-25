import Joi from "joi";

export const movimientoStockValidation = {
  registrarMovimiento: () => Joi.object({
    // Nuevo formato
    itemId: Joi.number().integer().positive()
      .messages({
        'number.base': 'El ID del item debe ser un número',
        'number.integer': 'El ID del item debe ser un número entero',
        'number.positive': 'El ID del item debe ser positivo'
      }),
    
    itemType: Joi.string().valid('producto', 'subproducto')
      .messages({
        'string.base': 'El tipo de item debe ser una cadena de texto',
        'any.only': 'El tipo de item debe ser "producto" o "subproducto"'
      }),
    
    // Formato anterior (compatibilidad)
    productoId: Joi.number().integer().positive()
      .messages({
        'number.base': 'El ID del producto debe ser un número',
        'number.integer': 'El ID del producto debe ser un número entero',
        'number.positive': 'El ID del producto debe ser positivo'
      }),
    
    tipo: Joi.string().valid('entrada', 'salida').required()
      .messages({
        'string.base': 'El tipo debe ser una cadena de texto',
        'any.only': 'El tipo debe ser "entrada" o "salida"',
        'any.required': 'El tipo de movimiento es obligatorio'
      }),
    
    cantidad: Joi.number().integer().positive().max(9999).required()
      .messages({
        'number.base': 'La cantidad debe ser un número',
        'number.integer': 'La cantidad debe ser un número entero',
        'number.positive': 'La cantidad debe ser positiva',
        'number.max': 'La cantidad no puede exceder 9999',
        'any.required': 'La cantidad es obligatoria'
      }),
    
    observacion: Joi.string().max(500).optional().allow('', null)
      .messages({
        'string.base': 'La observación debe ser una cadena de texto',
        'string.max': 'La observación no puede exceder 500 caracteres'
      })
  }).or('itemId', 'productoId')
    .with('itemId', 'itemType')
    .messages({
      'object.missing': 'Debe proporcionar itemId e itemType, o productoId'
    }),

  obtenerMovimientosPorProducto: () => Joi.object({
    productoId: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'El ID del producto debe ser un número',
        'number.integer': 'El ID del producto debe ser un número entero',
        'number.positive': 'El ID del producto debe ser positivo',
        'any.required': 'El ID del producto es obligatorio'
      })
  }),

  obtenerMovimientosPorItem: () => Joi.object({
    itemId: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'El ID del item debe ser un número',
        'number.integer': 'El ID del item debe ser un número entero',
        'number.positive': 'El ID del item debe ser positivo',
        'any.required': 'El ID del item es obligatorio'
      }),
    itemType: Joi.string().valid('producto', 'subproducto').required()
      .messages({
        'string.base': 'El tipo de item debe ser una cadena de texto',
        'any.only': 'El tipo de item debe ser "producto" o "subproducto"',
        'any.required': 'El tipo de item es obligatorio'
      })
  })
};
