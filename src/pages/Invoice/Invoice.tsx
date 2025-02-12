import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import { DataTable } from '../../components/DataTable';
import DeleteDialogue from '../../components/DeleteDialogue';
import { createColumnHelper } from '@tanstack/react-table';

type Invoice = {
  id: number;
  invoice_number: string;
  customer_name?: string;
  customer_phone?: string;
  invoiceDate?: string;
  invoice_date?: string;
  dueDate?: string;
  due_date?: string;
  total: number;
  status: 'draft' | 'created' | 'paid' | 'cancelled';
};

const InvoicePage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await api.invoices.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDelete = async () => {
    if (selectedInvoice) {
      try {
        await api.invoices.delete(selectedInvoice.id);
        loadInvoices();
        setIsDeleteDialogueOpen(false);
        setSelectedInvoice(null);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/invoices/edit/${invoice.id}`);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return '-';
    }
  };

  const columnHelper = createColumnHelper<Invoice>();

  const columns = [
    columnHelper.accessor('invoice_number', {
      header: 'Invoice Number',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('customer_name', {
      header: 'Customer',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('customer_phone', {
      header: 'Phone',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor((row) => row.invoiceDate || row.invoice_date, {
      id: 'invoice_date',
      header: 'Invoice Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor((row) => row.dueDate || row.due_date, {
      id: 'due_date',
      header: 'Due Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => info.getValue().toUpperCase(),
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
              setSelectedInvoice(info.row.original);
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
            Invoices
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/invoices/add')}
          >
            Add Invoice
          </Button>
        </Box>

        <Box sx={{ bgcolor: 'background.paper' }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : (
            <DataTable data={invoices} columns={columns} />
          )}
        </Box>
      </Box>

      <DeleteDialogue
        isOpen={isDeleteDialogueOpen}
        onClose={() => {
          setIsDeleteDialogueOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedInvoice?.invoice_number || ''}
      />
    </AuthLayout>
  );
};

export default InvoicePage;
