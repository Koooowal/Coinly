import { db } from '../config/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const generateMonthlyReport = async (userId, year, month) => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const sql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
  `;

  const summary = await query(sql, [userId, startDate, endDate]);

  const categorySql = `
    SELECT 
      c.name,
      c.color,
      t.type,
      SUM(t.amount) as total,
      COUNT(t.transaction_id) as count
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
    GROUP BY t.category_id, c.name, c.color, t.type
    ORDER BY total DESC
  `;

  const byCategory = await query(categorySql, [userId, startDate, endDate]);

  return {
    period: { year, month, start: startDate, end: endDate },
    summary: summary[0],
    byCategory
  };
};

export const generateYearlyReport = async (userId, year) => {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const sql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
  `;

  const summary = await query(sql, [userId, startDate, endDate]);

  const monthlySql = `
    SELECT 
      MONTH(date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY MONTH(date)
    ORDER BY month
  `;

  const byMonth = await query(monthlySql, [userId, startDate, endDate]);

  return {
    period: { year, start: startDate, end: endDate },
    summary: summary[0],
    byMonth
  };
};

export const generateCategoryReport = async (userId, startDate, endDate, type) => {
  let sql = `
    SELECT 
      c.name,
      c.color,
      c.icon,
      t.type,
      SUM(t.amount) as total,
      COUNT(t.transaction_id) as count,
      AVG(t.amount) as average
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
  `;

  const params = [userId, startDate, endDate];

  if (type) {
    sql += ' AND t.type = ?';
    params.push(type);
  }

  sql += ' GROUP BY t.category_id, c.name, c.color, c.icon, t.type ORDER BY total DESC';

  return await query(sql, params);
};

export const getExpensesByPeriod = async (userId, startDate, endDate) => {
  const sql = 'CALL sp_get_expenses_by_period(?, ?, ?)';
  const result = await query(sql, [userId, startDate, endDate]);
  
  return result[0];
};

export const getIncomeVsExpenses = async (userId, startDate, endDate) => {
  const sql = `
    SELECT 
      DATE_FORMAT(date, '%Y-%m') as period,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY period
  `;

  return await query(sql, [userId, startDate, endDate]);
};