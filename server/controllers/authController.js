import db from '../config/database.js';

export const signUp = (req, res) => {
  const { email, password } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const result = stmt.run(email, password);
    console.log('User created:', { id: result.lastInsertRowid, email });
    res.json({ id: result.lastInsertRowid, email });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};

export const signIn = (req, res) => {
  const { email, password } = req.body;
  try {
    const stmt = db.prepare('SELECT id, email FROM users WHERE email = ? AND password = ?');
    const user = stmt.get(email, password);
    console.log('Sign in result:', user);
    
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
