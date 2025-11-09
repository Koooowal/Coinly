import { db } from '../config/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getAccounts = async (userId) => {
  const sql = `
    SELECT account_id, name, type, balance, currency, created_at
    FROM accounts
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  
  return await query(sql, [userId]);
};

export const getAccountById = async (userId, accountId) => {
  const sql = `
    SELECT account_id, name, type, balance, currency, created_at
    FROM accounts
    WHERE user_id = ? AND account_id = ?
  `;
  
  const rows = await query(sql, [userId, accountId]);
  return rows.length > 0 ? rows[0] : null;
};

export const createAccount = async (userId, data) => {
  const sql = `
    INSERT INTO accounts (user_id, name, type, balance, currency)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await query(sql, [
    userId,
    data.name,
    data.type,
    data.balance,
    data.currency
  ]);

  return {
    account_id: result.insertId,
    ...data
  };
};

export const updateAccount = async (userId, accountId, data) => {
  const checkSql = 'SELECT account_id FROM accounts WHERE user_id = ? AND account_id = ?';
  const exists = await query(checkSql, [userId, accountId]);

  if (exists.length === 0) {
    return null;
  }

  const updates = [];
  const params = [];

  if (data.name) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.type) {
    updates.push('type = ?');
    params.push(data.type);
  }
  if (data.balance !== undefined) {
    updates.push('balance = ?');
    params.push(data.balance);
  }
  if (data.currency) {
    updates.push('currency = ?');
    params.push(data.currency);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId, accountId);

  const sql = `UPDATE accounts SET ${updates.join(', ')} WHERE user_id = ? AND account_id = ?`;
  await query(sql, params);

  return await getAccountById(userId, accountId);
};

export const deleteAccount = async (userId, accountId) => {
  const checkSql = 'SELECT account_id FROM accounts WHERE user_id = ? AND account_id = ?';
  const exists = await query(checkSql, [userId, accountId]);

  if (exists.length === 0) {
    return null;
  }

  const sql = 'DELETE FROM accounts WHERE user_id = ? AND account_id = ?';
  await query(sql, [userId, accountId]);

  return { success: true };
};