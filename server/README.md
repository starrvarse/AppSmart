# DMS Server

Backend server for the Document Management System (DMS) application.

## Project Structure

```
server/
├── config/
│   ├── config.js         # Environment-specific configuration
│   └── database.js       # Database initialization and schema
├── controllers/
│   ├── authController.js         # Authentication handlers
│   ├── categoryController.js     # Category CRUD operations
│   ├── documentController.js     # Document operations
│   ├── productController.js      # Product CRUD operations
│   ├── productCompanyController.js # Product company operations
│   └── unitController.js        # Unit CRUD operations
├── middleware/
│   ├── errorHandler.js   # Global error handling
│   └── requestLogger.js  # Request logging middleware
├── routes/
│   ├── authRoutes.js           # Authentication routes
│   ├── categoryRoutes.js       # Category routes
│   ├── documentRoutes.js       # Document routes
│   ├── productRoutes.js        # Product routes
│   ├── productCompanyRoutes.js # Product company routes
│   └── unitRoutes.js          # Unit routes
└── index.js              # Main application entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Configuration:
   - Development mode is the default
   - For production, set `NODE_ENV=production`
   - Additional environment variables:
     - `PORT`: Server port (default: 5000)
     - `DB_PATH`: SQLite database path
     - `CORS_ORIGIN`: Allowed CORS origin

3. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - User login

### Categories
- GET `/api/categories` - List all categories
- POST `/api/categories` - Create new category
- PUT `/api/categories/:id` - Update category
- DELETE `/api/categories/:id` - Delete category

### Units
- GET `/api/units` - List all units
- POST `/api/units` - Create new unit
- PUT `/api/units/:id` - Update unit
- DELETE `/api/units/:id` - Delete unit

### Product Companies
- GET `/api/product-companies` - List all companies
- POST `/api/product-companies` - Create new company
- PUT `/api/product-companies/:id` - Update company
- DELETE `/api/product-companies/:id` - Delete company

### Products
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get product details
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Documents
- GET `/api/documents/:userId` - Get user's documents
- POST `/api/documents` - Create new document

## Database Schema

### Users
- id (PRIMARY KEY)
- email (UNIQUE)
- password
- created_at

### Categories
- id (PRIMARY KEY)
- name
- description
- created_at

### Units
- id (PRIMARY KEY)
- name
- description
- created_at

### Product Companies
- id (PRIMARY KEY)
- name
- description
- created_at

### Products
- id (PRIMARY KEY)
- name
- code (UNIQUE)
- category_id (FOREIGN KEY)
- base_unit_id (FOREIGN KEY)
- base_rate
- base_wholesale_rate
- hsn_code
- company_id (FOREIGN KEY)
- tax_percentage
- created_at

### Product Units
- id (PRIMARY KEY)
- product_id (FOREIGN KEY)
- unit_id (FOREIGN KEY)
- conversion_rate
- retail_rate
- wholesale_rate

### Documents
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- category_id (FOREIGN KEY)
- unit_id (FOREIGN KEY)
- title
- content
- created_at
