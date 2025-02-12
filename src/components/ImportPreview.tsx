import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, LinearProgress } from '@mui/material';

interface ImportPreviewProps {
  data: any[];
  isImporting: boolean;
  progress: number;
  currentItem: string;
  totalItems: number;
}

interface Column {
  key: string;
  header: string;
}

const ImportPreview = ({
  data,
  isImporting,
  progress,
  currentItem,
  totalItems
}: ImportPreviewProps) => {
  // Create columns based on first row of data
  const columns: Column[] = data.length > 0
    ? Object.keys(data[0]).map(key => ({
        key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
      }))
    : [];

  return (
    <Box>
      {isImporting && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Importing: {currentItem}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% ({Math.round(progress * totalItems / 100)} of {totalItems})
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8,
              borderRadius: 1,
              '& .MuiLinearProgress-bar': {
                borderRadius: 1
              }
            }} 
          />
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  sx={{ 
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(0, 100).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell 
                    key={column.key}
                    sx={{ 
                      fontSize: '0.875rem',
                      bgcolor: rowIndex % 2 === 0 ? 'action.hover' : 'background.paper'
                    }}
                  >
                    {typeof row[column.key] === 'undefined' 
                      ? '-' 
                      : row[column.key]?.toString()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.length > 100 && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          Showing first 100 rows of {data.length} total rows
        </Typography>
      )}
    </Box>
  );
};

export default ImportPreview;
