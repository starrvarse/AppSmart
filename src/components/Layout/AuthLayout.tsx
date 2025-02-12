import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // Height of navbar
          pl: '48px', // 0.5 inch gap from sidebar
          width: `calc(100% - 268px)`, // 220px sidebar + 48px gap
          ml: 0
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
