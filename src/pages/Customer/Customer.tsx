import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import { DataTable } from '../../components/DataTable';
import DeleteDialogue from '../../components/DeleteDialogue';
import { createColumnHelper } from '@tanstack/react-table';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'wholesale' | 'retail';
  created_at: string;
}

const CustomerPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await api.customers.getAll();
      // Ensure type is set for all customers
      const customersWithType = data.map(customer => ({
        ...customer,
        type: customer.type || 'retail'
      }));
      setCustomers(customersWithType);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async () => {
    if (selectedCustomer) {
      try {
        await api.customers.delete(selectedCustomer.id);
        loadCustomers();
        setIsDeleteDialogueOpen(false);
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    navigate(`/customers/edit/${customer.id}`);
  };

  const columnHelper = createColumnHelper<Customer>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => {
        const type = info.getValue() || 'retail';
        return (
          <Chip
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            color={type === 'wholesale' ? 'primary' : 'default'}
            size="small"
          />
        );
      },
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
              setSelectedCustomer(info.row.original);
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            Customers
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/customers/add')}
          >
            Add Customer
          </Button>
        </Box>

        <Box sx={{ bgcolor: 'background.paper' }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : (
            <DataTable data={customers} columns={columns} />
          )}
        </Box>
      </Box>

      <DeleteDialogue
        isOpen={isDeleteDialogueOpen}
        onClose={() => {
          setIsDeleteDialogueOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedCustomer?.name || ''}
      />
    </AuthLayout>
  );
};

export default CustomerPage;
