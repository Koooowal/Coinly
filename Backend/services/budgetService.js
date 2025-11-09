import { db } from '../config/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getBudgets = async (userId) => {
  const sql = `
    SELECT 
      b.*,
      c.name as category_name,
      c.color as category_color
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.category_id
    WHERE b.user_id = ?
    ORDER BY b.start_date DESC
  `;
  
  return await query(sql, [userId]);
};

export const getBudgetById = async (userId, budgetId) => {
  const sql = `
    SELECT 
      b.*,
      c.name as category_name,
      c.color as category_color
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.category_id
    WHERE b.user_id = ? AND b.budget_id = ?
  `;
  
  const rows = await query(sql, [userId, budgetId]);
  return rows.length > 0 ? rows[0] : null;
};

export const checkBudgetStatus = async (userId, budgetId) => {
  const sql = 'CALL sp_check_budget_status(?, ?)';
  const result = await query(sql, [userId, budgetId]);
  
  return result[0][0];
};

export const createBudget = async (userId, data) => {
  const sql = `
    INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const result = await query(sql, [
    userId,
    data.category_id,
    data.amount,
    data.period,
    data.start_date,
    data.end_date
  ]);

  return {
    budget_id: result.insertId,
    ...data
  };
};

export const updateBudget = async (userId, budgetId, data) => {
  const checkSql = 'SELECT budget_id FROM budgets WHERE user_id = ? AND budget_id = ?';
  const exists = await query(checkSql, [userId, budgetId]);

  if (exists.length === 0) {
    return null;
  }

  const updates = [];
  const params = [];

  if (data.category_id) {
    updates.push('category_id = ?');
    params.push(data.category_id);
  }
  if (data.amount) {
    updates.push('amount = ?');
    params.push(data.amount);
  }
  if (data.period) {
    updates.push('period = ?');
    params.push(data.period);
  }
  if (data.start_date) {
    updates.push('start_date = ?');
    params.push(data.start_date);
  }
  if (data.end_date) {
    updates.push('end_date = ?');
    params.push(data.end_date);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId, budgetId);

  const sql = `UPDATE budgets SET ${updates.join(', ')} WHERE user_id = ? AND budget_id = ?`;
  await query(sql, params);

  return await getBudgetById(userId, budgetId);
};

export const deleteBudget = async (userId, budgetId) => {
  const checkSql = 'SELECT budget_id FROM budgets WHERE user_id = ? AND budget_id = ?';
  const exists = await query(checkSql, [userId, budgetId]);

  if (exists.length === 0) {
    return null;
  }

  const sql = 'DELETE FROM budgets WHERE user_id = ? AND budget_id = ?';
  await query(sql, [userId, budgetId]);

  return { success: true };
};