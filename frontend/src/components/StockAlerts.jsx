import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Collapse,
  IconButton,
  Badge,
  ThemeProvider,
  createTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InventoryIcon from '@mui/icons-material/Inventory';
import { getAllStockBajo } from '../services/alerts.service';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB800',
    },
    secondary: {
      main: '#1A1A1A',
    },
  },
});

const StockAlerts = () => {
  const [alertas, setAlertas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState({ productos: false, subproductos: false });
  const LIMITE_MOSTRAR = 3; // Solo mostrar 3 productos por defecto

  useEffect(() => {
    loadStockAlerts();
    // Actualizar cada 5 minutos
    const interval = setInterval(loadStockAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadStockAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAllStockBajo();
      setAlertas(data);
      // Resetear el estado de "ver más" cuando se actualizan las alertas
      setShowMore({ productos: false, subproductos: false });
    } catch (error) {
      console.error('Error cargando alertas de stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !alertas) {
    return (
      <ThemeProvider theme={theme}>
        <Paper 
          sx={{ 
            p: 2.5, 
            mb: 2,
            maxWidth: '380px',
            minWidth: '350px',
            background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.95) 0%, rgba(255, 160, 0, 0.95) 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 184, 0, 0.3)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontSize: '12px' }}>
            Cargando...
          </Typography>
        </Paper>
      </ThemeProvider>
    );
  }

  if (alertas.total === 0) {
    return (
      <ThemeProvider theme={theme}>
        <Paper 
          sx={{ 
            p: 2.5, 
            mb: 2,
            maxWidth: '380px',
            minWidth: '350px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 0.5 }}>
            <InventoryIcon sx={{ fontSize: 16 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
              Stock OK
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', display: 'block', fontSize: '10px' }}>
            Sin alertas pendientes
          </Typography>
        </Paper>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Paper 
        sx={{ 
          mb: 2,
          maxWidth: '380px',
          minWidth: '350px',
          background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.95) 0%, rgba(255, 160, 0, 0.95) 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 184, 0, 0.3)'
        }}
      >
      <Alert 
        severity={alertas.criticos > 0 ? 'error' : 'warning'}
        sx={{ 
          borderRadius: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'inherit',
          padding: '8px 16px',
          '& .MuiAlert-icon': {
            color: 'white',
            fontSize: '18px'
          },
          '& .MuiAlert-message': {
            width: '100%',
            padding: 0
          }
        }}
        action={
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'white', padding: '4px' }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        }
      >
        <AlertTitle sx={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {alertas.criticos > 0 ? <ErrorIcon fontSize="medium" /> : <WarningIcon fontSize="medium" />}
            Alertas de Stock
            <Badge 
              badgeContent={alertas.total}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff1744',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  minWidth: '18px',
                  height: '18px'
                }
              }}
            />
          </Box>
        </AlertTitle>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', lineHeight: 1.4 }}>
          {alertas.criticos > 0 && `${alertas.criticos} críticos • `}
          {alertas.total} requieren atención
        </Typography>
      </Alert>

      <Collapse in={expanded}>
        <Box 
          sx={{ 
            p: 2.5,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#1A1A1A',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {alertas.productos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#FFB800',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Productos ({alertas.productos.length})
                </Typography>
                {alertas.productos.length > LIMITE_MOSTRAR && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowMore(prev => ({ ...prev, productos: !prev.productos }))}
                    endIcon={showMore.productos ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />}
                    sx={{
                      color: '#FFB800',
                      fontSize: '10px',
                      padding: '2px 4px',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 184, 0, 0.1)'
                      }
                    }}
                  >
                    {showMore.productos ? 'Menos' : `+${alertas.productos.length - LIMITE_MOSTRAR}`}
                  </Button>
                )}
              </Box>
              <List 
                dense
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  padding: 0,
                  '& .MuiListItem-root': {
                    padding: '4px 8px',
                    minHeight: '32px',
                    borderBottom: '1px solid #f5f5f5',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }
                }}
              >
                {(showMore.productos ? alertas.productos : alertas.productos.slice(0, LIMITE_MOSTRAR))
                  .map((producto) => (
                  <ListItem key={`producto-${producto.id}`}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>
                          {producto.nombre.length > 20 ? `${producto.nombre.substring(0, 20)}...` : producto.nombre}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
                          {producto.codigoP}
                        </Typography>
                      }
                    />
                    <Chip
                      label={producto.stock}
                      color={producto.nivel === 'critico' ? 'error' : 'warning'}
                      size="small"
                      sx={{ 
                        height: '20px',
                        fontSize: '9px',
                        '& .MuiChip-label': { 
                          padding: '0 4px' 
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {alertas.subproductos.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#FFB800',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Subproductos ({alertas.subproductos.length})
                </Typography>
                {alertas.subproductos.length > LIMITE_MOSTRAR && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowMore(prev => ({ ...prev, subproductos: !prev.subproductos }))}
                    endIcon={showMore.subproductos ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />}
                    sx={{
                      color: '#FFB800',
                      fontSize: '10px',
                      padding: '2px 4px',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 184, 0, 0.1)'
                      }
                    }}
                  >
                    {showMore.subproductos ? 'Menos' : `+${alertas.subproductos.length - LIMITE_MOSTRAR}`}
                  </Button>
                )}
              </Box>
              <List 
                dense
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  padding: 0,
                  '& .MuiListItem-root': {
                    padding: '4px 8px',
                    minHeight: '32px',
                    borderBottom: '1px solid #f5f5f5',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }
                }}
              >
                {(showMore.subproductos ? alertas.subproductos : alertas.subproductos.slice(0, LIMITE_MOSTRAR))
                  .map((subproducto) => (
                  <ListItem key={`subproducto-${subproducto.id}`}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>
                          {subproducto.nombre.length > 20 ? `${subproducto.nombre.substring(0, 20)}...` : subproducto.nombre}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ fontSize: '11px', color: 'text.secondary' }}>
                          {subproducto.codigosubP}
                        </Typography>
                      }
                    />
                    <Chip
                      label={subproducto.stock}
                      color={subproducto.nivel === 'critico' ? 'error' : 'warning'}
                      size="small"
                      sx={{ 
                        height: '20px',
                        fontSize: '9px',
                        '& .MuiChip-label': { 
                          padding: '0 4px' 
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="text"
              size="small"
              onClick={loadStockAlerts}
              sx={{
                color: '#FFB800',
                fontSize: '10px',
                padding: '4px 8px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 184, 0, 0.1)',
                }
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
    </ThemeProvider>
  );
};

export default StockAlerts;