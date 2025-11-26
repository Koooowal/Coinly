import { db } from '../database/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getAllRecurring = async (userId) => {
  const sql = `
    SELECT 
      r.*,
      a.name as account_name,
      c.name as category_name,
      c.color as category_color
    FROM recurring_transactions r
    LEFT JOIN accounts a ON r.account_id = a.account_id
    LEFT JOIN categories c ON r.category_id = c.category_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;
  
  return await query(sql, [userId]);
};

export const getRecurringById = async (recurringId, userId) => {
  const sql = `
    SELECT 
      r.*,
      a.name as account_name,
      c.name as category_name
    FROM recurring_transactions r
    LEFT JOIN accounts a ON r.account_id = a.account_id
    LEFT JOIN categories c ON r.category_id = c.category_id
    WHERE r.recurring_id = ? AND r.user_id = ?
  `;
  
  const rows = await query(sql, [recurringId, userId]);
  return rows.length > 0 ? rows[0] : null;
};

export const createRecurring = async (userId, data) => {
  const { account_id, category_id, amount, type, target_account_id, description, frequency, start_date, end_date, is_active } = data;
  
  const sql = `
    INSERT INTO recurring_transactions 
    (user_id, account_id, category_id, amount, type, target_account_id, description, frequency, start_date, end_date, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const result = await query(sql, [
    userId,
    account_id,
    category_id || null,
    amount,
    type,
    target_account_id || null,
    description || null,
    frequency,
    start_date,
    end_date || null,
    is_active !== undefined ? is_active : true
  ]);
  
  return result.insertId;
};

export const updateRecurring = async (recurringId, userId, data) => {
  const checkSql = 'SELECT recurring_id FROM recurring_transactions WHERE recurring_id = ? AND user_id = ?';
  const exists = await query(checkSql, [recurringId, userId]);
  
  if (exists.length === 0) {
    return null;
  }
  
  const updates = [];
  const params = [];
  
  if (data.account_id !== undefined) {
    updates.push('account_id = ?');
    params.push(data.account_id);
  }
  if (data.category_id !== undefined) {
    updates.push('category_id = ?');
    params.push(data.category_id);
  }
  if (data.amount !== undefined) {
    updates.push('amount = ?');
    params.push(data.amount);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.frequency !== undefined) {
    updates.push('frequency = ?');
    params.push(data.frequency);
  }
  if (data.start_date !== undefined) {
    updates.push('start_date = ?');
    params.push(data.start_date);
  }
  if (data.end_date !== undefined) {
    updates.push('end_date = ?');
    params.push(data.end_date);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(data.is_active);
  }
  
  if (updates.length === 0) {
    return null;
  }
  
  params.push(recurringId, userId);
  
  const sql = `UPDATE recurring_transactions SET ${updates.join(', ')} WHERE recurring_id = ? AND user_id = ?`;
  await query(sql, params);
  
  return await getRecurringById(recurringId, userId);
};

export const deleteRecurring = async (recurringId, userId) => {
  const checkSql = 'SELECT recurring_id FROM recurring_transactions WHERE recurring_id = ? AND user_id = ?';
  const exists = await query(checkSql, [recurringId, userId]);
  
  if (exists.length === 0) {
    return null;
  }
  
  const sql = 'DELETE FROM recurring_transactions WHERE recurring_id = ? AND user_id = ?';
  await query(sql, [recurringId, userId]);
  
  return { success: true };
};

export const toggleActiveStatus = async (recurringId, userId, isActive) => {
  const sql = 'UPDATE recurring_transactions SET is_active = ? WHERE recurring_id = ? AND user_id = ?';
  const result = await query(sql, [isActive, recurringId, userId]);
  
  return result.affectedRows > 0;
};