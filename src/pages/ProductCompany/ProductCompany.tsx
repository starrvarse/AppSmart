import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import AddProductCompany from './AddProductCompany';
import DeleteDialogue from '../../components/DeleteDialogue';
import { DataTable } from '../../components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ProductCompany {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

const ProductCompanyPage = () => {
  const [companies, setCompanies] = useState<ProductCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ProductCompany | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);

  const loadCompanies = async () => {
    try {
      const data = await api.productCompanies.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading product companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleDelete = async () => {
    if (selectedCompany) {
      try {
        await api.productCompanies.delete(selectedCompany.id);
        loadCompanies();
        setIsDeleteDialogueOpen(false);
        setSelectedCompany(null);
      } catch (error) {
        console.error('Error deleting product company:', error);
      }
    }
  };

  const handleEdit = (company: ProductCompany) => {
    setSelectedCompany(company);
    setIsAddModalOpen(true);
  };

  const columnHelper = createColumnHelper<ProductCompany>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('created_at', {
      header: 'Created At',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <MotionButton
            onClick={() => handleEdit(info.row.original)}
            color="primary"
            size="small"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✏️
          </MotionButton>
          <MotionButton
            onClick={() => {
              setSelectedCompany(info.row.original);
              setIsDeleteDialogueOpen(true);
            }}
            color="error"
            size="small"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️
          </MotionButton>
        </Box>
      ),
    }),
  ];

  return (
    <AuthLayout>
      <Box sx={{ p: 3 }}>
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          elevation={2}
          sx={{ borderRadius: 2 }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
              Product Companies
            </Typography>
            <MotionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCompany(null);
                setIsAddModalOpen(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Product Company
            </MotionButton>
          </Box>

          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            ) : (
              <DataTable data={companies} columns={columns} />
            )}
          </Box>
        </MotionPaper>
      </Box>

      <AddProductCompany
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedCompany(null);
        }}
        onSuccess={loadCompanies}
        company={selectedCompany}
      />

      <DeleteDialogue
        isOpen={isDeleteDialogueOpen}
        onClose={() => {
          setIsDeleteDialogueOpen(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedCompany?.name || ''}
      />
    </AuthLayout>
  );
};

export default ProductCompanyPage;
