import db from '../config/database.js';

export const createCustomer = (req, res) => {
  const { name, email, phone, address, type = 'retail' } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO customers (name, email, phone, address, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      name,
      email || null,
      phone || null,
      address || null,
      type
    );

    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCustomer = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, type } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, address = ?, type = ?
      WHERE id = ?
    `);
    
    stmt.run(
      name,
      email || null,
      phone || null,
      address || null,
      type,
      id
    );

    res.json({ id: parseInt(id) });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllCustomers = (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM customers ORDER BY name');
    const customers = stmt.all();
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCustomerById = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
    const customer = stmt.get(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchCustomers = (req, res) => {
  const { query } = req.query;
  try {
    const stmt = db.prepare(`
      SELECT * FROM customers 
      WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
      ORDER BY name
    `);
    const searchPattern = `%${query}%`;
    const customers = stmt.all(searchPattern, searchPattern, searchPattern);
    res.json(customers);
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCustomer = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    stmt.run(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
