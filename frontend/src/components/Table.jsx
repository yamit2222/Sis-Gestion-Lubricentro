import { Table as MUITable, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { deleteProducto } from '../services/producto.service';
import { deleteSubProducto } from '../services/subproducto.service';
import useTable from '@hooks/table/useTable.jsx';

export default function Table({ data, columns, filter, dataToFilter, initialSortName, onSelectionChange, onEdit, onDelete }) {
  const { tableRef } = useTable({ data, columns, filter, dataToFilter, initialSortName, onSelectionChange });

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteProducto(id);
        Swal.fire(
          '¡Eliminado!',
          'El producto ha sido eliminado.',
          'success'
        );
        onDelete();
      }
      if (result.isConfirmed) {
        await deleteSubProducto(id);
        Swal.fire(
          '¡Eliminado!',
          'El subproducto ha sido eliminado.',
          'success'
        );
        onDelete();
      }
      
    } catch (error) {
      Swal.fire(
        'Error',
        'No se pudo eliminar el producto',
        'error'
      );
    }
  };

  return (
    <div className='table-container'>
      <div ref={tableRef}>
        <TableContainer component={Paper}>
          <MUITable>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.field}>{column.headerName}</TableCell>
                ))}
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.field}`}>
                      {row[column.field]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton onClick={() => onEdit(row)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MUITable>
        </TableContainer>
      </div>
    </div>
  );
}