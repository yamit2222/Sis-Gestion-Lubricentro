import Joi from "joi";

export const pedidoValidation = {
  crearPedido: Joi.object({
    comentario: Joi.string().min(1).max(255).required().messages({
        "string.empty": "El comentario es obligatorio",
        "string.min": "El comentario debe tener al menos 1 carácter",
        "string.max": "El comentario no puede exceder 255 caracteres",
        "any.required": "El comentario es obligatorio"
      }),
    productoId: Joi.number().integer().positive().optional().messages({
        "number.base": "El producto debe ser uno existente",
        "number.integer": "El ID del producto debe ser un número entero",
        "number.positive": "El ID del producto debe ser un número positivo"
      }),
    subproductoId: Joi.number().integer().positive().optional().messages({
        "number.base": "El subproducto debe ser uno existente",
        "number.integer": "El ID del subproducto debe ser un número entero",
        "number.positive": "El ID del subproducto debe ser un número positivo"
      }),
    cantidad: Joi.number().integer().min(1).required().messages({
        "number.base": "La cantidad debe ser un número",
        "number.integer": "La cantidad debe ser un número entero",
        "number.min": "La cantidad debe ser mayor a 0",
        "any.required": "La cantidad es obligatoria"
      }),  
    estado: Joi.string().valid("en proceso", "vendido").default("en proceso").messages({
        "any.only": "El estado debe ser: en proceso o vendido"
      })
  }).xor('productoId', 'subproductoId').messages({
    "object.xor": "Debe especificar exactamente un producto o un subproducto"
  }),

  actualizarPedido: Joi.object({
    comentario: Joi.string().min(1).max(255).optional().messages({
        "string.empty": "El comentario es obligatorio",
        "string.min": "El comentario debe tener al menos 1 carácter",
        "string.max": "El comentario no puede exceder 255 caracteres"
      }),
    productoId: Joi.number().integer().positive().optional().messages({
        "number.base": "El producto debe ser uno existente",
        "number.integer": "El ID del producto debe ser un número entero",
        "number.positive": "El ID del producto debe ser un número positivo"
      }),
    subproductoId: Joi.number().integer().positive().optional().messages({
        "number.base": "El subproducto debe ser uno existente",
        "number.integer": "El ID del subproducto debe ser un número entero",
        "number.positive": "El ID del subproducto debe ser un número positivo"
      }),
    cantidad: Joi.number().integer().min(1).optional().messages({
        "number.base": "La cantidad debe ser un número",
        "number.integer": "La cantidad debe ser un número entero",
        "number.min": "La cantidad debe ser mayor a 0"
      }),  
    estado: Joi.string().valid("en proceso", "vendido").optional().messages({
        "any.only": "El estado debe ser: en proceso o vendido"
      })
  }).min(1).messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar"
  }),

  actualizarEstadoPedido: Joi.object({
    estado: Joi.string().valid("en proceso", "vendido").required().messages({
        "any.only": "El estado debe ser: en proceso o vendido",
        "any.required": "El estado es obligatorio"
      })
  })
};
