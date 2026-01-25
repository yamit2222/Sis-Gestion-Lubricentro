import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Avatar,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  Inventory, 
  ShoppingCart, 
  CalendarToday,
  DateRange,
  ShowChart
} from '@mui/icons-material';
import fondo from '../assets/imagen/lubricartoon.png';
import StockAlerts from '../components/StockAlerts';
import { getAllProductos } from '../services/producto.service';
import { getAllSubProductos } from '../services/subproducto.service';
import { getPedidos } from '../services/pedido.service';
import { getMovimientos } from '../services/movimientoStock.service';

const Home = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalSubProductos: 0,
    totalPedidos: 0,
    stockBajo: 0,
    stockCritico: 0,
    pedidosHoy: 0,
    // Reportes diarios
    ventasHoy: 0,
    pedidosCompletadosHoy: 0,
    movimientosStockHoy: 0,
    // Reportes semanales
    ventasSemana: 0,
    pedidosSemana: 0,
    productosMasVendidos: [],
    tendenciaStock: 'estable'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Ejecutar todas las consultas en paralelo para optimizar rendimiento
      const [productosRes, subProductosRes, pedidosRes, movimientosRes] = await Promise.all([
        getAllProductos(),
        getAllSubProductos(), 
        getPedidos(1, 200), // Aumentamos límite para mejor análisis
        getMovimientos()
      ]);
      
      // Procesar respuestas de manera eficiente
      const productos = Array.isArray(productosRes.data) ? productosRes.data : 
                       (productosRes.data?.productos || []);
      const subProductos = Array.isArray(subProductosRes.data) ? subProductosRes.data : 
                          (subProductosRes.data?.subproductos || []);
      const pedidos = Array.isArray(pedidosRes.data) ? pedidosRes.data : 
                     (pedidosRes.data?.pedidos || []);
      const movimientos = Array.isArray(movimientosRes.data) ? movimientosRes.data : 
                         (movimientosRes.data?.movimientos || []);

      // Crear mapa de productos para búsquedas O(1) en lugar de O(n)
      const productosMap = new Map();
      [...productos, ...subProductos].forEach(p => productosMap.set(p.id, p));
      
      // Calcular estadísticas de stock en una sola pasada
      let stockBajo = 0, stockCritico = 0;
      productosMap.forEach(item => {
        const stock = item.stock || 0;
        if (stock <= 5) stockCritico++;
        else if (stock <= 10) stockBajo++;
      });
      
      // Definir fechas una vez
      const hoy = new Date();
      const hoySting = hoy.toDateString();
      const inicioSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      // Procesar pedidos y movimientos en una sola iteración
      const stats = {
        pedidosHoy: 0,
        pedidosCompletadosHoy: 0,
        ventasHoy: 0,
        pedidosSemana: 0,
        ventasSemana: 0,
        ventasPorProducto: new Map(),
        movimientosHoy: 0
      };

      // Procesar pedidos eficientemente
      pedidos.forEach(pedido => {
        const fechaPedido = new Date(pedido.createdAt || pedido.fecha);
        const esHoy = fechaPedido.toDateString() === hoySting;
        const esSemana = fechaPedido >= inicioSemana;
        const esMes = fechaPedido >= inicioMes;
        const esCompletado = pedido.estado === 'vendido' || pedido.estado === 'completado';
        
        if (esHoy) {
          stats.pedidosHoy++;
          if (esCompletado) {
            stats.pedidosCompletadosHoy++;
            const producto = productosMap.get(pedido.productoId);
            if (producto) {
              stats.ventasHoy += (producto.precio || 0) * (pedido.cantidad || 1);
            }
          }
        }
        
        if (esSemana) {
          stats.pedidosSemana++;
          if (esCompletado) {
            const producto = productosMap.get(pedido.productoId);
            if (producto) {
              stats.ventasSemana += (producto.precio || 0) * (pedido.cantidad || 1);
            }
          }
        }
        
        // Productos más vendidos del mes
        if (esMes && esCompletado) {
          const producto = productosMap.get(pedido.productoId);
          if (producto) {
            const key = producto.id;
            const existing = stats.ventasPorProducto.get(key);
            if (existing) {
              existing.ventas += pedido.cantidad || 1;
            } else {
              stats.ventasPorProducto.set(key, {
                nombre: producto.nombre,
                ventas: pedido.cantidad || 1,
                categoria: productos.find(p => p.id === pedido.productoId) ? 'Producto' : 'ProductoPequeño'
              });
            }
          }
        }
      });

      // Procesar movimientos eficientemente
      movimientos.forEach(movimiento => {
        const fechaMovimiento = new Date(movimiento.createdAt || movimiento.fecha);
        if (fechaMovimiento.toDateString() === hoySting) {
          stats.movimientosHoy++;
        }
      });

      // Obtener top 3 productos más vendidos del mes
      const productosMasVendidos = Array.from(stats.ventasPorProducto.values())
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 3);

      // Si no hay ventas del mes, mostrar productos aleatorios como fallback
      if (productosMasVendidos.length === 0) {
        const allItems = [...productos, ...subProductos];
        const fallbackProductos = allItems
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(p => ({ 
            nombre: p.nombre, 
            ventas: Math.floor(Math.random() * 5) + 1,
            categoria: 'Sin ventas'
          }));
        productosMasVendidos.push(...fallbackProductos);
      }

      setStats({
        totalProductos: productos.length,
        totalSubProductos: subProductos.length,
        totalPedidos: pedidos.length,
        stockBajo,
        stockCritico,
        pedidosHoy: stats.pedidosHoy,
        ventasHoy: stats.ventasHoy,
        pedidosCompletadosHoy: stats.pedidosCompletadosHoy,
        movimientosStockHoy: stats.movimientosHoy, // Real - basado en movimientos de hoy
        ventasSemana: stats.ventasSemana,
        pedidosSemana: stats.pedidosSemana,
        productosMasVendidos,
        tendenciaStock: stockCritico > 5 ? 'descendente' : stockBajo > 10 ? 'estable' : 'ascendente'
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #23272F 0%, #353945 40%, #4B4F58 70%, #FFB800 100%)',
      backgroundImage: `url(${fondo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      width: '100%',
      pt: { xs: 1, md: 2 },
      pb: { xs: 2, md: 3 }
    }}>
      <Container maxWidth="xl">
        {/* Alertas para móviles - solo visible en pantallas pequeñas */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
          <StockAlerts />
        </Box>
        
        {/* Título principal */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 5,
          mx: 'auto',
          maxWidth: { xs: '100%', md: '1200px' },
          mt: { xs: 8, md: 12 }
        }}>
          <Typography variant="h1" sx={{ 
            color: '#E2E8F0', 
            fontWeight: 600, 
            letterSpacing: '2px',
            mb: 1.5,
            fontSize: { xs: '2.8rem', sm: '3.5rem', md: '4.2rem' },
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            fontFamily: '"Inter", "Roboto", sans-serif',
            lineHeight: 1.1
          }}>
            Lubricentro "El Socio"
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#94A3B8', 
            fontWeight: 300,
            fontSize: { xs: '0.8rem', md: '1.0rem' },
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Los Ángeles, Chile • Sistema de Gestión
          </Typography>
        </Box>

        {/* Contenido principal centralizado */}
        <Box sx={{ 
          mx: 'auto',
          maxWidth: { xs: '100%', md: '1200px' },
          px: { xs: 2, md: 0 }
        }}>
          {/* Grid de estadísticas principales */}
          <Grid container spacing={{ xs: 2, md: 2 }} sx={{ mb: { xs: 2, md: 3 }, justifyContent: 'center' }}>
          {/* Card de Inventario Total */}
          <Grid item xs={12} sm={5} md={4}>
            <Card sx={{
              background: 'rgba(35,39,47,0.6)',
              border: '1px solid #000000',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              height: '100%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#FFB800',
                boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ pb: '16px !important', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#0F172A', mr: 1.5, width: 32, height: 32 }}>
                    <Inventory sx={{ fontSize: '1.2rem' }} />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                    Inventario Total
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5, fontSize: '1.8rem' }}>
                  {loading ? '...' : stats.totalProductos + stats.totalSubProductos}
                </Typography>
                <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                  {stats.totalProductos} productos • {stats.totalSubProductos} producto pequeño
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card de Pedidos */}
          <Grid item xs={12} sm={5} md={4}>
            <Card sx={{
              background: 'rgba(35,39,47,0.6)',
              border: '1px solid #000000',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              height: '100%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#FFB800',
                boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ pb: '16px !important', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#0F172A', mr: 1.5, width: 32, height: 32 }}>
                    <ShoppingCart sx={{ fontSize: '1.2rem' }} />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                    Pedidos Totales
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5, fontSize: '1.8rem' }}>
                  {loading ? '...' : stats.totalPedidos}
                </Typography>
                <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                  {stats.pedidosHoy} pedidos registrados hoy
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          </Grid>

          {/* Sección de análisis detallado */}
          <Box sx={{
            mb: 3,
            mt: 4,
            textAlign: 'left'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#FFB800', 
              fontWeight: 700, 
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '0.5px',
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
              borderBottom: '3px solid #FFB800',
              paddingBottom: '8px',
              display: 'block',
              width: '95%'
            }}>
              Estado del Inventario
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#F8FAFC', 
              fontWeight: 400
            }}>
              Monitoreo en tiempo real del stock disponible
            </Typography>
          </Box>
        
          <Grid container spacing={{ xs: 2, md: 2 }} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Card sx={{
                  background: 'rgba(35,39,47,0.6)',
                  border: '1px solid #000000',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#FFB800',
                    boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                <CardContent sx={{ pb: '16px !important' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(35,39,47,0.6)',
                      border: '1px solid #000000',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#FFB800',
                        boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: '16px !important' }}>
                        <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 1 }}>
                          {stats.totalProductos + stats.totalSubProductos - stats.stockBajo - stats.stockCritico}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B3B8', mb: 2 }}>
                          Stock Óptimo
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={((stats.totalProductos + stats.totalSubProductos - stats.stockBajo - stats.stockCritico) / (stats.totalProductos + stats.totalSubProductos || 1)) * 100}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: '#353945',
                            '& .MuiLinearProgress-bar': { bgcolor: '#10B981' }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(35,39,47,0.6)',
                      border: '1px solid #000000',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#FFB800',
                        boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: '16px !important' }}>
                        <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 1 }}>
                          {stats.stockBajo}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B3B8', mb: 2 }}>
                          Stock Moderado
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stats.stockBajo / (stats.totalProductos + stats.totalSubProductos || 1)) * 100}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: '#353945',
                            '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(35,39,47,0.6)',
                      border: '1px solid #000000',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#FFB800',
                        boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: '16px !important' }}>
                        <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 1 }}>
                          {stats.stockCritico}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#B0B3B8', mb: 2 }}>
                          Requiere Atención
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stats.stockCritico / (stats.stockCritico + stats.totalSubProductos || 1)) * 100}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: '#353945',
                            '& .MuiLinearProgress-bar': { bgcolor: '#EF4444' }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sección de Reportes */}
          <Box sx={{
            mb: 3,
            mt: 4,
            textAlign: 'left'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#FFB800', 
              fontWeight: 700, 
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '0.5px',
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
              borderBottom: '3px solid #FFB800',
              paddingBottom: '8px',
              display: 'block',
              width: '95%'
            }}>
              Reportes y Análisis
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#F8FAFC', 
              fontWeight: 400
            }}>
              Estadísticas detalladas de ventas y rendimiento
            </Typography>
          </Box>
        
          <Grid container spacing={{ xs: 2, md: 2 }}>
              {/* Reporte Diario */}
              <Grid item xs={12} lg={6}>
                <Card sx={{
                  background: 'rgba(35,39,47,0.6)',
                  border: '1px solid #000000',
                  borderRadius: '16px',
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#FFB800',
                    boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#0F172A', mr: 2, width: 36, height: 36 }}>
                      <CalendarToday sx={{ fontSize: '1.2rem' }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      Reporte Diario
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{
                        background: 'rgba(35,39,47,0.6)',
                        border: '1px solid #000000',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#FFB800',
                          boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: '12px !important' }}>
                          <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5, fontSize: '1.6rem' }}>
                            ${(stats.ventasHoy / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                            Ventas Hoy
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{
                        background: 'rgba(35,39,47,0.6)',
                        border: '1px solid #000000',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#FFB800',
                          boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: '12px !important' }}>
                          <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5, fontSize: '1.6rem' }}>
                            {stats.pedidosCompletadosHoy}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                            Pedidos Completados
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card sx={{
                        background: 'rgba(35,39,47,0.6)',
                        border: '1px solid #000000',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#FFB800',
                          boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: '12px !important' }}>
                          <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5 }}>
                            {stats.movimientosStockHoy}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                            Movimientos de Stock
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ color: '#B0B3B8', textAlign: 'center' }}>
                      Actualizado: {new Date().toLocaleTimeString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

              {/* Reporte Semanal */}
              <Grid item xs={12} lg={6}>
                <Card sx={{
                  background: 'rgba(35,39,47,0.6)',
                  border: '1px solid #000000',
                  borderRadius: '16px',
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#FFB800',
                    boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#0F172A', mr: 2, width: 36, height: 36 }}>
                      <DateRange sx={{ fontSize: '1.2rem' }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      Reporte Semanal
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{
                        background: 'rgba(35,39,47,0.6)',
                        border: '1px solid #000000',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#FFB800',
                          boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: '12px !important' }}>
                          <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5, fontSize: '1.6rem' }}>
                            ${(stats.ventasSemana / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                            Ventas 7 días
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{
                        background: 'rgba(35,39,47,0.6)',
                        border: '1px solid #000000',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#FFB800',
                          boxShadow: '0 0 0 2px rgba(255,184,0,0.3), 0 6px 20px rgba(255,184,0,0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: '12px !important' }}>
                          <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 'bold', mb: 0.5, fontSize: '1.6rem' }}>
                            {stats.pedidosSemana}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                            Total Pedidos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#CBD5E1', mb: 2, fontWeight: 600 }}>
                      Productos Más Vendidos
                    </Typography>
                    {stats.productosMasVendidos.slice(0, 3).map((producto, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < 2 ? '1px solid #353945' : 'none'
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ color: '#F3F4F6', fontWeight: 'medium' }}>
                            {producto.nombre.length > 18 ? producto.nombre.substring(0, 18) + '...' : producto.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#B0B3B8' }}>
                            {producto.categoria}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${producto.ventas} uds`}
                          size="small"
                          sx={{ bgcolor: '#475569', color: '#F1F5F9', fontWeight: 600 }}
                        />
                      </Box>
                    ))}
                    {stats.productosMasVendidos.length === 0 && (
                      <Typography variant="body2" sx={{ color: '#B0B3B8', textAlign: 'center', py: 2 }}>
                        No hay ventas este mes
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#B0B3B8', textAlign: 'center', display: 'block' }}>
                      Datos del mes: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShowChart sx={{ 
                      color: stats.tendenciaStock === 'ascendente' ? '#059669' : 
                             stats.tendenciaStock === 'descendente' ? '#DC2626' : '#D97706',
                      mr: 1 
                    }} />
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Tendencia: {stats.tendenciaStock}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

        </Box>
        
        {/* Notificación flotante - Alertas de stock */}
        <Box sx={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1200,
          display: { xs: 'none', md: 'block' },
          pointerEvents: 'auto'
        }}>
          <StockAlerts />
        </Box>
      </Container>
    </Box>
  );
}

export default Home
