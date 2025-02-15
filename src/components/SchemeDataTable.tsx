import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface SchemeTableProps {
  schemes: Scheme[];
  loading?: boolean;
  onDelete: (scheme: Scheme) => void;
}

interface Scheme {
  id: number;
  name: string;
  type: 'category' | 'product';
  discountType: 'percentage' | 'flat' | 'buy_x_get_y';
  discountValue: number | null;
  buyQuantity: number | null;
  freeQuantity: number | null;
  startDate: string;
  endDate: string;
  categories?: { id: number; name: string; }[];
  products?: { id: number; name: string; code: string; }[];
  createdAt: string;
}

export const SchemeDataTable = ({ schemes, loading = false, onDelete }: SchemeTableProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDiscount = (scheme: Scheme) => {
    switch (scheme.discountType) {
      case 'percentage':
        return `${scheme.discountValue}%`;
      case 'flat':
        return `₹${scheme.discountValue}`;
      case 'buy_x_get_y':
        return `Buy ${scheme.buyQuantity} Get ${scheme.freeQuantity}`;
      default:
        return '';
    }
  };

  const formatItems = (scheme: Scheme) => {
    if (scheme.type === 'category' && scheme.categories) {
      return scheme.categories.map(c => c.name).join(', ');
    }
    if (scheme.type === 'product' && scheme.products) {
      return scheme.products.map(p => p.name).join(', ');
    }
    return '';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ width: '100%' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Validity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schemes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((scheme) => (
                <TableRow key={scheme.id} hover>
                  <TableCell>{scheme.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={scheme.type === 'category' ? 'Category' : 'Product'}
                      color={scheme.type === 'category' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDiscount(scheme)}</TableCell>
                  <TableCell>{formatItems(scheme)}</TableCell>
                  <TableCell>
                    {`${new Date(scheme.startDate).toLocaleDateString()} - ${new Date(scheme.endDate).toLocaleDateString()}`}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/schemes/edit/${scheme.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(scheme)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={schemes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};
