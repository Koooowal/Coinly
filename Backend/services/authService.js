import { db } from '../database/db.js';
import { promisify } from 'util';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { v4 as uuidv4 } from 'uuid';

const query = promisify(db.query).bind(db);

export const registerUser = async (email, username, password) => {
  const checkEmailSql = 'SELECT user_id FROM users WHERE email = ?';
  const existingEmail = await query(checkEmailSql, [email]);
  
  if (existingEmail.length > 0) {
    throw new Error('Email już istnieje');
  }

  const checkUsernameSql = 'SELECT user_id FROM users WHERE username = ?';
  const existingUsername = await query(checkUsernameSql, [username]);
  
  if (existingUsername.length > 0) {
    throw new Error('Nazwa użytkownika już istnieje');
  }

  const hashedPassword = await hashPassword(password);
  const userId = uuidv4();

  const insertSql = `
    INSERT INTO users (user_id, email, username, password_hash) 
    VALUES (?, ?, ?, ?)
  `;
  
  await query(insertSql, [userId, email, username, hashedPassword]);

  const prefSql = `
    INSERT INTO user_preferences (user_id, currency, theme, enable_alerts)
    VALUES (?, 'PLN', 'dark', TRUE)
  `;
  await query(prefSql, [userId]);

  return {
    userId,
    email,
    username
  };
};

export const loginUser = async (email, password) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const users = await query(sql, [email]);

  if (users.length === 0) {
    throw new Error('Nieprawidłowy email lub hasło');
  }

  const user = users[0];
  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Nieprawidłowy email lub hasło');
  }

  return {
    userId: user.user_id,
    email: user.email,
    username: user.username,
    createdAt: user.created_at
  };
};

export const getUserById = async (userId) => {
  const sql = `
    SELECT u.user_id, u.email, u.username, u.created_at,
           up.currency, up.theme, up.enable_alerts
    FROM users u
    LEFT JOIN user_preferences up ON u.user_id = up.user_id
    WHERE u.user_id = ?
  `;
  
  const users = await query(sql, [userId]);
  
  if (users.length === 0) {
    return null;
  }

  return users[0];
};