import { useEffect, useState } from 'react';
import { getMovimientos, createMovimiento } from '../services/movimientoStock.service';
import { getAllProductos } from '../services/producto.service';
import { getAllSubProductos } from '../services/subproducto.service';
import { Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, Paper, Grid, IconButton, Tooltip, Autocomplete } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [subProductos, setSubProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemId: '', itemType: 'producto', tipo: 'entrada', cantidad: '', observacion: '' });
  const [loading, setLoading] = useState(false);
  const [stockValidation, setStockValidation] = useState({ isValid: true, message: '' });
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const loadMovimientos = async () => {
    setLoading(true);
    try {
      const response = await getMovimientos();
      setMovimientos(Array.isArray(response) ? response : (response.data || []));
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = async () => {
    const data = await getAllProductos();
    // Manejar la nueva estructura de respuesta con paginación
    if (data.data && data.data.productos) {
      setProductos(data.data.productos);
    } else if (Array.isArray(data.data)) {
      setProductos(data.data);
    } else if (Array.isArray(data)) {
      setProductos(data);
    } else {
      setProductos([]);
    }
  };

  const loadSubProductos = async () => {
    try {
      const data = await getAllSubProductos();
      if (data.data && data.data.subproductos) {
        setSubProductos(data.data.subproductos);
      } else if (Array.isArray(data.data)) {
        setSubProductos(data.data);
      } else if (Array.isArray(data)) {
        setSubProductos(data);
      } else {
        setSubProductos([]);
      }
    } catch (error) {
      console.error('Error al cargar subproductos:', error);
      setSubProductos([]);
    }
  };

  const combinarItems = () => {
    const productosFormateados = productos.map(p => ({
      ...p,
      tipo: 'producto',
      label: `${p.nombre} (Producto) - Stock: ${p.stock}`
    }));
    
    const subProductosFormateados = subProductos.map(sp => ({
      ...sp,
      tipo: 'subproducto',
      label: `${sp.nombre} (Producto Pequeño) - Stock: ${sp.stock}`
    }));
    
    setItems([...productosFormateados, ...subProductosFormateados]);
  };

  const validateStock = (itemId, itemType, tipo, cantidad) => {
    if (!itemId || !cantidad || tipo === 'entrada') {
      return { isValid: true, message: '' };
    }

    const selectedItem = items.find(item => item.id === itemId && item.tipo === itemType);
    if (!selectedItem) {
      return { isValid: false, message: 'Item no encontrado' };
    }

    const cantidadNum = parseInt(cantidad) || 0;

    if (tipo === 'salida') {
      if (selectedItem.stock === 0) {
        return { 
          isValid: false, 
          message: `${selectedItem.tipo === 'producto' ? 'Producto' : 'Producto Pequeño'} "${selectedItem.nombre}" sin stock disponible` 
        };
      }
      
      if (cantidadNum > selectedItem.stock) {
        return { 
          isValid: false, 
          message: `Stock insuficiente. Disponible: ${selectedItem.stock}, Solicitado: ${cantidadNum}` 
        };
      }

      if (selectedItem.stock <= 5) {
        return { 
          isValid: true, 
          message: `Stock crítico: ${selectedItem.stock} unidades restantes`,
          isWarning: true
        };
      }
      
      if (selectedItem.stock <= 10) {
        return { 
          isValid: true, 
          message: `Stock bajo: ${selectedItem.stock} unidades restantes`,
          isWarning: true
        };
      }
    }

    return { isValid: true, message: '' };
  };

  useEffect(() => {
    loadMovimientos();
    loadProductos();
    loadSubProductos();
  }, []);

  useEffect(() => {
    combinarItems();
  }, [productos, subProductos]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newForm = { ...form };
    
    if (name === 'cantidad') {
      // Solo permitir números enteros positivos
      const intValue = value.replace(/[^0-9]/g, '');
      newForm = { ...form, [name]: intValue };
    } else {
      newForm = { ...form, [name]: value };
    }
    
    setForm(newForm);
    
    // Validar stock en tiempo real
    const validation = validateStock(newForm.itemId, newForm.itemType, newForm.tipo, newForm.cantidad);
    setStockValidation(validation);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.itemId || !form.cantidad || !form.itemType) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos obligatorios',
        confirmButtonColor: '#FFB800'
      });
      return;
    }
    
    // Validar stock antes de enviar (solo para salidas)
    if (form.tipo === 'salida') {
      const validation = validateStock(form.itemId, form.itemType, form.tipo, form.cantidad);
      if (!validation.isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Error de Stock',
          text: validation.message,
          confirmButtonColor: '#FFB800'
        });
        return;
      }
    }
    
    try {
      const movimientoData = { 
        itemId: parseInt(form.itemId, 10),
        itemType: form.itemType,
        tipo: form.tipo,
        cantidad: parseInt(form.cantidad, 10),
        observacion: form.observacion || ''
      };
      
      const response = await createMovimiento(movimientoData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Movimiento registrado!',
        text: 'El movimiento se ha registrado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      setForm({ itemId: '', itemType: 'producto', tipo: 'entrada', cantidad: '', observacion: '' });
      setStockValidation({ isValid: true, message: '' });
      loadMovimientos();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error || error.message || 'Error al registrar el movimiento',
        confirmButtonColor: '#FFB800'
      });
    }
  };

  // Función para filtrar movimientos por mes y año
  const getMovimientosPorMes = () => {
    return movimientos.filter(mov => {
      const fecha = new Date(mov.createdAt);
      return fecha.getMonth() + 1 === mesSeleccionado && fecha.getFullYear() === añoSeleccionado;
    });
  };

  // Función para generar PDF del resumen mensual
  const generarResumenPDF = async () => {
    try {
      const movimientosMes = getMovimientosPorMes();
      
      if (movimientosMes.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: `No hay movimientos registrados para ${mesSeleccionado}/${añoSeleccionado}`,
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
      doc.text('RESUMEN DE MOVIMIENTOS DE STOCK', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
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
      const entradas = movimientosMes.filter(m => m.tipo === 'entrada');
      const salidas = movimientosMes.filter(m => m.tipo === 'salida');
      const totalEntradas = entradas.reduce((sum, m) => sum + parseInt(m.cantidad || 0), 0);
      const totalSalidas = salidas.reduce((sum, m) => sum + parseInt(m.cantidad || 0), 0);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN ESTADISTICO:', 20, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de movimientos: ${movimientosMes.length}`, 20, 60);
      doc.text(`Entradas: ${entradas.length} movimientos (${totalEntradas} unidades)`, 20, 68);
      doc.text(`Salidas: ${salidas.length} movimientos (${totalSalidas} unidades)`, 20, 76);
      
      // Fecha de generación
      doc.setFontSize(10);
      const fechaHoy = new Date();
      doc.text(`Generado el: ${fechaHoy.toLocaleDateString('es-ES')} a las ${fechaHoy.toLocaleTimeString('es-ES')}`, 20, 84);
      
      // Tabla de movimientos
      const columns = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario', 'Observacion'];
      const rows = movimientosMes.map(mov => [
        new Date(mov.createdAt).toLocaleDateString('es-ES'),
        mov.item ? 
          `${mov.item.nombre}${mov.item.tipo === 'subproducto' ? ' (Producto Pequeño)' : ''}` : 
          (mov.Producto && mov.Producto.nombre) ? mov.Producto.nombre : 'N/A',
        mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
        mov.cantidad ? mov.cantidad.toString() : '0',
        mov.Usuario?.nombreCompleto || 'N/A',
        mov.observacion || '-'
      ]);
      
      autoTable(doc, {
        startY: 92,
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
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 15 },
          4: { cellWidth: 35 },
          5: { cellWidth: 50 }
        }
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `SWLubricentro - Sistema de Gestion de Inventario - Pagina ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2, 285, { align: 'center' }
        );
      }
      
      // Descargar el PDF
      const nombreArchivo = `resumen-movimientos-${mesSeleccionado.toString().padStart(2, '0')}-${añoSeleccionado}.pdf`;
      doc.save(nombreArchivo);
      
      Swal.fire({
        icon: 'success',
        title: 'Resumen generado!',
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

  // Generar opciones de años (últimos 5 años + año actual + próximo año)
  const añoActual = new Date().getFullYear();
  const años = [];
  for (let i = añoActual - 3; i <= añoActual + 1; i++) {
    años.push(i);
  }

  return (
      <div style={{ minHeight: '100vh', backgroundImage: 'linear-gradient(90deg, #23272f,#353945,#4e4e4e)', padding: 0, overflow: 'hidden' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#FFB800', fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
            Movimientos de Stock
          </Typography>
        </Box>
        
        {/* Sección de filtros y exportación PDF */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#23272F', color: '#F3F4F6', borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
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
                onClick={() => {
                  console.log('Botón PDF clickeado');
                  generarResumenPDF();
                }}
                sx={{
                  bgcolor: '#D32F2F',
                  color: 'white',
                  borderRadius: 2,
                  fontWeight: 700,
                  px: 3,
                  border: 'none',
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
            Movimientos del mes seleccionado: {getMovimientosPorMes().length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 4, bgcolor: '#23272F', color: '#F3F4F6', borderRadius: 3, border: '2px solid #FFB800', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', background: '#23272F', color: '#F3F4F6', borderRadius: 8, padding: 8 }}>
            <Box sx={{ minWidth: 300 }}>
              <Autocomplete
                size="small"
                options={items}
                getOptionLabel={(option) => option.label || ''}
                value={items.find(item => item.id === form.itemId) || null}
                onChange={(event, newValue) => {
                  let newForm;
                  if (newValue) {
                    newForm = {
                      ...form,
                      itemId: newValue.id,
                      itemType: newValue.tipo
                    };
                  } else {
                    newForm = {
                      ...form,
                      itemId: '',
                      itemType: 'producto'
                    };
                  }
                  
                  setForm(newForm);
                  
                  // Validar stock cuando se selecciona un item
                  const validation = validateStock(newForm.itemId, newForm.itemType, newForm.tipo, newForm.cantidad);
                  setStockValidation(validation);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar Producto o Producto Pequeño"
                    placeholder="Escribe para buscar..."
                    required
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        bgcolor: '#2C303A',
                        color: '#F3F4F6',
                        borderRadius: 2,
                        '& input': {
                          color: '#F3F4F6 !important',
                          padding: '10px 14px !important'
                        },
                        '& .MuiAutocomplete-endAdornment': {
                          '& svg': {
                            color: '#FFB800'
                          }
                        }
                      }
                    }}
                    InputLabelProps={{
                      sx: {
                        color: '#FFB800',
                        '&.Mui-focused': {
                          color: '#FFB800'
                        }
                      }
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{
                      bgcolor: '#23272F',
                      color: '#F3F4F6',
                      '&:hover': {
                        bgcolor: '#353945'
                      },
                      '&.Mui-focused': {
                        bgcolor: '#353945'
                      }
                    }}
                  >
                    {option.label}
                  </Box>
                )}
                PaperComponent={({ children, ...other }) => (
                  <Paper
                    {...other}
                    sx={{
                      bgcolor: '#23272F',
                      border: '1px solid #FFB800',
                      borderRadius: 2,
                      '& .MuiAutocomplete-listbox': {
                        maxHeight: 200,
                        bgcolor: '#23272F'
                      }
                    }}
                  >
                    {children}
                  </Paper>
                )}
                limitTags={2}
                filterOptions={(options, { inputValue }) => {
                  return options.filter(option =>
                    option.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
              />
            </Box>
            <FormControl sx={{ minWidth: 120, bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 }} size="small">
              <InputLabel sx={{ color: '#FFB800' }}>Tipo</InputLabel>
              <Select
                name="tipo"
                value={form.tipo}
                label="Tipo"
                onChange={handleChange}
                required
                sx={{ bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2, '& .MuiSelect-select': { color: '#F3F4F6' } }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#23272F',
                      color: '#F3F4F6',
                    },
                  },
                }}
              >
                <MenuItem value="entrada" sx={{ bgcolor: '#23272F', color: '#F3F4F6' }}>Entrada</MenuItem>
                <MenuItem value="salida" sx={{ bgcolor: '#23272F', color: '#F3F4F6' }}>Salida</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              name="cantidad" 
              label="Cantidad" 
              type="number" 
              size="small" 
              value={form.cantidad} 
              onChange={handleChange} 
              required 
              error={!stockValidation.isValid}
              helperText={stockValidation.message}
              inputProps={{ 
                min: 1, 
                step: 1,
                pattern: "[0-9]*" 
              }}
              sx={{ 
                width: 150, 
                bgcolor: '#2C303A', 
                color: '#F3F4F6', 
                borderRadius: 2, 
                input: { color: '#F3F4F6', background: '#2C303A' },
                '& .MuiFormHelperText-root': {
                  color: !stockValidation.isValid ? '#EF4444' : (stockValidation.isWarning ? '#F59E0B' : '#10B981'),
                  fontSize: '0.75rem',
                  margin: '3px 14px 0',
                  fontWeight: 500
                }
              }} 
              InputLabelProps={{ sx: { color: '#FFB800' } }} 
              InputProps={{ 
                sx: { 
                  color: '#F3F4F6',
                  ...((!stockValidation.isValid) && {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#EF4444'
                    }
                  }),
                  ...(stockValidation.isWarning && {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#F59E0B'
                    }
                  })
                } 
              }} 
            />
            <TextField
              name="observacion"
              label="Observación"
              size="small"
              value={form.observacion}
              onChange={handleChange}
              sx={{ width: 200, bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 }}
              InputLabelProps={{ sx: { color: '#FFB800' } }}
              InputProps={{ sx: { color: '#F3F4F6' } }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={!form.itemId || !form.cantidad || (form.tipo === 'salida' && !stockValidation.isValid)}
              sx={{ 
                bgcolor: (!form.itemId || !form.cantidad || (form.tipo === 'salida' && !stockValidation.isValid)) ? '#6B7280' : '#FFB800', 
                color: '#23272F', 
                borderRadius: 2, 
                fontWeight: 700,
                '&:disabled': {
                  bgcolor: '#6B7280',
                  color: '#9CA3AF'
                }
              }}
            >
              {(form.tipo === 'salida' && !stockValidation.isValid) ? 'Stock Insuficiente' : 'Registrar'}
            </Button>
          </form>
        </Paper>
        <Paper sx={{ mt: 2, bgcolor: '#23272F', color: '#F3F4F6', borderRadius: 2, border: '2px solid #FFB800', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#F3F4F6' }}>
              <thead>
                <tr style={{ background: '#353945', color: '#FFB800' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Producto</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Cantidad</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Usuario</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Observación</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(movimientos) && getMovimientosPorMes().map((mov) => (
                  <tr key={mov.id} style={{ borderBottom: '1px solid #353945' }}>
                    <td style={{ padding: 8 }}>{new Date(mov.createdAt).toLocaleString()}</td>
                    <td style={{ padding: 8 }}>
                      {mov.item ? 
                        `${mov.item.nombre} ${mov.item.tipo === 'subproducto' ? '(Producto Pequeño)' : ''}` : 
                        mov.Producto?.nombre || 'N/A'
                      }
                    </td>
                    <td style={{ padding: 8, color: mov.tipo === 'entrada' ? '#10B981' : '#EF4444' }}>
                      {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                    </td>
                    <td style={{ padding: 8 }}>{mov.cantidad}</td>
                    <td style={{ padding: 8 }}>{mov.Usuario?.nombreCompleto || 'N/A'}</td>
                    <td style={{ padding: 8 }}>{mov.observacion}</td>
                  </tr>
                ))}
                {getMovimientosPorMes().length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#FFB800' }}>
                      No hay movimientos para el mes seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default Movimientos;
