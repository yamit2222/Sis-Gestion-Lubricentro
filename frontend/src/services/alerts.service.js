import { getAllProductos } from './producto.service.js';
import { getAllSubProductos } from './subproducto.service.js';

// Configuración de límites de stock bajo
const STOCK_BAJO_LIMITE = 5;
const STOCK_CRITICO_LIMITE = 2;

export const getProductosStockBajo = async () => {
  try {
    const response = await getAllProductos();
    let productos = [];
    
    // Manejar la nueva estructura de respuesta con paginación
    if (response.data && response.data.productos) {
      productos = response.data.productos;
    } else if (Array.isArray(response.data)) {
      productos = response.data;
    } else if (Array.isArray(response)) {
      productos = response;
    }

    return productos.filter(producto => producto.stock <= STOCK_BAJO_LIMITE);
  } catch (error) {
    console.error('Error obteniendo productos con stock bajo:', error);
    return [];
  }
};

export const getSubproductosStockBajo = async () => {
  try {
    const response = await getAllSubProductos();
    let subproductos = [];
    
    // Manejar la nueva estructura de respuesta con paginación
    if (response.data && response.data.subproductos) {
      subproductos = response.data.subproductos;
    } else if (Array.isArray(response.data)) {
      subproductos = response.data;
    } else if (Array.isArray(response)) {
      subproductos = response;
    }

    return subproductos.filter(subproducto => subproducto.stock <= STOCK_BAJO_LIMITE);
  } catch (error) {
    console.error('Error obteniendo subproductos con stock bajo:', error);
    return [];
  }
};

export const getAllStockBajo = async () => {
  const [productos, subproductos] = await Promise.all([
    getProductosStockBajo(),
    getSubproductosStockBajo()
  ]);

  return {
    productos: productos.map(p => ({
      ...p,
      tipo: 'producto',
      nivel: p.stock <= STOCK_CRITICO_LIMITE ? 'critico' : 'bajo'
    })),
    subproductos: subproductos.map(sp => ({
      ...sp,
      tipo: 'subproducto',
      nivel: sp.stock <= STOCK_CRITICO_LIMITE ? 'critico' : 'bajo'
    })),
    total: productos.length + subproductos.length,
    criticos: [...productos, ...subproductos].filter(item => item.stock <= STOCK_CRITICO_LIMITE).length
  };
};

export const getStockStatus = (stock) => {
  if (stock <= STOCK_CRITICO_LIMITE) return 'critico';
  if (stock <= STOCK_BAJO_LIMITE) return 'bajo';
  return 'normal';
};

export const getStockColor = (stock) => {
  const status = getStockStatus(stock);
  switch (status) {
    case 'critico': return 'error';
    case 'bajo': return 'warning';
    default: return 'success';
  }
};

export const LIMITES_STOCK = {
  BAJO: STOCK_BAJO_LIMITE,
  CRITICO: STOCK_CRITICO_LIMITE
};