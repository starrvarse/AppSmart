import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Chip, Dialog } from '@mui/material';
import { Add as AddIcon, Print as PrintIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import AuthLayout from '../../components/Layout/AuthLayout';
import { DataTable } from '../../components/DataTable';
import DeleteDialogue from '../../components/DeleteDialogue';
import InvoicePrint from '../../components/InvoicePrint';
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
  paid_amount: number;
  status: 'draft' | 'created' | 'paid' | 'cancelled';
};

const InvoicePage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteDialogueOpen, setIsDeleteDialogueOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

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

  const handlePrint = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    
    // Wait for content to be rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('print-content');
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Invoice</title>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
            <style>
              ${styles}
              body { margin: 0; font-family: Roboto, sans-serif; }
              @page { margin: 0.5cm; size: A4; }
              @media print {
                body { margin: 0; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            </style>
          </head>
          <body>
            ${content?.innerHTML || ''}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    // Clear selected invoice after a delay
    setTimeout(() => setSelectedInvoice(null), 1000);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return '-';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
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
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('paid_amount', {
      header: 'Paid',
      cell: (info) => formatCurrency(info.getValue() || 0),
    }),
    columnHelper.accessor((row) => row.total - (row.paid_amount || 0), {
      id: 'remaining',
      header: 'Remaining',
      cell: (info) => {
        const remaining = info.getValue();
        return (
          <Typography
            color={remaining > 0 ? 'error.main' : 'success.main'}
            fontWeight="medium"
          >
            {formatCurrency(Math.abs(remaining))}
            {remaining <= 0 && remaining !== 0 && ' (Change)'}
          </Typography>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Chip
          label={info.getValue().toUpperCase()}
          size="small"
          color={
            info.getValue() === 'paid'
              ? 'success'
              : info.getValue() === 'cancelled'
              ? 'error'
              : 'default'
          }
          variant="outlined"
        />
      ),
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
            onClick={() => handlePrint(info.row.original)}
            startIcon={<PrintIcon />}
          >
            Print
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

      <Box sx={{ display: 'none' }}>
        {selectedInvoice && (
          <Box id="print-content">
            <InvoicePrint invoiceId={selectedInvoice.id} />
          </Box>
        )}
      </Box>
    </AuthLayout>
  );
};

export default InvoicePage;
