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
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper as MuiPaper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { vehiculoService } from '../services/vehiculo.service';
import Search from '../components/Search';
import VehiculoForm from '../components/VehiculoForm';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../helpers/sweetAlert';
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
  },
});

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'grid' o 'list'

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiculoService.obtenerTodos();
      if (response.status === "Success") {
        setVehiculos(response.data);
        setFilteredVehiculos(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      setError('No se pudieron cargar los vehículos');
      showErrorAlert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmed = await showConfirmAlert(
        "¿Estás seguro?",
        "Esta acción no se puede deshacer"
      );

      if (confirmed) {
        const response = await vehiculoService.eliminar(id);
        if (response.status === "Success") {
          showSuccessAlert("¡Eliminado!", "El vehículo ha sido eliminado");
          loadVehiculos();
        } else {
          showErrorAlert("Error", response.message);
        }
      }
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      showErrorAlert("Error", "No se pudo eliminar el vehículo");
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = vehiculos.filter((vehiculo) => {
      const searchString = `${vehiculo.Marca} ${vehiculo.Modelo} ${vehiculo.Año}`
        .toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
    setFilteredVehiculos(filtered);
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'grid' ? 'list' : 'grid'));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: '12vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: '12vh' }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            onClick={loadVehiculos}
            sx={{ mt: 2 }}
          >
            Reintentar
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
      <div style={{ minHeight: '100vh', backgroundImage: 'linear-gradient(90deg, #23272f,#353945,#4e4e4e)', padding: 0, overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ mt: '12vh', mb: 4 }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" component="h1" sx={{ color: '#FFB800', fontWeight: 800, letterSpacing: 1 }}>
                  Gestión de Vehículos
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant={viewMode === "grid" ? "contained" : "outlined"} 
                    startIcon={<ViewModuleIcon />} 
                    onClick={() => setViewMode("grid")}
                    sx={{ 
                      color: viewMode === "grid" ? '#23272F' : '#FFB800', 
                      backgroundColor: viewMode === "grid" ? '#FFB800' : 'transparent',
                      borderColor: '#FFB800',
                      borderRadius: 2,
                      padding: '10px 20px',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: viewMode === "grid" ? '#FF9C00' : 'transparent',
                        borderColor: '#FF9C00',
                        color: viewMode === "grid" ? '#23272F' : '#FFB800',
                      }
                    }}
                  >
                    Cuadrado
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "contained" : "outlined"} 
                    startIcon={<ViewListIcon />} 
                    onClick={() => setViewMode("list")}
                    sx={{ 
                      color: viewMode === "list" ? '#23272F' : '#FFB800', 
                      backgroundColor: viewMode === "list" ? '#FFB800' : 'transparent',
                      borderColor: '#FFB800',
                      borderRadius: 2,
                      padding: '10px 20px',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: viewMode === "list" ? '#FF9C00' : 'transparent',
                        borderColor: '#FF9C00',
                        color: viewMode === "list" ? '#23272F' : '#FFB800',
                      }
                    }}
                  >
                    Lista
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedVehiculo(null);
                    setShowPopup(true);
                  }}
                  size="large"
                  sx={{ bgcolor: '#FFB800', color: '#23272F', borderRadius: 2, fontWeight: 700, boxShadow: 2 }}
                >
                  Nuevo Vehículo
                </Button>
              </Box>
            </Box>

            <Search 
              onSearch={handleSearch} 
              placeholder="Buscar por marca, modelo o año..." 
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#FFB800', fontWeight: 500 }}>
                {filteredVehiculos.length} vehículo(s) encontrado(s)
              </Typography>
            </Box>

            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredVehiculos.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No hay vehículos disponibles
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  filteredVehiculos.map((vehiculo) => (
                    <Grid item xs={12} sm={6} md={4} key={vehiculo.id}>
                      <Card elevation={2} sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(255, 184, 0, 0.15)',
                          bgcolor: 'rgba(255, 184, 0, 0.05)'
                        }
                      }}>
                        <CardContent>
                          <Typography variant="h6" component="div" gutterBottom>
                            {vehiculo.Marca} {vehiculo.Modelo}
                          </Typography>
                          <Typography color="text.secondary" gutterBottom>
                            Año: {vehiculo.Año}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Filtro de aire:</strong> {vehiculo.Filtro_de_aire}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Filtro de aceite:</strong> {vehiculo.Filtro_de_aceite}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Filtro de combustible:</strong> {vehiculo.Filtro_de_combustible}
                          </Typography>
                          {vehiculo.Bateria && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Batería:</strong> {vehiculo.Bateria}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>Posición:</strong> {vehiculo.Posicion}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title="Editar">
                            <IconButton 
                              onClick={() => {
                                setSelectedVehiculo(vehiculo);
                                setShowPopup(true);
                            }}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              onClick={() => handleDelete(vehiculo.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            ) : (
              <Paper sx={{ mt: 2, bgcolor: '#23272F', color: '#F3F4F6', borderRadius: 2 }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#F3F4F6' }}>
                    <thead>
                      <tr style={{ background: '#353945', color: '#FFB800' }}>
                        <th style={{ padding: 8, textAlign: 'left' }}>Marca</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Modelo</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Año</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Filtro de aire</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Filtro de aceite</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Filtro de combustible</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Batería</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Posición</th>
                        <th style={{ padding: 8, textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehiculos.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#B0B3B8' }}>
                            No hay vehículos disponibles
                          </td>
                        </tr>
                      ) : (
                        filteredVehiculos.map((vehiculo) => (
                          <tr key={vehiculo.id} style={{ 
                            borderBottom: '1px solid #353945', 
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 184, 0, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: 8 }}>{vehiculo.Marca}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Modelo}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Año}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Filtro_de_aire}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Filtro_de_aceite}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Filtro_de_combustible}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Bateria}</td>
                            <td style={{ padding: 8 }}>{vehiculo.Posicion}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => {
                                    setSelectedVehiculo(vehiculo);
                                    setShowPopup(true);
                                  }}
                                  color="primary"
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => handleDelete(vehiculo.id)}
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            )}
          </Paper>

          <VehiculoForm
            open={showPopup}
            onClose={() => setShowPopup(false)}
            onSubmit={() => {
              setShowPopup(false);
              loadVehiculos();
            }}
            vehiculo={selectedVehiculo}
            onSuccess={loadVehiculos}
          />
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default Vehiculos;
