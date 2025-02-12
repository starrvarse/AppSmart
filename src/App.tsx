import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import UnitPage from './pages/Unit/Unit';
import CategoryPage from './pages/Category/Category';
import ProductCompanyPage from './pages/ProductCompany/ProductCompany';
import ProductPage from './pages/Product/Product';
import AddProduct from './pages/Product/AddProduct';
import InvoicePage from './pages/Invoice/Invoice';
import AddInvoice from './pages/Invoice/AddInvoice';
import CustomerPage from './pages/Customer/Customer';
import AddCustomer from './pages/Customer/AddCustomer';

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/units" element={<UnitPage />} />
      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/product-companies" element={<ProductCompanyPage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/products/add" element={<AddProduct />} />
      <Route path="/products/edit/:id" element={<AddProduct />} />
      <Route path="/invoices" element={<InvoicePage />} />
      <Route path="/invoices/add" element={<AddInvoice />} />
      <Route path="/invoices/edit/:id" element={<AddInvoice />} />
      <Route path="/customers" element={<CustomerPage />} />
      <Route path="/customers/add" element={<AddCustomer />} />
      <Route path="/customers/edit/:id" element={<AddCustomer />} />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/auth/signin" replace />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/auth/signin" replace />} />
    </Routes>
  );
}

export default App;
