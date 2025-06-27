import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'rewards.db');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    google_id TEXT UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    subscription_status TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    program_name TEXT NOT NULL,
    program_type TEXT NOT NULL,
    balance INTEGER NOT NULL,
    balance_text TEXT,
    email_id TEXT,
    email_date DATETIME,
    extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    emails_processed INTEGER DEFAULT 0,
    rewards_found INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

export interface User {
  id: number;
  email: string;
  google_id?: string;
  access_token?: string;
  refresh_token?: string;
  subscription_status: 'free' | 'premium';
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: number;
  user_id: number;
  program_name: string;
  program_type: string;
  balance: number;
  balance_text?: string;
  email_id?: string;
  email_date?: string;
  extracted_at: string;
}

export interface ScanHistory {
  id: number;
  user_id: number;
  scan_date: string;
  emails_processed: number;
  rewards_found: number;
}

export class DatabaseService {
  static createUser(userData: Partial<User>): User {
    const stmt = db.prepare(`
      INSERT INTO users (email, google_id, access_token, refresh_token, subscription_status, stripe_customer_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userData.email,
      userData.google_id,
      userData.access_token,
      userData.refresh_token,
      userData.subscription_status || 'free',
      userData.stripe_customer_id
    );
    
    return this.getUserById(result.lastInsertRowid as number)!;
  }

  static getUserById(id: number): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  }

  static getUserByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | null;
  }

  static getUserByGoogleId(googleId: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
    return stmt.get(googleId) as User | null;
  }

  static updateUser(id: number, userData: Partial<User>): void {
    const fields = Object.keys(userData).filter(key => key !== 'id');
    const values = fields.map(field => userData[field as keyof User]);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.map(field => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...values, id);
  }

  static createReward(rewardData: Omit<Reward, 'id' | 'extracted_at'>): Reward {
    const stmt = db.prepare(`
      INSERT INTO rewards (user_id, program_name, program_type, balance, balance_text, email_id, email_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      rewardData.user_id,
      rewardData.program_name,
      rewardData.program_type,
      rewardData.balance,
      rewardData.balance_text,
      rewardData.email_id,
      rewardData.email_date
    );
    
    return this.getRewardById(result.lastInsertRowid as number)!;
  }

  static getRewardById(id: number): Reward | null {
    const stmt = db.prepare('SELECT * FROM rewards WHERE id = ?');
    return stmt.get(id) as Reward | null;
  }

  static getRewardsByUserId(userId: number): Reward[] {
    const stmt = db.prepare('SELECT * FROM rewards WHERE user_id = ? ORDER BY extracted_at DESC');
    return stmt.all(userId) as Reward[];
  }

  static deleteOldRewards(userId: number): void {
    const stmt = db.prepare('DELETE FROM rewards WHERE user_id = ?');
    stmt.run(userId);
  }

  static createScanHistory(scanData: Omit<ScanHistory, 'id' | 'scan_date'>): ScanHistory {
    const stmt = db.prepare(`
      INSERT INTO scan_history (user_id, emails_processed, rewards_found)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(
      scanData.user_id,
      scanData.emails_processed,
      scanData.rewards_found
    );
    
    const getStmt = db.prepare('SELECT * FROM scan_history WHERE id = ?');
    return getStmt.get(result.lastInsertRowid) as ScanHistory;
  }

  static getLatestScan(userId: number): ScanHistory | null {
    const stmt = db.prepare('SELECT * FROM scan_history WHERE user_id = ? ORDER BY scan_date DESC LIMIT 1');
    return stmt.get(userId) as ScanHistory | null;
  }
}

export default db;