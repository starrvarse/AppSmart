import db from '../config/database.js';

export const createDocument = (req, res) => {
  const { userId, categoryId, unitId, title, content } = req.body;
  try {
    const stmt = db.prepare(
      'INSERT INTO documents (user_id, category_id, unit_id, title, content) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(userId, categoryId, unitId, title, content);
    res.json({ id: result.lastInsertRowid, title, content });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDocumentsByUserId = (req, res) => {
  const { userId } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT d.*, c.name as category_name, u.name as unit_name
      FROM documents d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN units u ON d.unit_id = u.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
    `);
    const documents = stmt.all(userId);
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
