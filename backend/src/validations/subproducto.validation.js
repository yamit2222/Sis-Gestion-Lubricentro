import Joi from "joi";

export const subproductoValidation = () => Joi.object({
  nombre: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es obligatorio',
    'string.empty': 'El nombre no puede estar vacío'
  }),
  codigosubP: Joi.number().integer().min(1000).max(9999999999).required().messages({
    'number.min': 'El código debe tener al menos 4 dígitos',
    'number.max': 'El código no puede exceder 10 dígitos',
    'number.integer': 'El código debe ser un número entero',
    'any.required': 'El código del subproducto es obligatorio',
    'number.base': 'El código debe ser un número válido'
  }),
  descripcion: Joi.string().min(10).max(300).required().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 300 caracteres',
    'any.required': 'La descripción es obligatoria',
    'string.empty': 'La descripción no puede estar vacía'
  }),  precio: Joi.number().integer().positive().min(1).max(9999999).required().messages({
    'number.integer': 'El precio debe ser un número entero',
    'number.positive': 'El precio debe ser un número positivo',
    'number.min': 'El precio debe ser mayor a 0',
    'number.max': 'El precio no puede exceder 9,999,999',
    'any.required': 'El precio es obligatorio',
    'number.base': 'El precio debe ser un número válido'
  }),
  stock: Joi.number().integer().min(0).max(9999).required().messages({
    'number.min': 'El stock no puede ser negativo',
    'number.max': 'El stock no puede exceder 9999 unidades',
    'number.integer': 'El stock debe ser un número entero',
    'any.required': 'El stock es obligatorio',
    'number.base': 'El stock debe ser un número válido'
  }),
  marca: Joi.string().min(3).max(30).required().messages({
    'string.min': 'La marca debe tener al menos 3 caracteres',
    'string.max': 'La marca no puede exceder 30 caracteres',
    'any.required': 'La marca es obligatoria',
    'string.empty': 'La marca no puede estar vacía'
  }),
  categoria: Joi.string().valid("repuestos", "limpieza", "accesorios externos", "accesorios eléctricos").required().messages({
    'any.only': 'La categoría debe ser: repuestos, limpieza, accesorios externos o accesorios eléctricos',
    'any.required': 'La categoría es obligatoria',
    'string.empty': 'La categoría no puede estar vacía'
  })
});

export const subproductoExcelValidation = () => Joi.object({
  nombre: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es obligatorio',
    'string.empty': 'El nombre no puede estar vacío'
  }),
  codigosubP: Joi.number().integer().min(1000).max(9999999999).required().messages({
    'number.min': 'El código debe tener al menos 4 dígitos',
    'number.max': 'El código no puede exceder 10 dígitos',
    'number.integer': 'El código debe ser un número entero',
    'any.required': 'El código del subproducto es obligatorio',
    'number.base': 'El código debe ser un número válido'
  }),
  descripcion: Joi.string().min(10).max(300).required().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 300 caracteres',
    'any.required': 'La descripción es obligatoria',
    'string.empty': 'La descripción no puede estar vacía'
  }),
  precio: Joi.number().integer().positive().min(1).max(9999999).required().messages({
    'number.integer': 'El precio debe ser un número entero',
    'number.positive': 'El precio debe ser un número positivo',
    'number.min': 'El precio debe ser mayor a 0',
    'number.max': 'El precio no puede exceder 9,999,999',
    'any.required': 'El precio es obligatorio',
    'number.base': 'El precio debe ser un número válido'
  }),
  stock: Joi.number().integer().min(0).max(9999).optional().messages({
    'number.min': 'El stock no puede ser negativo',
    'number.max': 'El stock no puede exceder 9999 unidades',
    'number.integer': 'El stock debe ser un número entero',
    'number.base': 'El stock debe ser un número válido'
  }),
  marca: Joi.string().min(3).max(30).required().messages({
    'string.min': 'La marca debe tener al menos 3 caracteres',
    'string.max': 'La marca no puede exceder 30 caracteres',
    'any.required': 'La marca es obligatoria',
    'string.empty': 'La marca no puede estar vacía'
  }),
  categoria: Joi.string().valid("repuestos", "limpieza", "accesorios externos", "accesorios eléctricos").required().messages({
    'any.only': 'La categoría debe ser: repuestos, limpieza, accesorios externos o accesorios eléctricos',
    'any.required': 'La categoría es obligatoria',
    'string.empty': 'La categoría no puede estar vacía'
  })
});

export const excelFileValidationLoose = () => Joi.object({
  fieldname: Joi.string().optional(),
  originalname: Joi.string().required(),
  encoding: Joi.string().optional(),
  mimetype: Joi.string().valid(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ).required().messages({
    'any.only': 'Solo se permiten archivos Excel (.xlsx, .xls)'
  }),
  size: Joi.number().max(10 * 1024 * 1024).required().messages({
    'number.max': 'El archivo no puede superar 10MB'
  }),
  buffer: Joi.any().optional(),
  destination: Joi.string().optional(),
  filename: Joi.string().optional(),
  path: Joi.string().optional()
}).options({ allowUnknown: true });
