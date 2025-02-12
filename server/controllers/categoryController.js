import db from '../config/database.js';

export const createCategory = (req, res) => {
  const { name, description } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    const result = stmt.run(name, description);
    res.json({ id: result.lastInsertRowid, name, description });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const stmt = db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?');
    stmt.run(name, description, id);
    res.json({ id: parseInt(id), name, description });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllCategories = (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
    const categories = stmt.all();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCategory = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
