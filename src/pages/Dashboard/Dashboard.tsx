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
} from '@mui/material';
import {
  Category as CategoryIcon,
  Business as BusinessIcon,
  Scale as ScaleIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

interface Stats {
  categories: number;
  units: number;
  companies: number;
  documents: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    categories: 0,
    units: 0,
    companies: 0,
    documents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated data loading
    const timer = setTimeout(() => {
      setStats({
        categories: 12,
        units: 8,
        companies: 15,
        documents: 45,
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: 'Categories',
      value: stats.categories,
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
    },
    {
      title: 'Units',
      value: stats.units,
      icon: <ScaleIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Companies',
      value: stats.companies,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
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
            Manage your invoices, categories, units, and product companies efficiently.
          </Typography>
        </MotionPaper>

        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
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
                          variant="h4"
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
      </Box>
    </AuthLayout>
  );
};

export default Dashboard;
