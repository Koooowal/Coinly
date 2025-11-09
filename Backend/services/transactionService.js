import { db } from '../config/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getTransactions = async (userId, filters) => {
  let sql = `
    SELECT 
      t.*,
      c.name as category_name,
      c.color as category_color,
      a.name as account_name,
      ta.name as target_account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.category_id
    LEFT JOIN accounts a ON t.account_id = a.account_id
    LEFT JOIN accounts ta ON t.target_account_id = ta.account_id
    WHERE t.user_id = ?
  `;
  
  const params = [userId];

  if (filters.start_date) {
    sql += ' AND t.date >= ?';
    params.push(filters.start_date);
  }
  if (filters.end_date) {
    sql += ' AND t.date <= ?';
    params.push(filters.end_date);
  }
  if (filters.type) {
    sql += ' AND t.type = ?';
    params.push(filters.type);
  }
  if (filters.category_id) {
    sql += ' AND t.category_id = ?';
    params.push(filters.category_id);
  }
  if (filters.account_id) {
    sql += ' AND t.account_id = ?';
    params.push(filters.account_id);
  }

  sql += ' ORDER BY t.date DESC, t.created_at DESC';

  const rows = await query(sql, params);
  return rows;
};

export const getTransactionById = async (userId, transactionId) => {
  const sql = `
    SELECT 
      t.*,
      c.name as category_name,
      c.color as category_color,
      a.name as account_name,
      ta.name as target_account_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.category_id
    LEFT JOIN accounts a ON t.account_id = a.account_id
    LEFT JOIN accounts ta ON t.target_account_id = ta.account_id
    WHERE t.transaction_id = ? AND t.user_id = ?
  `;
  
  const rows = await query(sql, [transactionId, userId]);
  return rows.length > 0 ? rows[0] : null;
};

export const addTransaction = async (userId, data) => {
  const sql = 'CALL sp_add_transaction(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [
    userId,
    data.account_id,
    data.category_id || null,
    data.amount,
    data.type,
    data.target_account_id || null,
    data.description || null,
    data.payment_method || null,
    data.date
  ];
  
  await query(sql, params);
  
  return { success: true, message: 'Transakcja dodana pomyślnie' };
};

export const updateTransaction = async (userId, transactionId, data) => {
  await deleteTransaction(userId, transactionId);
  await addTransaction(userId, data);
  
  return { success: true, message: 'Transakcja zaktualizowana' };
};

export const deleteTransaction = async (userId, transactionId) => {
  const checkSql = 'SELECT transaction_id FROM transactions WHERE transaction_id = ? AND user_id = ?';
  const exists = await query(checkSql, [transactionId, userId]);
  
  if (exists.length === 0) {
    return null;
  }

  const sql = 'CALL sp_delete_transaction(?)';
  await query(sql, [transactionId]);
  
  return { success: true };
};

export const getTransactionStats = async (userId, startDate, endDate) => {
  const sql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
      COUNT(*) as total_transactions
    FROM transactions
    WHERE user_id = ?
    ${startDate ? 'AND date >= ?' : ''}
    ${endDate ? 'AND date <= ?' : ''}
  `;
  
  const params = [userId];
  if (startDate) params.push(startDate);
  if (endDate) params.push(endDate);
  
  const rows = await query(sql, params);
  return rows[0];
};