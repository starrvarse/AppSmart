import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import productCompanyRoutes from './routes/productCompanyRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = 5001;

// Enable CORS for development
app.use(cors({
  origin: 'http://localhost:5173', // Update to match the Vite dev server port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Cache-Control', 'Connection'],
  exposedHeaders: ['Content-Type', 'Transfer-Encoding', 'Cache-Control', 'Connection'],
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/product-companies', productCompanyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/schemes', schemeRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log('Server running in development mode');
  console.log(`Server listening at http://localhost:${port}`);
});
