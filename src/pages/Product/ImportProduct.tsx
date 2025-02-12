import { useState, useCallback, useRef } from 'react';
import { Box, Button, Paper, Typography, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import AuthLayout from '../../components/Layout/AuthLayout';
import ImportPreview from '../../components/ImportPreview';
import { api } from '../../services/api';

const ImportProduct = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setError(null);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length === 0) {
            setError('The Excel file is empty');
            return;
          }

          setData(jsonData);
        } catch (error) {
          setError('Failed to parse Excel file. Please make sure it\'s a valid Excel file.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setError('Failed to read the file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const downloadSample = () => {
    const sampleData = [
      {
        name: 'Sample Product',
        code: 'PRD001',
        category_name: 'Category 1',
        base_unit_name: 'PCS',
        base_rate: 100,
        base_wholesale_rate: 90,
        hsn_code: '12345',
        company_name: 'Company 1',
        tax_percentage: 18,
        additional_units: JSON.stringify([
          { unit_name: 'BOX', conversion_rate: 12, retail_rate: 1100, wholesale_rate: 1000 }
        ])
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_import_sample.xlsx');
  };

  const handleImport = async () => {
    if (data.length === 0) return;

    try {
      setIsImporting(true);
      setProgress(0);
      
      // Create new AbortController for this import
      abortControllerRef.current = new AbortController();
      
      await api.products.import(data, {
        onProgress: (progress, currentItem) => {
          setProgress(progress);
          setCurrentItem(currentItem);
        },
        signal: abortControllerRef.current.signal
      });

      setIsImporting(false);
      setData([]);
      setError(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Import cancelled');
      } else {
        setError(error.message || 'Failed to import products');
      }
      setIsImporting(false);
    }
  };

  const cancelImport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Import Products</Typography>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadSample}
            sx={{ mb: 2 }}
          >
            Download Sample File
          </Button>

          {!data.length && (
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider'
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
              <Typography>
                {isDragActive
                  ? 'Drop the Excel file here'
                  : 'Drag and drop an Excel file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Supports .xlsx and .xls files
              </Typography>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {data.length > 0 && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Start Import'}
              </Button>
              {isImporting && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={cancelImport}
                >
                  Cancel
                </Button>
              )}
            </Box>

            <ImportPreview
              data={data}
              isImporting={isImporting}
              progress={progress}
              currentItem={currentItem}
              totalItems={data.length}
            />
          </Box>
        )}
      </Box>
    </AuthLayout>
  );
};

export default ImportProduct;
