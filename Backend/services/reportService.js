import { db } from '../database/db.js';
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

  const summaryResult = await query(sql, [userId, startDate, endDate]);
  
  const totalIncome = parseFloat(summaryResult[0].total_income || 0);
  const totalExpenses = parseFloat(summaryResult[0].total_expenses || 0);
  const netBalance = totalIncome - totalExpenses;

  const categorySql = `
    SELECT 
      c.name as category_name,
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
    summary: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_balance: netBalance,
      income_count: summaryResult[0].income_count,
      expense_count: summaryResult[0].expense_count
    },
    categories: byCategory
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

  const summaryResult = await query(sql, [userId, startDate, endDate]);
  
  const totalIncome = parseFloat(summaryResult[0].total_income || 0);
  const totalExpenses = parseFloat(summaryResult[0].total_expenses || 0);
  const netBalance = totalIncome - totalExpenses;

  const monthlySql = `
    SELECT 
      MONTH(date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as net_balance
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY MONTH(date)
    ORDER BY month
  `;

  const byMonth = await query(monthlySql, [userId, startDate, endDate]);

  return {
    period: { year, start: startDate, end: endDate },
    summary: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_balance: netBalance,
      income_count: summaryResult[0].income_count,
      expense_count: summaryResult[0].expense_count
    },
    monthly_breakdown: byMonth
  };
};

export const generateCategoryReport = async (userId, startDate, endDate, type) => {
  let totalSql = `
    SELECT SUM(t.amount) as total_sum
    FROM transactions t
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
  `;
  
  let totalParams = [userId, startDate, endDate];
  
  if (type) {
    totalSql += ' AND t.type = ?';
    totalParams.push(type);
  }
  
  const totalResult = await query(totalSql, totalParams);
  const totalSum = parseFloat(totalResult[0]?.total_sum || 0);

  let sql = `
    SELECT 
      c.name as category_name,
      c.color,
      c.icon,
      t.type,
      SUM(t.amount) as total,
      COUNT(t.transaction_id) as count,
      AVG(t.amount) as average,
      ROUND((SUM(t.amount) / ?) * 100, 2) as percentage
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
  `;

  let params = [totalSum > 0 ? totalSum : 1, userId, startDate, endDate];

  if (type) {
    sql += ' AND t.type = ?';
    params.push(type);
  }

  sql += ' GROUP BY t.category_id, c.name, c.color, c.icon, t.type HAVING total > 0 ORDER BY total DESC';

  const categories = await query(sql, params);

  return {
    total: totalSum,
    categories: categories
  };
};

export const getExpensesByPeriod = async (userId, startDate, endDate) => {
  const sql = 'CALL sp_get_expenses_by_period(?, ?, ?)';
  const result = await query(sql, [userId, startDate, endDate]);
  
  
  

  const expenses = (result[0] || []).map(item => ({
    category_name: item.category_name,
    category_color: item.category_color,
    total: parseFloat(item.total_amount || 0),
    count: item.transaction_count,
    percentage: parseFloat(item.percentage || 0)
  }));
  
  console.log('Mapped expenses:', expenses);
  
  return expenses;
};

export const getIncomeVsExpenses = async (userId, startDate, endDate) => {
  const sql = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expenses_count,
      (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as net_balance
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ?
  `;

  const result = await query(sql, [userId, startDate, endDate]);
  return result[0];
};


export const getIncomesByPeriod = async (userId, startDate, endDate) => {

  const totalSql = `
    SELECT SUM(amount) as total_sum
    FROM transactions
    WHERE user_id = ? AND date BETWEEN ? AND ? AND type = 'income'
  `;
  const totalResult = await query(totalSql, [userId, startDate, endDate]);
  const totalSum = parseFloat(totalResult[0]?.total_sum || 0);
  
  if (totalSum === 0) {
    return [];
  }
  
  const sql = `
    SELECT 
      c.name as category_name,
      c.color as category_color,
      SUM(t.amount) as total,
      COUNT(t.transaction_id) as count,
      ROUND((SUM(t.amount) / ?) * 100, 2) as percentage
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ? AND t.type = 'income'
    GROUP BY t.category_id, c.name, c.color
    HAVING total > 0
    ORDER BY total DESC
  `;
  
  const result = await query(sql, [totalSum, userId, startDate, endDate]);
  
  return result.map(item => ({
    category_name: item.category_name,
    category_color: item.category_color,
    total: parseFloat(item.total || 0),
    count: item.count,
    percentage: parseFloat(item.percentage || 0)
  }));
};