import { useFormik } from 'formik';
import {Dialog,DialogTitle,DialogContent,DialogActions,TextField,Button,Box,IconButton,Typography,InputAdornment,Grid} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { createProducto, updateProducto } from '../services/producto.service';
import Swal from 'sweetalert2';



const ProductoForm = ({ open, onClose, producto, onSuccess }) => {
  const formik = useFormik({
    initialValues: {
      nombre: producto?.nombre || '',
      codigoP: producto?.codigoP || '',
      descripcion: producto?.descripcion || '',
      precio: producto?.precio || 0,
      stock: producto?.stock ?? 0,
      marca: producto?.marca || '',
      categoria: producto?.categoria || '',
      subcategoria: producto?.subcategoria || ''
    },
    onSubmit: async (values) => {
      try {        const payload = {
          ...values,
          codigoP: Number(values.codigoP),
          precio: Number(values.precio)
        };
        if (producto) {
          await updateProducto(producto.id, payload);
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Producto actualizado correctamente',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          await createProducto(payload);
          Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'Producto creado correctamente',
            showConfirmButton: false,
            timer: 1500
          });
        }
        onSuccess();
        onClose();
      } catch (error) {
        // Si el backend devuelve errores de validación por campo
        if (error?.details && typeof error.details === 'object') {
          formik.setErrors(error.details);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Hubo un error al procesar la solicitud'
          });
        }
      }
    },
    enableReinitialize: true
  });

  return (    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
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
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#F3F4F6', bgcolor: '#353945', borderRadius: 2 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="marca"
                name="marca"
                label="Marca"
                value={formik.values.marca}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.marca)}
                helperText={formik.errors.marca}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="nombre"
                name="nombre"
                label="Nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.nombre)}
                helperText={formik.errors.nombre}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="codigoP"
                name="codigoP"
                label="Código"
                type="number"
                value={formik.values.codigoP}
                onKeyDown={(e) => {
                  if (!/[\d]/.test(e.key) && 
                      e.key !== 'Backspace' && 
                      e.key !== 'Delete' && 
                      e.key !== 'ArrowLeft' && 
                      e.key !== 'ArrowRight' && 
                      e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) || value === '') {
                    formik.handleChange(e);
                  }
                }}
                variant="outlined"
                margin="normal"
                InputProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' }, sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.codigoP)}
                helperText={formik.errors.codigoP}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="descripcion"
                name="descripcion"
                label="Descripción"
                multiline
                rows={4}
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.descripcion)}
                helperText={formik.errors.descripcion}
              />
            </Grid>
            <Grid item xs={12} md={6}>              <TextField
                fullWidth
                id="precio"
                name="precio"
                label="Precio"
                type="number"
                value={formik.values.precio}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+' || e.key === '.') {
                    e.preventDefault();
                  }
                }}                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) || value === '') {
                    formik.handleChange(e);
                  }
                }}
                variant="outlined"
                margin="normal"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, inputProps: { min: '0', step: '1', inputMode: 'numeric', pattern: '[0-9]*' }, sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.precio)}
                helperText={formik.errors.precio}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="stock"
                name="stock"
                label="Stock"
                type="number"
                value={formik.values.stock}
                disabled
                variant="outlined"
                margin="normal"
                InputProps={{ inputProps: { min: '0', inputMode: 'numeric' }, sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.stock)}
                helperText={formik.errors.stock}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                required
                fullWidth
                id="categoria"
                name="categoria"
                label="Categoría"
                value={formik.values.categoria ? String(formik.values.categoria) : ''}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                SelectProps={{ native: true }}
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800', fontSize: '0.95em', fontWeight: 500 }, shrink: true }}
                error={Boolean(formik.errors.categoria)}
                helperText={formik.errors.categoria}
              >
                <option value="" style={{ color: '#FFB800', background: '#23272F' }}>Selecciona una categoría</option>
                <option value="aceite" style={{ color: '#F3F4F6', background: '#23272F' }}>Aceite</option>
                <option value="filtro" style={{ color: '#F3F4F6', background: '#23272F' }}>Filtro</option>
                <option value="bateria" style={{ color: '#F3F4F6', background: '#23272F' }}>Batería</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                id="subcategoria"
                name="subcategoria"
                label="Subcategoría"
                value={formik.values.subcategoria || ''}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                SelectProps={{ native: true }}
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' }, shrink: true }}
                error={Boolean(formik.errors.subcategoria)}
                helperText={formik.errors.subcategoria}
              >
                <option value="" style={{ color: '#FFB800', background: '#23272F' }}>Selecciona una subcategoría</option>
                <option value="auto" style={{ color: '#F3F4F6', background: '#23272F' }}>Auto</option>
                <option value="camioneta" style={{ color: '#F3F4F6', background: '#23272F' }}>Camioneta</option>
                <option value="vehiculo comercial" style={{ color: '#F3F4F6', background: '#23272F' }}>Vehículo comercial</option>
                <option value="motocicleta" style={{ color: '#F3F4F6', background: '#23272F' }}>Motocicleta</option>
                <option value="maquinaria" style={{ color: '#F3F4F6', background: '#23272F' }}>Maquinaria</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: '#23272F', borderTop: '1px solid #444' }}>
          <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderColor: '#FFB800', color: '#FFB800', bgcolor: '#353945', borderRadius: 2, fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={formik.isSubmitting}
            sx={{ bgcolor: '#FFB800', color: '#23272F', borderRadius: 2, fontWeight: 700, boxShadow: 2 }}
          >
            {producto ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductoForm;
