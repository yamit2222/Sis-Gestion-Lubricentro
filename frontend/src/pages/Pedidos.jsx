import { useState, useEffect } from 'react';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getPedidos, createPedido, updatePedido, deletePedido } from "../services/pedido.service";
import Search from '../components/Search';
import PedidoForm from '../components/PedidoForm';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '@styles/colors.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB800', 
      contrastText: '#1A1A1A', 
    },
    secondary: {
      main: '#1A1A1A', 
      contrastText: '#FFB800', 
    },
    error: {
      main: '#D72638', 
    },
    background: {
      default: '#D9D9D9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', 
      secondary: '#4E4E4E', 
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: 'var(--amarillo-potente)',
          color: 'var(--negro-profundo)',
          '&:hover': {
            backgroundColor: 'var(--amarillo-potente-30)',
          },
        },
        outlined: {
          borderColor: 'var(--amarillo-potente)',
          color: 'var(--amarillo-potente)',
          '&:hover': {
            borderColor: 'var(--amarillo-potente)',
            backgroundColor: 'var(--amarillo-potente-10)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--color-fondo-secundario)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#10B981', // Verde esmeralda
            color: 'white',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#EF4444', // Rojo coral
            color: 'white',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#F59E0B', // Naranja ámbar
            color: 'white',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: '#3B82F6', // Azul cielo
            color: 'white',
          },
          '&.MuiChip-colorDefault': {
            backgroundColor: '#6B7280', // Gris pizarra
            color: 'white',
          },
        },
      },
    },
  },
});

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'grid' o 'list'
  
  // Estados para filtros de fecha
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const limite = 10;

  useEffect(() => {
    loadPedidos();
  }, [paginaActual]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPedidos(paginaActual, limite);
      
      // Manejar la respuesta dependiendo de la estructura
      const pedidosData = Array.isArray(response.data) ? response.data : (response.data?.pedidos || response);
      
      setPedidos(pedidosData || []);
      setFilteredPedidos(pedidosData || []);
      
      // Si hay datos de paginación, usarlos
      if (response.data?.totalPaginas) {
        setTotalPaginas(response.data.totalPaginas);
        setTotalPedidos(response.data.totalPedidos || 0);
      } else {
        // Si no hay paginación, usar longitud del array
        setTotalPaginas(Math.ceil((pedidosData?.length || 0) / limite));
        setTotalPedidos(pedidosData?.length || 0);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setError('No se pudieron cargar los pedidos');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pedidos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarlo!'
      });

      if (result.isConfirmed) {
        await deletePedido(id);
        await loadPedidos(); // Recargar los datos
        Swal.fire(
          'Eliminado!',
          'El pedido ha sido eliminado.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el pedido'
      });
    }
  };

  const handleEdit = (pedido) => {
    setSelectedPedido(pedido);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedPedido(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPedido(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadPedidos();
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredPedidos(pedidos);
      return;
    }
    
    const filtered = pedidos.filter(pedido =>
      pedido.comentario?.toLowerCase().includes(query.toLowerCase()) ||
      pedido.Producto?.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      pedido.estado?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPedidos(filtered);
  };

  // Función para generar PDF de pedidos
  const generarPedidosPDF = async () => {
    try {
      const pedidosMesCompletos = getPedidosPorMes();
      
      // Filtrar para excluir pedidos completados y cancelados
      const pedidosMes = pedidosMesCompletos.filter(p => 
        p.estado !== 'completado' && p.estado !== 'cancelado'
      );
      
      if (pedidosMes.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: `No hay pedidos activos registrados para ${mesSeleccionado}/${añoSeleccionado}`,
          confirmButtonColor: '#FFB800'
        });
        return;
      }

      const doc = new jsPDF();
      
      // Configurar fuentes y colores
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(25, 39, 47);
      
      // Título
      doc.text('REPORTE DE PEDIDOS ACTIVOS', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Subtítulo con mes y año
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const nombreMes = mesesNombres[mesSeleccionado - 1];
      doc.text(`${nombreMes} ${añoSeleccionado}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      
      // Línea decorativa
      doc.setLineWidth(0.5);
      doc.setDrawColor(255, 184, 0);
      doc.line(20, 35, 190, 35);
      
      // Resumen estadístico
      const estadosPedidos = {
        'en proceso': pedidosMes.filter(p => p.estado === 'en proceso').length,
        'vendido': pedidosMes.filter(p => p.estado === 'vendido').length
      };
      
      const totalCantidad = pedidosMes.reduce((sum, p) => sum + (parseInt(p.cantidad) || 0), 0);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN ESTADÍSTICO:', 20, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de pedidos activos: ${pedidosMes.length}`, 20, 60);
      doc.text(`En proceso: ${estadosPedidos['en proceso']}`, 20, 68);
      doc.text(`Vendidos: ${estadosPedidos['vendido']}`, 20, 76);
      doc.text(`Total unidades pedidas: ${totalCantidad}`, 20, 84);
      
      // Fecha de generación
      doc.setFontSize(10);
      const fechaHoy = new Date();
      doc.text(`Generado el: ${fechaHoy.toLocaleDateString('es-ES')} a las ${fechaHoy.toLocaleTimeString('es-ES')}`, 20, 92);
      
      // Tabla de pedidos
      const columns = ['Fecha', 'Producto', 'Cantidad', 'Estado', 'Usuario', 'Comentario'];
      const rows = pedidosMes.map(pedido => [
        new Date(pedido.createdAt).toLocaleDateString('es-ES'),
        pedido.Producto?.nombre || pedido.SubProducto?.nombre || 'N/A',
        pedido.cantidad?.toString() || '0',
        pedido.estado || 'N/A',
        pedido.Usuario?.nombreCompleto || 'N/A',
        pedido.comentario || '-'
      ]);
      
      autoTable(doc, {
        startY: 95,
        head: [columns],
        body: rows,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [255, 184, 0],
          textColor: [25, 39, 47],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 45 },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
          4: { cellWidth: 35 },
          5: { cellWidth: 45 }
        }
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `SWLubricentro - Reporte de Pedidos - Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2, 285, { align: 'center' }
        );
      }
      
      // Descargar el PDF
      const nombreArchivo = `reporte-pedidos-${mesSeleccionado.toString().padStart(2, '0')}-${añoSeleccionado}.pdf`;
      doc.save(nombreArchivo);
      
      Swal.fire({
        icon: 'success',
        title: 'Reporte generado!',
        text: 'El archivo PDF se ha descargado correctamente',
        showConfirmButton: false,
        timer: 2000
      });
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al generar el PDF. Inténtalo de nuevo.',
        confirmButtonColor: '#FFB800'
      });
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'vendido':
      case 'completado':
      case 'entregado':
        return 'success'; // Verde esmeralda
      case 'en proceso':
      case 'procesando':
      case 'preparando':
        return 'info'; // Azul cielo
      case 'pendiente':
      case 'esperando':
      case 'revision':
        return 'warning'; // Naranja ámbar
      case 'cancelado':
      case 'rechazado':
      case 'anulado':
        return 'error'; // Rojo coral
      default:
        return 'default'; // Gris pizarra
    }
  };

  // Función para filtrar pedidos por mes y año
  const getPedidosPorMes = () => {
    return filteredPedidos.filter(pedido => {
      const fecha = new Date(pedido.createdAt);
      return fecha.getMonth() + 1 === mesSeleccionado && fecha.getFullYear() === añoSeleccionado;
    });
  };

  // Generar opciones de meses
  const meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  // Generar opciones de años (los últimos 5 años)
  const añoActual = new Date().getFullYear();
  const años = Array.from({ length: 5 }, (_, i) => añoActual - i);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            background: '-webkit-linear-gradient(90deg, #23272f,#353945,#4e4e4e)',
            background: 'linear-gradient(90deg, #23272f,#353945,#4e4e4e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={60} sx={{ color: '#FFB800' }} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
      <div style={{ minHeight: '100vh', backgroundImage: 'linear-gradient(90deg, #23272f,#353945,#4e4e4e)', padding: 0, overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ mt: '12vh', mb: 4 }}>
          {/* Primera Sección: Título y Filtros */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
              Gestión de Pedidos
            </Typography>
          </Box>
          
          {/* Sección de filtros y exportación PDF */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#23272F', color: '#F3F4F6', borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#2C303A', borderRadius: 2 }}>
                  <InputLabel sx={{ color: '#FFB800' }}>Mes</InputLabel>
                  <Select
                    value={mesSeleccionado}
                    label="Mes"
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                    sx={{ bgcolor: '#2C303A', color: '#F3F4F6', '& .MuiSelect-select': { color: '#F3F4F6' } }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#23272F',
                          color: '#F3F4F6',
                        },
                      },
                    }}
                  >
                    {meses.map(mes => (
                      <MenuItem key={mes.valor} value={mes.valor} sx={{ bgcolor: '#23272F', color: '#F3F4F6' }}>
                        {mes.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#2C303A', borderRadius: 2 }}>
                  <InputLabel sx={{ color: '#FFB800' }}>Año</InputLabel>
                  <Select
                    value={añoSeleccionado}
                    label="Año"
                    onChange={(e) => setAñoSeleccionado(e.target.value)}
                    sx={{ bgcolor: '#2C303A', color: '#F3F4F6', '& .MuiSelect-select': { color: '#F3F4F6' } }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#23272F',
                          color: '#F3F4F6',
                        },
                      },
                    }}
                  >
                    {años.map(año => (
                      <MenuItem key={año} value={año} sx={{ bgcolor: '#23272F', color: '#F3F4F6' }}>
                        {año}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={generarPedidosPDF}
                  sx={{
                    bgcolor: '#D32F2F',
                    color: 'white',
                    borderRadius: 2,
                    fontWeight: 700,
                    px: 3,
                    '&:hover': {
                      bgcolor: '#B71C1C'
                    }
                  }}
                >
                  Generar PDF
                </Button>
              </Grid>
            </Grid>
            <Typography variant="body2" sx={{ color: '#FFB800', mt: 1, textAlign: 'center' }}>
              Pedidos del mes seleccionado: {getPedidosPorMes().length}
            </Typography>
          </Paper>

          {/* Segunda Sección: Gestión de Pedidos */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3,
              bgcolor: '#23272F',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              border: '2px solid #FFB800',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  color="primary"
                  startIcon={<ViewModuleIcon />}
                  onClick={() => setViewMode('grid')}
                  sx={{ borderRadius: 2, bgcolor: viewMode === 'grid' ? '#23272F' : undefined, color: viewMode === 'grid' ? '#F3F4F6CC' : '#FFB800', border: viewMode === 'grid' ? '2px solid #FFB800' : undefined }}
                >
                  Cuadrado
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  color="primary"
                  startIcon={<ViewListIcon />}
                  onClick={() => setViewMode('list')}
                  sx={{ borderRadius: 2, bgcolor: viewMode === 'list' ? '#23272F' : undefined, color: viewMode === 'list' ? '#F3F4F6CC' : '#FFB800', border: viewMode === 'list' ? '2px solid #FFB800' : undefined }}
                >
                  Lista
                </Button>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                size="large"
                sx={{ bgcolor: '#FFB800', color: '#23272F', borderRadius: 2, fontWeight: 700, boxShadow: 2 }}
              >
                Nuevo Pedido
              </Button>
            </Box>

            <Search 
              onSearch={handleSearch} 
              placeholder="Buscar por comentario, producto o estado..." 
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#F3F4F6CC' }}>
                Total de pedidos: {totalPedidos}
              </Typography>
            </Box>

            {filteredPedidos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: '#F3F4F6CC', mb: 1 }}>
                  No hay pedidos disponibles
                </Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>
                  {pedidos.length === 0 
                    ? 'Crea tu primer pedido haciendo clic en "Nuevo Pedido"' 
                    : 'No hay pedidos que coincidan con tu búsqueda'}
                </Typography>
              </Box>
            ) : null}

            {filteredPedidos.length > 0 && viewMode === 'list' ? (
              <Paper sx={{ mt: 2, bgcolor: '#23272F', color: '#F3F4F6', borderRadius: 2 }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#F3F4F6' }}>
                    <thead>
                      <tr style={{ background: '#353945', color: '#FFB800' }}>
                        <th style={{ padding: 8, textAlign: 'left' }}>Comentario</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Producto</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Cantidad</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Usuario</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Estado</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPedidos.map((pedido) => (
                        <tr key={pedido.id} style={{ 
                          borderBottom: '1px solid #353945', 
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 184, 0, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => handleEdit(pedido)}>
                          <td style={{ padding: 8, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pedido.comentario || 'Sin comentario'}</td>
                          <td style={{ padding: 8 }}>
                            {pedido.Producto?.nombre || pedido.SubProducto?.nombre || 'Producto no encontrado'}
                            {pedido.SubProducto && ' (Producto Pequeño)'}
                          </td>
                          <td style={{ padding: 8 }}>{pedido.cantidad}</td>
                          <td style={{ padding: 8 }}>{pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString() : pedido.hora || 'Sin fecha'}</td>
                          <td style={{ padding: 8 }}>{pedido.Usuario?.nombreCompleto || 'N/A'}</td>
                          <td style={{ padding: 8 }}>
                            <Chip
                              label={pedido.estado || 'en proceso'}
                              color={getEstadoColor(pedido.estado)}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </td>
                          <td style={{ padding: 8 }}>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(pedido);
                                }}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(pedido.id);
                                }}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            ) : null}

            {filteredPedidos.length > 0 && viewMode === 'grid' && (
              // Vista de cuadrícula usando Cards
              <Grid container spacing={3}>
                {filteredPedidos.map((pedido) => (
                  <Grid item xs={12} sm={6} md={4} key={pedido.id}>
                    <Card
                      sx={{
                        bgcolor: '#353945',
                        color: '#F3F4F6',
                        borderRadius: 2,
                        border: '1px solid #4E525A',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(255, 184, 0, 0.2)',
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="div" gutterBottom noWrap sx={{ color: '#FFB800' }}>
                          {pedido.Producto?.nombre || 'Producto no encontrado'}
                        </Typography>
                        <Typography color="#F3F4F6CC" gutterBottom>
                          {pedido.comentario || 'Sin comentario'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#F3F4F6CC' }}>
                            Cantidad: {pedido.cantidad}
                          </Typography>
                          <Chip
                            label={pedido.estado || 'en proceso'}
                            color={getEstadoColor(pedido.estado)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#F3F4F6CC', fontSize: '0.875rem' }}>
                          {pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString() : pedido.hora || 'Sin fecha'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => handleEdit(pedido)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => handleDelete(pedido.id)}
                            sx={{ color: '#D72638' }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPaginas}
                  page={paginaActual}
                  onChange={(event, value) => setPaginaActual(value)}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#F3F4F6CC',
                      borderColor: '#FFB800',
                    },
                    '& .MuiPaginationItem-page.Mui-selected': {
                      bgcolor: '#FFB800',
                      color: '#23272F',
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
          
          {/* Modal para crear/editar pedido */}
          <PedidoForm
            open={isFormOpen}
            onClose={handleFormClose}
            pedido={selectedPedido}
            onSuccess={handleFormSuccess}
          />
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default Pedidos;
