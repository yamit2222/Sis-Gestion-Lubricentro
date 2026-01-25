import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { createPedido, updatePedido } from '../services/pedido.service';
import { getAllProductos } from '../services/producto.service';
import { getAllSubProductos } from '../services/subproducto.service';
import Swal from 'sweetalert2';

const PedidoForm = ({ open, onClose, pedido, onSuccess }) => {
  const [productos, setProductos] = useState([]);
  const [subProductos, setSubProductos] = useState([]);
  const [items, setItems] = useState([]);

  // Schema de validación con Yup
  const validationSchema = Yup.object({
    comentario: Yup.string()
      .required('El comentario es obligatorio')
      .min(5, 'El comentario debe tener al menos 5 caracteres')
      .max(500, 'El comentario no puede exceder 500 caracteres'),
    tipoItem: Yup.string()
      .required('Debe seleccionar el tipo de item')
      .oneOf(['producto', 'subproducto'], 'Tipo de item inválido'),
    itemSeleccionado: Yup.string()
      .required('Debe seleccionar un item'),
    cantidad: Yup.number()
      .required('La cantidad es obligatoria')
      .min(1, 'La cantidad debe ser mayor a 0')
      .integer('La cantidad debe ser un número entero'),
    estado: Yup.string()
      .required('El estado es obligatorio')
      .oneOf(['en proceso', 'vendido'], 'Estado inválido')
  });

  const handleClose = () => {
    // Limpiar el formulario solo si no estamos editando un pedido existente
    if (!pedido) {
      formik.resetForm({
        values: {
          comentario: '',
          tipoItem: 'producto',
          itemSeleccionado: '',
          cantidad: 1,
          estado: 'en proceso'
        }
      });
    }
    onClose();
  };

  const formik = useFormik({
    initialValues: {
      comentario: pedido?.comentario || '',
      tipoItem: pedido?.productoId ? 'producto' : pedido?.subproductoId ? 'subproducto' : 'producto',
      itemSeleccionado: pedido?.productoId || pedido?.subproductoId || '',
      cantidad: pedido?.cantidad || 1,
      estado: pedido?.estado || 'en proceso'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          comentario: values.comentario,
          cantidad: parseInt(values.cantidad),
          estado: values.estado
        };

        // Asignar el ID según el tipo seleccionado
        if (values.tipoItem === 'producto') {
          payload.productoId = parseInt(values.itemSeleccionado);
        } else if (values.tipoItem === 'subproducto') {
          payload.subproductoId = parseInt(values.itemSeleccionado);
        }

        if (pedido) {
          await updatePedido(pedido.id, payload);
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Pedido actualizado correctamente',
            showConfirmButton: false,
            timer: 1500,
            zIndex: 99999
          });
        } else {
          await createPedido(payload);
          Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'Pedido creado correctamente',
            showConfirmButton: false,
            timer: 1500,
            zIndex: 99999
          });
        }
        onSuccess();
        onClose();
      } catch (error) {
        // Si el backend devuelve errores de validación por campo
        if (error?.details && typeof error.details === 'object') {
          formik.setErrors(error.details);
        } else {
          const errorMessage = error.message === "Stock insuficiente" 
            ? "No hay suficiente stock para este pedido" 
            : (error.message || "Hubo un error al procesar la solicitud");
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            zIndex: 99999
          });
        }
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      // Cargar productos y subproductos en paralelo
      const [productosRes, subProductosRes] = await Promise.all([
        getAllProductos(),
        getAllSubProductos()
      ]);

      // Procesar productos
      let productosData = [];
      if (productosRes.data && productosRes.data.productos) {
        productosData = productosRes.data.productos;
      } else if (Array.isArray(productosRes.data)) {
        productosData = productosRes.data;
      } else if (Array.isArray(productosRes)) {
        productosData = productosRes;
      }
      
      // Procesar subproductos
      let subProductosData = [];
      if (subProductosRes.data && subProductosRes.data.subproductos) {
        subProductosData = subProductosRes.data.subproductos;
      } else if (Array.isArray(subProductosRes.data)) {
        subProductosData = subProductosRes.data;
      } else if (Array.isArray(subProductosRes)) {
        subProductosData = subProductosRes;
      }

      setProductos(productosData);
      setSubProductos(subProductosData);

      // Crear lista combinada de items para el selector
      const itemsCombinados = [
        ...productosData.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          stock: p.stock,
          type: 'producto',
          label: `${p.nombre} (Producto) - Stock: ${p.stock} - $${p.precio?.toLocaleString()}`
        })),
        ...subProductosData.map(sp => ({
          id: sp.id,
          nombre: sp.nombre,
          precio: sp.precio,
          stock: sp.stock,
          type: 'subproducto',
          label: `${sp.nombre} (ProductoPequeño) - Stock: ${sp.stock} - $${sp.precio?.toLocaleString()}`
        }))
      ];
      setItems(itemsCombinados);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setProductos([]);
      setSubProductos([]);
      setItems([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar productos'
      });
    }
  };

  const selectedItem = items.find(item => 
    item.id === parseInt(formik.values.itemSeleccionado) && item.type === formik.values.tipoItem
  );

  // Función para validar stock en tiempo real
  const validateStock = (item, cantidad) => {
    if (!item || !cantidad) return { isValid: true, message: '' };
    
    if (cantidad > item.stock) {
      return {
        isValid: false,
        message: `Stock insuficiente. Disponible: ${item.stock} unidades`
      };
    }
    
    if (item.stock === 0) {
      return {
        isValid: false,
        message: 'Producto sin stock disponible'
      };
    }
    
    if (cantidad > 0 && cantidad <= item.stock) {
      if (item.stock <= 5) {
        return {
          isValid: true,
          message: `⚠️ Stock crítico: ${item.stock} unidades restantes`,
          isWarning: true
        };
      }
      if (item.stock <= 10) {
        return {
          isValid: true,
          message: `⚠️ Stock bajo: ${item.stock} unidades restantes`,
          isWarning: true
        };
      }
    }
    
    return { isValid: true, message: '' };
  };

  const stockValidation = validateStock(selectedItem, formik.values.cantidad);

  // Las advertencias de stock se muestran ahora visualmente en los campos

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        zIndex: 1200
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          bgcolor: '#23272F',
          boxShadow: 4,
          '& .MuiDialogTitle-root': {
            bgcolor: '#23272F',
            color: '#FFB800',
            fontWeight: 800,
            fontSize: '2rem',
            letterSpacing: 1
          },
          '& .MuiDialogContent-root': {
            bgcolor: '#23272F',
            color: '#F3F4F6',
            borderRadius: 2
          },
          '& .MuiDialogActions-root': {
            bgcolor: '#23272F',
            borderTop: '1px solid #444',
            color: '#F3F4F6'
          }
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="span" sx={{ color: '#FFB800', fontWeight: 800, letterSpacing: 1 }}>
            {pedido ? 'Editar Pedido' : 'Nuevo Pedido'}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#F3F4F6', bgcolor: '#353945', borderRadius: 2 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="comentario"
                name="comentario"
                label="Comentario"
                value={formik.values.comentario}
                onChange={formik.handleChange}
                multiline
                rows={3}
                variant="outlined"
                margin="normal"
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.comentario)}
                helperText={formik.errors.comentario}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                id="tipoItem"
                name="tipoItem"
                label="Tipo de Item"
                value={formik.values.tipoItem}
                onChange={(e) => {
                  formik.setFieldValue('tipoItem', e.target.value);
                  formik.setFieldValue('itemSeleccionado', ''); // Limpiar selección al cambiar tipo
                }}
                variant="outlined"
                margin="normal"
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.tipoItem)}
                helperText={formik.errors.tipoItem}
              >
                <MenuItem value="producto">Productos</MenuItem>
                <MenuItem value="subproducto">Productos Pequeños</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ width: '100%', minWidth: '400px' }}>
                <Autocomplete
                  fullWidth
                  options={items.filter(item => item.type === formik.values.tipoItem)}
                  getOptionLabel={(option) => option.label || ''}
                  value={items.find(item => item.id === parseInt(formik.values.itemSeleccionado) && item.type === formik.values.tipoItem) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('itemSeleccionado', newValue.id);
                      formik.setFieldValue('tipoItem', newValue.type);
                    } else {
                      formik.setFieldValue('itemSeleccionado', '');
                      formik.setFieldValue('tipoItem', 'producto');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="itemSeleccionado"
                      name="itemSeleccionado"
                      label={formik.values.tipoItem === 'producto' ? 'Buscar Producto' : 'Buscar Producto Pequeño'}
                      placeholder={formik.values.tipoItem === 'producto' ? 'Escribe para buscar productos...' : 'Escribe para buscar productos pequeños...'}
                      variant="outlined"
                      margin="normal"
                      InputProps={{ 
                        ...params.InputProps,
                        sx: { 
                          bgcolor: '#2C303A', 
                          color: '#F3F4F6', 
                          borderRadius: 2,
                          minHeight: '60px',
                          minWidth: '100%',
                          fontSize: '1.1rem',
                          '& input': {
                            padding: '18px 20px',
                            fontSize: '1.1rem',
                            minWidth: '300px'
                          },
                          '& .MuiInputBase-root': {
                            minHeight: '60px',
                            minWidth: '100%'
                          }
                        } 
                      }}
                      InputLabelProps={{ 
                        sx: { 
                          color: '#FFB800',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transform: 'translate(20px, 22px) scale(1)',
                          transformOrigin: 'left top',
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(20px, -10px) scale(0.9)',
                            backgroundColor: '#23272F',
                            padding: '0 8px',
                            borderRadius: '4px',
                            fontSize: '1rem'
                          }
                        } 
                      }}
                      error={Boolean(formik.errors.itemSeleccionado) || (selectedItem && selectedItem.stock <= 0)}
                      helperText={
                        formik.errors.itemSeleccionado ||
                        (selectedItem && selectedItem.stock <= 0 && 
                          `⚠️ ${selectedItem.type === 'producto' ? 'Producto' : 'Producto Pequeño'} "${selectedItem.nombre}" sin stock disponible`)
                      }
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-popupIndicator': { 
                      color: '#FFB800',
                      padding: '12px'
                    },
                    '& .MuiAutocomplete-clearIndicator': { 
                      color: '#FFB800',
                      padding: '12px'
                    },
                    '& .MuiAutocomplete-inputRoot': {
                      minHeight: '60px',
                      minWidth: '100%',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFB800'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFB800'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FFB800'
                      }
                    },
                    '& .MuiAutocomplete-paper': {
                      bgcolor: '#23272F',
                      color: '#F3F4F6'
                    },
                    '& .MuiAutocomplete-listbox': {
                      bgcolor: '#23272F',
                      color: '#F3F4F6',
                      '& .MuiAutocomplete-option': {
                        color: '#F3F4F6',
                        '&:hover': {
                          bgcolor: '#353945'
                        },
                        '&.Mui-focused': {
                          bgcolor: '#353945'
                        }
                      }
                    }
                  }}
                  componentsProps={{
                    paper: {
                      sx: {
                        bgcolor: '#23272F',
                        color: '#F3F4F6',
                        border: '1px solid #FFB800'
                      }
                    }
                  }}
                />
              </Box>
              {selectedItem && (
                <Box sx={{ mt: 1, color: '#F3F4F6', fontSize: '0.875rem', p: 1, bgcolor: '#353945', borderRadius: 1 }}>
                  <strong>Marca:</strong> {selectedItem.marca} | <strong>Stock disponible:</strong> {selectedItem.stock}
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="cantidad"
                name="cantidad"
                label="Cantidad"
                type="number"
                value={formik.values.cantidad}
                onChange={(e) => {
                  const cantidad = parseInt(e.target.value) || 0;
                  
                  // Limitar automáticamente la cantidad al stock disponible
                  if (selectedItem && cantidad > selectedItem.stock) {
                    formik.setFieldValue('cantidad', selectedItem.stock);
                    return;
                  }
                  
                  formik.handleChange(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+' || e.key === '.') {
                    e.preventDefault();
                  }
                }}
                variant="outlined"
                margin="normal"
                inputProps={{ 
                  min: 1, 
                  max: selectedItem?.stock || 999999,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                InputProps={{ 
                  sx: { 
                    bgcolor: '#2C303A', 
                    color: '#F3F4F6', 
                    borderRadius: 2,
                    ...(selectedItem && selectedItem.stock <= 5 && {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#EF4444'
                      }
                    }),
                    ...(selectedItem && selectedItem.stock > 5 && selectedItem.stock <= 10 && {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#F59E0B'
                      }
                    })
                  } 
                }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.cantidad) || !stockValidation.isValid}
                helperText={
                  formik.errors.cantidad || 
                  stockValidation.message ||
                  (selectedItem ? `Stock disponible: ${selectedItem.stock} unidades` : '')
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                id="estado"
                name="estado"
                label="Estado"
                value={formik.values.estado}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                SelectProps={{ native: true }}
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' }, shrink: true }}
                error={Boolean(formik.errors.estado)}
                helperText={formik.errors.estado}
              >
                <option value="en proceso" style={{ color: '#F3F4F6', background: '#23272F' }}>En proceso</option>
                <option value="vendido" style={{ color: '#F3F4F6', background: '#23272F' }}>Vendido</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: '#23272F', borderTop: '1px solid #444' }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ borderColor: '#FFB800', color: '#FFB800', bgcolor: '#353945', borderRadius: 2, fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={formik.isSubmitting || !stockValidation.isValid}
            sx={{ 
              bgcolor: (!stockValidation.isValid) ? '#6B7280' : '#FFB800', 
              color: '#23272F', 
              borderRadius: 2, 
              fontWeight: 700, 
              boxShadow: 2,
              '&:disabled': {
                bgcolor: '#6B7280',
                color: '#9CA3AF'
              }
            }}
          >
            {!stockValidation.isValid ? 'Stock Insuficiente' : (pedido ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>

  );
};

export default PedidoForm;