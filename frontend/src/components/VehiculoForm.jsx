import { useFormik } from "formik";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { vehiculoService } from "../services/vehiculo.service";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";

const VehiculoForm = ({ open, onClose, vehiculo, onSuccess }) => {
  const formik = useFormik({
    initialValues: {
      Marca: vehiculo?.Marca || "",
      Modelo: vehiculo?.Modelo || "",
      Año: vehiculo?.Año || "",
      Filtro_de_aire: vehiculo?.Filtro_de_aire || "",
      Filtro_de_aceite: vehiculo?.Filtro_de_aceite || "",
      Filtro_de_combustible: vehiculo?.Filtro_de_combustible || "",
      Bateria: vehiculo?.Bateria || "",
      Posicion: vehiculo?.Posicion || "",
    },
    onSubmit: async (values) => {
      try {
        let response;
        if (vehiculo) {
          response = await vehiculoService.actualizar(vehiculo.id, values);
        } else {
          response = await vehiculoService.crear(values);
        }
        if (response.status === "Success") {
          showSuccessAlert(
            vehiculo ? "¡Actualizado!" : "¡Creado!",
            response.message
          );
          onSuccess();
          onClose();
        } else if (response.details && typeof response.details === 'object') {
          formik.setErrors(response.details);
        } else {
          showErrorAlert("Error", response.message);
        }
      } catch (error) {
        if (error?.details && typeof error.details === 'object') {
          formik.setErrors(error.details);
        } else {
          showErrorAlert(
            "Error",
            error.message || "Hubo un error al procesar la solicitud"
          );
        }
      }
    },
    enableReinitialize: true,
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
          bgcolor: "#23272F",
          boxShadow: 4,
          "& .MuiDialogTitle-root": {
            bgcolor: "#23272F",
            color: "#FFB800",
            fontWeight: 800,
            fontSize: "2rem",
            letterSpacing: 1,
          },
          "& .MuiDialogContent-root": {
            bgcolor: "#23272F",
            color: "#F3F4F6",
            borderRadius: 2,
          },
          "& .MuiDialogActions-root": {
            bgcolor: "#23272F",
            borderTop: "1px solid #444",
            color: "#F3F4F6",
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h5"
            component="span"
            sx={{
              color: "#FFB800",
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            {vehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#F3F4F6",
              bgcolor: "#353945",
              borderRadius: 2,
            }}
          >
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
                id="Marca"
                name="Marca"
                label="Marca"
                value={formik.values.Marca}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Marca)}
                helperText={formik.errors.Marca}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Modelo"
                name="Modelo"
                label="Modelo"
                value={formik.values.Modelo}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Modelo)}
                helperText={formik.errors.Modelo}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Año"
                name="Año"
                label="Año"
                type="number"
                value={formik.values.Año}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                inputProps={{
                  min: "1900",
                  max: new Date().getFullYear() + 1,
                  step: "1",
                }}
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Año)}
                helperText={formik.errors.Año}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Filtro_de_aire"
                name="Filtro_de_aire"
                label="Filtro de aire"
                value={formik.values.Filtro_de_aire}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Filtro_de_aire)}
                helperText={formik.errors.Filtro_de_aire}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Filtro_de_aceite"
                name="Filtro_de_aceite"
                label="Filtro de aceite"
                value={formik.values.Filtro_de_aceite}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Filtro_de_aceite)}
                helperText={formik.errors.Filtro_de_aceite}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Filtro_de_combustible"
                name="Filtro_de_combustible"
                label="Filtro de combustible"
                value={formik.values.Filtro_de_combustible}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Filtro_de_combustible)}
                helperText={formik.errors.Filtro_de_combustible}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Bateria"
                name="Bateria"
                label="Batería"
                value={formik.values.Bateria}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Bateria)}
                helperText={formik.errors.Bateria}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="Posicion"
                name="Posicion"
                label="Posición"
                value={formik.values.Posicion}
                onChange={formik.handleChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  sx: {
                    bgcolor: "#2C303A",
                    color: "#F3F4F6",
                    borderRadius: 2,
                  },
                }}
                InputLabelProps={{ sx: { color: "#FFB800" } }}
                error={Boolean(formik.errors.Posicion)}
                helperText={formik.errors.Posicion}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            bgcolor: "#23272F",
            borderTop: "1px solid #444",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: "#FFB800",
              color: "#FFB800",
              bgcolor: "#353945",
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={formik.isSubmitting}
            sx={{
              bgcolor: "#FFB800",
              color: "#23272F",
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: 2,
            }}
          >
            {vehiculo ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VehiculoForm;
