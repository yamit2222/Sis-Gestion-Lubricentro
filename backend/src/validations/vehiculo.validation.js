"use strict";
import Joi from "joi";

export const vehiculoValidation = () => Joi.object({
  Marca: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "La marca no puede estar vacía.",
      "string.base": "La marca debe ser de tipo string.",
      "string.min": "La marca debe tener como mínimo 2 caracteres.",
      "string.max": "La marca debe tener como máximo 50 caracteres.",
      "any.required": "La marca es requerida.",
    }),
  Modelo: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "El modelo no puede estar vacío.",
      "string.base": "El modelo debe ser de tipo string.",
      "string.min": "El modelo debe tener como mínimo 2 caracteres.",
      "string.max": "El modelo debe tener como máximo 50 caracteres.",
      "any.required": "El modelo es requerido.",
    }),
  Año: Joi.number()
    .required()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .messages({
      "number.base": "El año debe ser un número.",
      "number.min": "El año debe ser mayor a 1900.",
      "number.max": "El año no puede ser mayor al próximo año.",
      "any.required": "El año es requerido.",
    }),
  Filtro_de_aire: Joi.string()
    .required()
    .messages({
      "string.empty": "El filtro de aire no puede estar vacío.",
      "string.base": "El filtro de aire debe ser de tipo string.",
      "any.required": "El filtro de aire es requerido.",
    }),
  Filtro_de_aceite: Joi.string()
    .required()
    .messages({
      "string.empty": "El filtro de aceite no puede estar vacío.",
      "string.base": "El filtro de aceite debe ser de tipo string.",
      "any.required": "El filtro de aceite es requerido.",
    }),
  Filtro_de_combustible: Joi.string()
    .required()
    .messages({
      "string.empty": "El filtro de combustible no puede estar vacío.",
      "string.base": "El filtro de combustible debe ser de tipo string.",
      "any.required": "El filtro de combustible es requerido.",
    }),
  Bateria: Joi.string()
    .allow("")
    .optional()
    .messages({
      "string.base": "La batería debe ser de tipo string.",
    }),
  Posicion: Joi.string()
    .required()
    .messages({
      "string.empty": "La posición no puede estar vacía.",
      "string.base": "La posición debe ser de tipo string.",
      "any.required": "La posición es requerida.",
    })
});