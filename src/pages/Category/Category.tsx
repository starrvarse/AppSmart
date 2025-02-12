import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import AddCategory from './AddCategory';
import DeleteDialogue from '../../components/DeleteDialogue';
import { DataTable } from '../../components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async () => {
    if (selectedCategory) {
      try {
        await api.categories.delete(selectedCategory.id);
        loadCategories();
        setIsDeleteDialogueOpen(false);
        setSelectedCategory(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  const columnHelper = createColumnHelper<Category>();

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
              setSelectedCategory(info.row.original);
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
              Categories
            </Typography>
            <MotionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCategory(null);
                setIsAddModalOpen(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Category
            </MotionButton>
          </Box>

          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            ) : (
              <DataTable data={categories} columns={columns} />
            )}
          </Box>
        </MotionPaper>
      </Box>

      <AddCategory
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedCategory(null);
        }}
        onSuccess={loadCategories}
        category={selectedCategory}
      />

      <DeleteDialogue
        isOpen={isDeleteDialogueOpen}
        onClose={() => {
          setIsDeleteDialogueOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedCategory?.name || ''}
      />
    </AuthLayout>
  );
};

export default CategoryPage;
