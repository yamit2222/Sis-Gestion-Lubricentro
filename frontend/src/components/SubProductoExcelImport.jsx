import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../helpers/sweetAlert.js';
import { importarSubproductosExcel } from '../services/subproducto.service.js';

const SubProductoExcelImport = ({ open, onClose, onImportSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isFormatVisible, setIsFormatVisible] = useState(false);
  const fileInputRef = useRef(null);

  // Agregar animación CSS para el spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Estilos como objetos JavaScript
  const styles = {
    dropZone: {
      border: `2px dashed ${dragOver ? '#FFB800' : '#444'}`,
      borderRadius: '8px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '20px',
      backgroundColor: dragOver ? '#2C303A' : '#23272F',
      pointerEvents: isUploading ? 'none' : 'auto',
      opacity: isUploading ? 0.7 : 1,
      color: '#F3F4F6'
    },
    dropContent: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    dropText: {
      margin: '8px 0',
      color: '#F3F4F6'
    },
    dropSmall: {
      color: '#B0B0B0'
    },
    spinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #353945',
      borderTop: '3px solid #FFB800',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      showErrorAlert('Error', 'Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showErrorAlert('Error', 'El archivo no puede ser mayor a 5MB');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      const result = await importarSubproductosExcel(file);

      // Verificar si la respuesta es exitosa (status 200 o success)
      if (result.status === 'success' || (result.data && typeof result.data === 'object')) {
        const data = result.data || result;
        const { exitosos, fallidos, errores } = data;
        
        if (fallidos > 0 && exitosos > 0) {
          // Importación parcial - algunos exitosos, algunos fallidos
          const duplicados = errores.filter(error => 
            error.errores.some(err => err.includes('ya existe') || err.includes('código'))
          ).length;
          
          const otrosErrores = fallidos - duplicados;
          
          let message = `Se agregaron ${exitosos} subproductos correctamente.`;
          if (duplicados > 0) {
            message += `\n${duplicados} subproductos ya existían.`;
          }
          if (otrosErrores > 0) {
            message += `\n${otrosErrores} subproductos tuvieron errores de validación.`;
          }

          showWarningAlert('Importación completada', message);
        } else if (exitosos > 0) {
          // Todos exitosos
          showSuccessAlert('Importación exitosa', `Se agregaron ${exitosos} subproductos correctamente`);
        }

        // Siempre cerrar y recargar si hubo al menos un subproducto exitoso
        if (exitosos > 0) {
          if (onImportSuccess) {
            onImportSuccess();
          }
          onClose();
        }
      } else {
        showErrorAlert('Error', result.message || 'Error al importar subproductos');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Si el error tiene respuesta del servidor (400, 500, etc)
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Si hay datos de importación en el error (subproductos fallidos)
        if (errorData.data && errorData.data.exitosos !== undefined) {
          const { exitosos, fallidos, errores } = errorData.data;
          
          if (exitosos > 0) {
            // Algunos subproductos se importaron exitosamente a pesar del error
            const duplicados = errores.filter(error => 
              error.errores && error.errores.some(err => err.includes('ya existe') || err.includes('código'))
            ).length;
            
            const otrosErrores = fallidos - duplicados;
            
            let message = `Se agregaron ${exitosos} subproductos correctamente.`;
            if (duplicados > 0) {
              message += `\n${duplicados} subproductos ya existían.`;
            }
            if (otrosErrores > 0) {
              message += `\n${otrosErrores} subproductos tuvieron errores de validación.`;
            }
            
            showWarningAlert('Importación completada', message);
            
            // Recargar y cerrar si hubo subproductos exitosos
            if (onImportSuccess) {
              onImportSuccess();
            }
            onClose();
          } else {
            // Ningún subproducto se importó
            showErrorAlert('Error', errorData.message || 'No se pudo importar ningún subproducto');
          }
        } else {
          // Error genérico del servidor
          showErrorAlert('Error', errorData.message || 'Error del servidor al importar subproductos');
        }
      } else {
        // Error de conexión
        showErrorAlert('Error', 'Error de conexión al importar subproductos');
      }
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    // Crear plantilla en formato vertical - cada campo en su propia fila (sin stock)
    const templateData = [
      ['nombre'],
      ['codigosubP'],
      ['descripcion'],
      ['precio'],
      ['marca'],
      ['categoria']
    ];

    // Convertir a CSV para descarga - formato correcto con separadores
    const csvContent = templateData.map(row => 
      row.join(',')
    ).join('\n');

    // Agregar BOM para UTF-8 para mejor compatibilidad con Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plantilla_subproductos_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#23272F',
          color: '#F3F4F6',
          borderRadius: 3,
          border: '2px solid #FFB800'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#23272F', 
        color: '#FFB800', 
        borderBottom: '1px solid #353945',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Importar SubProductos desde Excel
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#FFB800' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: '#23272F', color: '#F3F4F6', pt: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained"
            onClick={downloadTemplate}
            sx={{ 
              bgcolor: '#28a745', 
              color: 'white',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': { bgcolor: '#218838' }
            }}
          >
            📄 Descargar Plantilla
          </Button>
        </Box>

        <Box 
          sx={styles.dropZone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
        />
          
          <Box>
            {isUploading ? (
              <>
                <Box sx={styles.spinner}></Box>
                <Typography sx={styles.dropText}>Procesando archivo...</Typography>
              </>
            ) : (
              <>
                <Box sx={{ ...styles.dropContent, fontSize: '48px' }}>📄</Box>
                <Typography sx={styles.dropText}><strong>Arrastra tu archivo Excel aquí</strong></Typography>
                <Typography sx={styles.dropText}>o haz clic para seleccionar</Typography>
                <Typography variant="caption" sx={styles.dropSmall}>Solo archivos .xlsx o .xls (máximo 5MB)</Typography>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2, bgcolor: '#353945' }} />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ color: '#FFB800', fontWeight: 600 }}>
              Formato requerido:
            </Typography>
            <IconButton
              onClick={() => setIsFormatVisible(!isFormatVisible)}
              sx={{ color: '#FFB800' }}
            >
              {isFormatVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={isFormatVisible}>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#2C303A', borderRadius: 2, border: '1px solid #444' }}>
              <Typography sx={{ mb: 2, color: '#F3F4F6' }}>
                El archivo Excel debe tener los siguientes campos, cada uno en una fila separada (formato vertical):
              </Typography>
              <Box component="ol" sx={{ pl: 3, color: '#F3F4F6' }}>
                <li><strong style={{ color: '#FFB800' }}>nombre</strong> - Nombre del subproducto</li>
                <li><strong style={{ color: '#FFB800' }}>codigosubP</strong> - Código único del subproducto</li>
                <li><strong style={{ color: '#FFB800' }}>descripcion</strong> - Descripción detallada</li>
                <li><strong style={{ color: '#FFB800' }}>precio</strong> - Precio en pesos</li>
                <li><strong style={{ color: '#FFB800' }}>marca</strong> - Marca del subproducto</li>
                <li><strong style={{ color: '#FFB800' }}>categoria</strong> - repuestos, limpieza, accesorios externos o accesorios eléctricos</li>
              </Box>
              <Typography sx={{ mt: 2, color: '#FFB800', fontStyle: 'italic', fontSize: '0.9rem' }}>
                📝 Nota: El stock inicial será 0 para todos los subproductos importados. Puedes modificarlo después desde la gestión de subproductos.
              </Typography>
            </Box>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#23272F', borderTop: '1px solid #353945', p: 2 }}>
        <Button 
          onClick={onClose} 
          sx={{ color: '#F3F4F6', borderColor: '#444' }}
          variant="outlined"
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubProductoExcelImport;
