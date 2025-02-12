import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/auth/signin');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#ffffff',
        color: '#1a237e',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              height: '55px',
              marginRight: '16px',
              display: 'block'
            }} 
          />
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 500,
              letterSpacing: 0.5,
              color: '#1a237e'
            }}
          >
            Smart Invoicing
          </Typography>
        </Box>
        <IconButton 
          sx={{ 
            color: '#1a237e',
            '&:hover': {
              bgcolor: 'rgba(26,35,126,0.04)'
            }
          }} 
          onClick={handleSignOut}
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
