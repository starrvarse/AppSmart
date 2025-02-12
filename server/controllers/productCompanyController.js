import db from '../config/database.js';

export const createProductCompany = (req, res) => {
  const { name, description } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO product_companies (name, description) VALUES (?, ?)');
    const result = stmt.run(name, description);
    res.json({ id: result.lastInsertRowid, name, description });
  } catch (error) {
    console.error('Create product company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProductCompany = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const stmt = db.prepare('UPDATE product_companies SET name = ?, description = ? WHERE id = ?');
    stmt.run(name, description, id);
    res.json({ id: parseInt(id), name, description });
  } catch (error) {
    console.error('Update product company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllProductCompanies = (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM product_companies ORDER BY name');
    const companies = stmt.all();
    res.json(companies);
  } catch (error) {
    console.error('Get product companies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProductCompany = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM product_companies WHERE id = ?');
    stmt.run(id);
    res.json({ message: 'Product company deleted successfully' });
  } catch (error) {
    console.error('Delete product company error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
