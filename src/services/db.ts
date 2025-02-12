import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

class DatabaseService {
  private static instance: DatabaseService;
  private db: Database | null = null;
  private readonly DB_FILE_PATH = path.join(process.cwd(), 'data', 'dms.sqlite');

  private constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const SQL = await initSqlJs({
        locateFile: () => '/sql-wasm.wasm'
      });

      // Try to load existing database
      if (fs.existsSync(this.DB_FILE_PATH)) {
        const fileBuffer = fs.readFileSync(this.DB_FILE_PATH);
        this.db = new SQL.Database(new Uint8Array(fileBuffer));
      } else {
        // Create new database
        this.db = new SQL.Database();
        
        // Initialize tables
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        this.db.run(`
          CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `);

        // Save initial database
        this.saveDatabase();
      }

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private saveDatabase(): void {
    if (!this.db) throw new Error('Database not initialized');
    const data = this.db.export();
    fs.writeFileSync(this.DB_FILE_PATH, Buffer.from(data));
  }

  getDb(): Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // User operations
  async createUser(email: string, password: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      this.db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
      this.saveDatabase();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(email: string, password: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = this.db.exec(`
        SELECT id, email, created_at 
        FROM users 
        WHERE email = '${email}' AND password = '${password}'
      `);
      return result.length > 0 ? result[0].values[0] : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Document operations
  async createDocument(userId: number, title: string, content: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      this.db.run(
        'INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title, content]
      );
      this.saveDatabase();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getUserDocuments(userId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = this.db.exec(`
        SELECT id, title, content, created_at 
        FROM documents 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `);
      return result.length > 0 ? result[0].values : [];
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  // Export database
  exportDatabase(): Uint8Array {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }
}

export const dbService = DatabaseService.getInstance();
export default dbService;
