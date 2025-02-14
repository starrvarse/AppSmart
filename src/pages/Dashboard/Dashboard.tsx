import { useEffect, useState } from 'react';
import AuthLayout from '../../components/Layout/AuthLayout';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Stack,
  SelectChangeEvent,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  TrendingUp as SalesIcon,
  Receipt as InvoiceIcon,
  Person as CustomerIcon,
  Inventory as ProductIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

interface Stats {
  totalSales: number;
  monthlySales: number;
  yearlySales: number;
  totalInvoices: number;
}

interface TopCustomer {
  name: string;
  totalPurchase: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  fill: boolean;
  borderColor: string;
  tension: number;
  backgroundColor: string;
}

interface SalesChartData {
  labels: string[];
  datasets: ChartDataset[];
}

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '₹' + value.toLocaleString();
        }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    monthlySales: 0,
    yearlySales: 0,
    totalInvoices: 0,
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesChartData>({
    labels: [],
    datasets: [],
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const processChartData = (invoices: any[], year: number, month: number) => {
    let labels: string[] = [];
    let data: number[] = [];

    if (month === -1) {
      // Yearly view - show all months
      labels = months;
      data = months.map((_, index) => {
        return invoices.filter((inv: any) => {
          const date = new Date(inv.invoice_date);
          return date.getFullYear() === year && date.getMonth() === index;
        }).reduce((sum: number, inv: any) => sum + inv.total, 0);
      });
    } else {
      // Monthly view - show days
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      data = labels.map(day => {
        return invoices.filter((inv: any) => {
          const date = new Date(inv.invoice_date);
          return date.getFullYear() === year && 
                 date.getMonth() === month && 
                 date.getDate() === parseInt(day);
        }).reduce((sum: number, inv: any) => sum + inv.total, 0);
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Sales',
          data,
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/invoices');
        const invoices = await response.json();

        // Calculate statistics
        const total = invoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
        const thisMonth = invoices.filter((inv: any) => {
          const date = new Date(inv.invoice_date);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).reduce((sum: number, inv: any) => sum + inv.total, 0);

        const thisYear = invoices.filter((inv: any) => {
          const date = new Date(inv.invoice_date);
          const now = new Date();
          return date.getFullYear() === now.getFullYear();
        }).reduce((sum: number, inv: any) => sum + inv.total, 0);

        setStats({
          totalSales: total,
          monthlySales: thisMonth,
          yearlySales: thisYear,
          totalInvoices: invoices.length,
        });

        // Process chart data based on selected filters
        setSalesData(processChartData(invoices, selectedYear, selectedMonth));

        // Get top customers
        const customerMap = new Map();
        invoices.forEach((inv: any) => {
          const current = customerMap.get(inv.customer_name) || 0;
          customerMap.set(inv.customer_name, current + inv.total);
        });

        const sortedCustomers = Array.from(customerMap.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, total]) => ({ name, totalPurchase: total }));

        setTopCustomers(sortedCustomers);

        // Get top products
        const productMap = new Map();
        invoices.forEach((inv: any) => {
          inv.items?.forEach((item: any) => {
            const key = item.product_name || item.product_id;
            const current = productMap.get(key) || { quantity: 0, total: 0 };
            productMap.set(key, {
              quantity: current.quantity + item.quantity,
              total: current.total + (item.quantity * item.rate),
            });
          });
        });

        const sortedProducts = Array.from(productMap.entries())
          .sort(([, a], [, b]) => b.total - a.total)
          .slice(0, 5)
          .map(([name, data]) => ({
            name,
            quantity: data.quantity,
            total: data.total,
          }));

        setTopProducts(sortedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(event.target.value as number);
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(event.target.value as number);
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toLocaleString()}`,
      icon: <SalesIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
    },
    {
      title: 'Monthly Sales',
      value: `₹${stats.monthlySales.toLocaleString()}`,
      icon: <InvoiceIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Yearly Sales',
      value: `₹${stats.yearlySales.toLocaleString()}`,
      icon: <CustomerIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: <ProductIcon sx={{ fontSize: 40 }} />,
      color: '#f44336',
    },
  ];

  return (
    <AuthLayout>
      <Box sx={{ p: 3 }}>
        <MotionPaper
          elevation={0}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="500">
            Welcome to Smart Invoicing
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Track your sales, monitor top customers, and manage your business efficiently.
          </Typography>
        </MotionPaper>

        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  {isLoading ? (
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ fontWeight: 500, mb: 1 }}
                        >
                          {card.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: `${card.color}15`,
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Sales Trend</Typography>
                  <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={selectedYear}
                        onChange={handleYearChange}
                        label="Year"
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Month</InputLabel>
                      <Select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        label="Month"
                      >
                        <MenuItem value={-1}>All Months</MenuItem>
                        {months.map((month, index) => (
                          <MenuItem key={month} value={index}>
                            {month}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>
                {!isLoading && <Line data={salesData as ChartData<'line'>} options={chartOptions} />}
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Customers
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Total Purchase</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topCustomers.map((customer) => (
                        <TableRow key={customer.name}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell align="right">
                            ₹{customer.totalPurchase.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Top Selling Products
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.name}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">
                            {product.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ₹{product.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Box>
    </AuthLayout>
  );
};

export default Dashboard;
