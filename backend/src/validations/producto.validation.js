import Joi from "joi";

export const productoValidation = () => Joi.object({
  nombre: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es obligatorio',
    'string.empty': 'El nombre no puede estar vacío'
  }),
  codigoP: Joi.number().integer().min(1000).max(9999999999).required().messages({
    'number.min': 'El código debe tener al menos 4 dígitos',
    'number.max': 'El código no puede exceder 10 dígitos',
    'number.integer': 'El código debe ser un número entero',
    'any.required': 'El código del producto es obligatorio',
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
  categoria: Joi.string().valid("aceite", "filtro", "bateria").required().messages({
    'any.only': 'La categoría debe ser: aceite, filtro o bateria',
    'any.required': 'La categoría es obligatoria',
    'string.empty': 'La categoría no puede estar vacía'
  }),
  subcategoria: Joi.string().valid("auto", "camioneta", "vehiculo comercial", "motocicleta", "maquinaria").required().messages({
    'any.only': 'La subcategoría debe ser: auto, camioneta, vehiculo comercial, motocicleta o maquinaria',
    'any.required': 'La subcategoría es obligatoria',
    'string.empty': 'La subcategoría no puede estar vacía'
  })
});

export const productoExcelValidation = () => Joi.object({
  nombre: Joi.string().min(3).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es obligatorio',
    'string.empty': 'El nombre no puede estar vacío'
  }),
  codigoP: Joi.alternatives().try(
    Joi.number().integer().min(1000).max(9999999999),
    Joi.string().pattern(/^[A-Z0-9]+$/i).min(3).max(15)
  ).required().messages({
    'alternatives.match': 'El código debe ser un número entre 1000-9999999999 o un código alfanumérico de 3-15 caracteres',
    'any.required': 'El código del producto es obligatorio'
  }),
  descripcion: Joi.string().min(10).max(300).required().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 300 caracteres',
    'any.required': 'La descripción es obligatoria',
    'string.empty': 'La descripción no puede estar vacía'
  }),
  precio: Joi.alternatives().try(
    Joi.number().positive().min(1).max(9999999),
    Joi.string().pattern(/^\d+(\.\d{1,2})?$/)
  ).required().messages({
    'alternatives.match': 'El precio debe ser un número válido mayor a 0',
    'any.required': 'El precio es obligatorio'
  }),
  stock: Joi.number().integer().min(0).max(9999).default(0).messages({
    'number.integer': 'El stock debe ser un número entero',
    'number.min': 'El stock no puede ser negativo',
    'number.max': 'El stock no puede exceder 9999'
  }),
  marca: Joi.string().min(3).max(30).required().messages({
    'string.min': 'La marca debe tener al menos 3 caracteres',
    'string.max': 'La marca no puede exceder 30 caracteres',
    'any.required': 'La marca es obligatoria',
    'string.empty': 'La marca no puede estar vacía'
  }),
  categoria: Joi.string().valid("aceite", "filtro", "bateria").required().messages({
    'any.only': 'La categoría debe ser: aceite, filtro o bateria',
    'any.required': 'La categoría es obligatoria',
    'string.empty': 'La categoría no puede estar vacía'
  }),
  subcategoria: Joi.string().valid("auto", "camioneta", "vehiculo comercial", "motocicleta", "maquinaria").required().messages({
    'any.only': 'La subcategoría debe ser: auto, camioneta, vehiculo comercial, motocicleta o maquinaria',
    'any.required': 'La subcategoría es obligatoria',
    'string.empty': 'La subcategoría no puede estar vacía'
  })
});

export const excelFileValidation = () => Joi.object({
  fieldname: Joi.string().valid('excel').required(),
  mimetype: Joi.string().valid(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ).required().messages({
    'any.only': 'Solo se permiten archivos Excel (.xlsx, .xls)'
  }),
  size: Joi.number().max(5 * 1024 * 1024).required().messages({
    'number.max': 'El archivo no puede ser mayor a 5MB'
  })
});
// Allow unknown keys because multer file object includes additional properties
// like originalname, buffer, etc. We only validate the important parts above.
export const excelFileValidationLoose = () => excelFileValidation().unknown(true);
