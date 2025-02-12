import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateNext,
  NavigateBefore,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  showSearch?: boolean;
}

export function DataTable<T>({ data, columns, showSearch = true }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <Box sx={{ width: '100%' }}>
      {showSearch && (
        <Box sx={{ p: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ maxWidth: 300 }}
          />
        </Box>
      )}
      <TableContainer component={Paper} sx={{ mb: 1 }}>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <TableCell
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        py: 1,
                        px: 1,
                        backgroundColor: 'grey.50',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <Typography
                          component="span"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            transition: 'transform 0.2s',
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                          }}
                        >
                          {sortDirection ? '▲' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ background: 'white' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      sx={{ 
                        py: 0.75,
                        px: 1,
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            size="small"
          >
            <FirstPage fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            size="small"
          >
            <NavigateBefore fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ mx: 1, fontSize: '0.875rem' }}>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </Typography>
          <IconButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            size="small"
          >
            <NavigateNext fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            size="small"
          >
            <LastPage fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Rows per page:</Typography>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            size="small"
            sx={{ 
              minWidth: 70,
              height: 30,
              '.MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
              }
            }}
          >
            {[10, 15, 20, 30, 50].map((pageSize) => (
              <MenuItem key={pageSize} value={pageSize}>
                {pageSize}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </Box>
  );
}
