import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
let db;

beforeAll(async () => {
  db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    port: process.env.DB_PORT
  });
});

afterAll(async () => {
  if (db) {
    await db.end();
  }
});

describe('Testy integracyjne COINLY', () => {
  
  let testUserId;
  let testAccountId;
  let testCategoryId;
  afterAll(async () => {
    if (testUserId) {
      await db.query('DELETE FROM users WHERE user_id = ?', [testUserId]);
    }
  });

  test('Użytkownik może utworzyć konto, dodać konto bankowe i kategorię', async () => {
    const email = 'integration_test@coinly.pl';
    const username = 'integrationuser';
    const password = 'test123456';
    testUserId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (user_id, email, username, password_hash) VALUES (?, ?, ?, ?)',
      [testUserId, email, username, passwordHash]
    );
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [testUserId]);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(email);
    expect(users[0].username).toBe(username);
    const isPasswordCorrect = await bcrypt.compare(password, users[0].password_hash);
    expect(isPasswordCorrect).toBe(true);
    const [accountResult] = await db.query(
      'INSERT INTO accounts (user_id, name, type, balance, currency) VALUES (?, ?, ?, ?, ?)',
      [testUserId, 'Konto główne', 'checking', 5000, 'PLN']
    );
    testAccountId = accountResult.insertId;
    const [accounts] = await db.query('SELECT * FROM accounts WHERE account_id = ?', [testAccountId]);
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('Konto główne');
    expect(parseFloat(accounts[0].balance)).toBe(5000);
    const [categoryResult] = await db.query(
      'INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
      [testUserId, 'Jedzenie', 'expense', '#FF6B6B']
    );
    
    testCategoryId = categoryResult.insertId;
    const [categories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [testCategoryId]);
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Jedzenie');
    expect(categories[0].type).toBe('expense');
  });

  test('Wydatki automatycznie aktualizują saldo konta', async () => {
    const [accountsBefore] = await db.query(
      'SELECT balance FROM accounts WHERE account_id = ?',
      [testAccountId]
    );
    const initialBalance = parseFloat(accountsBefore[0].balance);
    expect(initialBalance).toBe(5000);
    const startDate = new Date().toISOString().split('T')[0];
    await db.query(
      'CALL sp_add_transaction(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [testUserId, testAccountId, testCategoryId, 500, 'expense', null, 'Zakupy 1', 'card', startDate]
    );
    const [accounts1] = await db.query(
      'SELECT balance FROM accounts WHERE account_id = ?',
      [testAccountId]
    );
    expect(parseFloat(accounts1[0].balance)).toBe(4500);
    await db.query(
      'CALL sp_add_transaction(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [testUserId, testAccountId, testCategoryId, 300, 'expense', null, 'Zakupy 2', 'card', startDate]
    );
    const [accounts2] = await db.query(
      'SELECT balance FROM accounts WHERE account_id = ?',
      [testAccountId]
    );
    expect(parseFloat(accounts2[0].balance)).toBe(4200);
    await db.query(
      'CALL sp_add_transaction(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [testUserId, testAccountId, testCategoryId, 700, 'expense', null, 'Zakupy 3', 'card', startDate]
    );
    const [accounts3] = await db.query(
      'SELECT balance FROM accounts WHERE account_id = ?',
      [testAccountId]
    );
    const finalBalance = parseFloat(accounts3[0].balance);
    expect(finalBalance).toBe(3500);
    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE account_id = ? AND type = ?',
      [testAccountId, 'expense']
    );
    expect(transactions).toHaveLength(3);
    const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    expect(totalSpent).toBe(1500); 
    expect(initialBalance - totalSpent).toBe(finalBalance);
    expect(5000 - 1500).toBe(3500);
  });
});