import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import DeleteDialogue from '../../components/DeleteDialogue';
import { DataTable } from '../../components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

type Product = {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  baseUnitId: number;
  baseRate: number;
  baseWholesaleRate: number | null;
  hsnCode?: string;
  companyId: number;
  taxPercentage: number;
  created_at: string;
  category_name?: string;
  base_unit_name?: string;
  company_name?: string;
  units?: Array<{
    unitId: number;
    conversionRate: number;
    retailRate: number;
    wholesaleRate: number;
    unit_name?: string;
  }>;
};

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await api.products.delete(selectedProduct.id);
        loadProducts();
        setIsDeleteDialogueOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('code', {
      header: 'Code',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('category_name', {
      header: 'Category',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('base_unit_name', {
      header: 'Base Unit',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('company_name', {
      header: 'Company',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('baseRate', {
      header: 'Base Rate',
      cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('baseWholesaleRate', {
      header: 'Wholesale Rate',
      cell: (info) => (info.getValue() ?? 0).toFixed(2),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleEdit(info.row.original)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              setSelectedProduct(info.row.original);
              setIsDeleteDialogueOpen(true);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    }),
  ];

  return (
    <AuthLayout>
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            Products
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate('/products/import')}
            >
              Import
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/add')}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'background.paper' }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : (
            <DataTable data={products} columns={columns} />
          )}
        </Box>
      </Box>

      <DeleteDialogue
        isOpen={isDeleteDialogueOpen}
        onClose={() => {
          setIsDeleteDialogueOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedProduct?.name || ''}
      />
    </AuthLayout>
  );
};

export default ProductPage;
