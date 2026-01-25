import { useFormik } from 'formik';
import {Dialog,DialogTitle,DialogContent,DialogActions,TextField,Button,Box,IconButton,Typography,InputAdornment,Grid} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { createSubProducto, updateSubProducto } from '../services/subproducto.service';
import Swal from 'sweetalert2';

const SubProductoForm = ({ open, onClose, subproducto, onSuccess }) => {
  const formik = useFormik({
    initialValues: {
      nombre: subproducto?.nombre ?? '',
      codigosubP: subproducto?.codigosubP ?? '',
      descripcion: subproducto?.descripcion ?? '',
      precio: subproducto?.precio ?? 0,
      stock: subproducto?.stock ?? 0,
      marca: subproducto?.marca ?? '',
      categoria: subproducto?.categoria ?? ''
    },
    onSubmit: async (values, { setErrors }) => {      const payload = {
        ...values,
        codigosubP: Number(values.codigosubP),
        precio: Number(values.precio)
      };
      try {
        if (subproducto) {
          await updateSubProducto(subproducto.id, payload);
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Subproducto actualizado correctamente',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          await createSubProducto(payload);
          Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'SubProducto creado correctamente',
            showConfirmButton: false,
            timer: 1500
          });
        }
        onSuccess();
        onClose();
      } catch (error) {
        // Si el backend devuelve errores de validación por campo
        if (error?.details && typeof error.details === 'object') {
          setErrors(error.details);
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

  return (
    <Dialog 
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
            {subproducto ? 'Editar subProducto' : 'Nuevo subProducto'}
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
                InputProps={{
                  sx: {
                    bgcolor: '#2C303A',
                    color: '#F3F4F6',
                    borderRadius: 2
                  }
                }}
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
                InputProps={{
                  sx: {
                    bgcolor: '#2C303A',
                    color: '#F3F4F6',
                    borderRadius: 2
                  }
                }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.nombre)}
                helperText={formik.errors.nombre}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="codigosubP"
                name="codigosubP"
                label="CódigosubP"
                type="number"
                value={formik.values.codigosubP}
                onKeyDown={(e) => {
                  if (!/\d/.test(e.key) && 
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
                InputProps={{
                  inputProps: {
                    inputMode: "numeric",
                    pattern: "[0-9]*"
                  },
                  sx: {
                    bgcolor: '#2C303A',
                    color: '#F3F4F6',
                    borderRadius: 2
                  }
                }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.codigosubP)}
                helperText={formik.errors.codigosubP}
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
                InputProps={{
                  sx: {
                    bgcolor: '#2C303A',
                    color: '#F3F4F6',
                    borderRadius: 2
                  }
                }}
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
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) || value === '') {
                    formik.handleChange(e);
                  }
                }}
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: {
                    step: "1",
                    min: "0",
                    inputMode: "numeric",
                    pattern: "[0-9]*"
                  },
                  sx: {
                    bgcolor: '#2C303A',
                    color: '#F3F4F6',
                    borderRadius: 2
                  }
                }}
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
                InputProps={{
                  inputProps: {
                    min: "0",
                    inputMode: "numeric"
                  },
                  sx: {
                    bgcolor: '#2C303A',
                    color: '#F3F4F6',
                    borderRadius: 2
                  }
                }}
                InputLabelProps={{ sx: { color: '#FFB800' } }}
                error={Boolean(formik.errors.stock)}
                helperText={formik.errors.stock}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                id="categoria"
                name="categoria"
                label="Categoría"
                value={formik.values.categoria || ''}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                SelectProps={{ native: true }}
                InputProps={{ sx: { bgcolor: '#2C303A', color: '#F3F4F6', borderRadius: 2 } }}
                InputLabelProps={{ sx: { color: '#FFB800' }, shrink: true }}
                error={Boolean(formik.errors.categoria)}
                helperText={formik.errors.categoria}
              >
                <option value="" style={{ color: '#FFB800', background: '#23272F' }}>Selecciona una categoría</option>
                <option value="repuestos" style={{ color: '#F3F4F6', background: '#23272F' }}>Repuestos</option>
                <option value="limpieza" style={{ color: '#F3F4F6', background: '#23272F' }}>Limpieza</option>
                <option value="accesorios externos" style={{ color: '#F3F4F6', background: '#23272F' }}>Accesorios externos</option>
                <option value="accesorios eléctricos" style={{ color: '#F3F4F6', background: '#23272F' }}>Accesorios eléctricos</option>
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
            sx={{ bgcolor: '#FFB800', color: '#23272F', borderRadius: 2, fontWeight: 700, boxShadow: 2 }}          >
            {subproducto ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubProductoForm;
