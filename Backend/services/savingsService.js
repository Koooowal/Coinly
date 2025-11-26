import { db } from '../database/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getSavingsGoals = async (userId) => {
  const sql = `
    SELECT 
      goal_id,
      name,
      target_amount,
      current_amount,
      target_date,
      status,
      ROUND((current_amount / target_amount * 100), 2) as progress_percentage,
      DATEDIFF(target_date, CURDATE()) as days_remaining,
      created_at
    FROM savings_goals
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  
  return await query(sql, [userId]);
};

export const getSavingsGoalById = async (userId, goalId) => {
  const sql = `
    SELECT 
      goal_id,
      name,
      target_amount,
      current_amount,
      target_date,
      status,
      ROUND((current_amount / target_amount * 100), 2) as progress_percentage,
      DATEDIFF(target_date, CURDATE()) as days_remaining,
      created_at
    FROM savings_goals
    WHERE user_id = ? AND goal_id = ?
  `;
  
  const rows = await query(sql, [userId, goalId]);
  return rows.length > 0 ? rows[0] : null;
};

export const createSavingsGoal = async (userId, data) => {
  const sql = `
    INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await query(sql, [
    userId,
    data.name,
    data.target_amount,
    data.current_amount,
    data.target_date
  ]);

  return {
    goal_id: result.insertId,
    ...data
  };
};

export const updateSavingsGoal = async (userId, goalId, data) => {
  const checkSql = 'SELECT goal_id FROM savings_goals WHERE user_id = ? AND goal_id = ?';
  const exists = await query(checkSql, [userId, goalId]);

  if (exists.length === 0) {
    return null;
  }

  const updates = [];
  const params = [];

  if (data.name) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.target_amount) {
    updates.push('target_amount = ?');
    params.push(data.target_amount);
  }
  if (data.current_amount !== undefined) {
    updates.push('current_amount = ?');
    params.push(data.current_amount);
  }
  if (data.target_date) {
    updates.push('target_date = ?');
    params.push(data.target_date);
  }
  if (data.status) {
    updates.push('status = ?');
    params.push(data.status);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId, goalId);

  const sql = `UPDATE savings_goals SET ${updates.join(', ')} WHERE user_id = ? AND goal_id = ?`;
  await query(sql, params);

  return await getSavingsGoalById(userId, goalId);
};

export const deleteSavingsGoal = async (userId, goalId) => {
  const checkSql = 'SELECT goal_id FROM savings_goals WHERE user_id = ? AND goal_id = ?';
  const exists = await query(checkSql, [userId, goalId]);

  if (exists.length === 0) {
    return null;
  }

  const sql = 'DELETE FROM savings_goals WHERE user_id = ? AND goal_id = ?';
  await query(sql, [userId, goalId]);

  return { success: true };
};

export const addDepositToGoal = async (userId, goalId, depositData) => {
  try {
    const { amount } = depositData;
    
    console.log('Adding deposit:', { userId, goalId, amount });
    
    const checkSql = 'SELECT goal_id, user_id, current_amount, target_amount FROM savings_goals WHERE goal_id = ? AND user_id = ?';
    const goals = await query(checkSql, [parseInt(goalId), userId]);

    if (goals.length === 0) {
      throw new Error('Goal not found or does not belong to you');
    }

    const goal = goals[0];
    const newAmount = parseFloat(goal.current_amount) + parseFloat(amount);
    const newStatus = newAmount >= parseFloat(goal.target_amount) ? 'completed' : 'active';

    const updateSql = 'UPDATE savings_goals SET current_amount = ?, status = ? WHERE goal_id = ?';
    await query(updateSql, [newAmount, newStatus, parseInt(goalId)]);
    
    console.log('Deposit successful! New amount:', newAmount);
    
    return { 
      success: true,
      new_amount: newAmount,
      status: newStatus
    };
    
  } catch (err) {
    console.error('Deposit error:', err);
    throw err;
  }
};

export const getSavingsAccounts = async (userId) => {
  const sql = `
    SELECT savings_account_id, name, balance, interest_rate, created_at
    FROM savings_accounts
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  
  return await query(sql, [userId]);
};

export const getSavingsAccountById = async (userId, accountId) => {
  const sql = `
    SELECT savings_account_id, name, balance, interest_rate, created_at
    FROM savings_accounts
    WHERE user_id = ? AND savings_account_id = ?
  `;
  
  const rows = await query(sql, [userId, accountId]);
  return rows.length > 0 ? rows[0] : null;
};

export const createSavingsAccount = async (userId, data) => {
  const sql = `
    INSERT INTO savings_accounts (user_id, name, balance, interest_rate)
    VALUES (?, ?, ?, ?)
  `;
  
  const result = await query(sql, [
    userId,
    data.name,
    data.balance,
    data.interest_rate
  ]);

  return {
    savings_account_id: result.insertId,
    ...data
  };
};

export const updateSavingsAccount = async (userId, accountId, data) => {
  const checkSql = 'SELECT savings_account_id FROM savings_accounts WHERE user_id = ? AND savings_account_id = ?';
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
  if (data.balance !== undefined) {
    updates.push('balance = ?');
    params.push(data.balance);
  }
  if (data.interest_rate !== undefined) {
    updates.push('interest_rate = ?');
    params.push(data.interest_rate);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId, accountId);

  const sql = `UPDATE savings_accounts SET ${updates.join(', ')} WHERE user_id = ? AND savings_account_id = ?`;
  await query(sql, params);

  return await getSavingsAccountById(userId, accountId);
};

export const deleteSavingsAccount = async (userId, accountId) => {
  const checkSql = 'SELECT savings_account_id FROM savings_accounts WHERE user_id = ? AND savings_account_id = ?';
  const exists = await query(checkSql, [userId, accountId]);

  if (exists.length === 0) {
    return null;
  }

  const sql = 'DELETE FROM savings_accounts WHERE user_id = ? AND savings_account_id = ?';
  await query(sql, [userId, accountId]);

  return { success: true };
};