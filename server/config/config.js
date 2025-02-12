const config = {
  development: {
    port: 5001,  // Changed from 5000 to avoid conflicts
    database: {
      path: 'dms.sqlite',
      verbose: true,
    },
    cors: {
      origin: 'http://localhost:5174', // Updated to match Vite's port
      credentials: true,
    },
    logging: {
      requests: true,
      queries: true,
    },
  },
  production: {
    port: process.env.PORT || 5001,
    database: {
      path: process.env.DB_PATH || 'dms.sqlite',
      verbose: false,
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    logging: {
      requests: false,
      queries: false,
    },
  },
};

const env = process.env.NODE_ENV || 'development';
export default config[env];
