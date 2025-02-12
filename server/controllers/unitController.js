import db from '../config/database.js';

export const createUnit = (req, res) => {
  const { name, description } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO units (name, description) VALUES (?, ?)');
    const result = stmt.run(name, description);
    res.json({ id: result.lastInsertRowid, name, description });
  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUnit = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const stmt = db.prepare('UPDATE units SET name = ?, description = ? WHERE id = ?');
    stmt.run(name, description, id);
    res.json({ id: parseInt(id), name, description });
  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUnits = (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM units ORDER BY name');
    const units = stmt.all();
    res.json(units);
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUnit = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM units WHERE id = ?');
    stmt.run(id);
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Delete unit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
