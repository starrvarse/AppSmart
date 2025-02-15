import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { SchemeDataTable } from '../../components/SchemeDataTable';
import DeleteDialogue from '../../components/DeleteDialogue';

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

const Scheme = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      const data = await api.schemes.getAll();
      setSchemes(data);
    } catch (error) {
      console.error('Error loading schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedScheme) return;

    try {
      await api.schemes.delete(selectedScheme.id);
      setSchemes(schemes.filter(scheme => scheme.id !== selectedScheme.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting scheme:', error);
    }
  };

  const handleDeleteClick = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setDeleteDialogOpen(true);
  };

  return (
    <AuthLayout>
      <Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Schemes
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/schemes/add')}
          >
            Add Scheme
          </Button>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <SchemeDataTable
            schemes={schemes}
            loading={loading}
            onDelete={handleDeleteClick}
          />
        </Box>
      </Box>

      <DeleteDialogue
        isOpen={deleteDialogOpen}
        itemName={selectedScheme?.name || 'this scheme'}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </AuthLayout>
  );
};

export default Scheme;
