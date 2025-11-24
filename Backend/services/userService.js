import { db } from '../database/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getUserProfile = async (userId) => {
  const sql = `
    SELECT user_id, email, username, created_at
    FROM users
    WHERE user_id = ?
  `;
  
  const rows = await query(sql, [userId]);
  return rows.length > 0 ? rows[0] : null;
};

export const updateUserProfile = async (userId, data) => {
  const updates = [];
  const params = [];

  if (data.email) {
    updates.push('email = ?');
    params.push(data.email);
  }
  if (data.username) {
    updates.push('username = ?');
    params.push(data.username);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
  await query(sql, params);

  return await getUserProfile(userId);
};

export const getUserPreferences = async (userId) => {
  const sql = `
    SELECT currency, theme, enable_alerts
    FROM user_preferences
    WHERE user_id = ?
  `;
  
  const rows = await query(sql, [userId]);
  return rows.length > 0 ? rows[0] : null;
};

export const updateUserPreferences = async (userId, data) => {
  const updates = [];
  const params = [];

  if (data.currency) {
    updates.push('currency = ?');
    params.push(data.currency);
  }
  if (data.theme) {
    updates.push('theme = ?');
    params.push(data.theme);
  }
  if (data.enable_alerts !== undefined) {
    updates.push('enable_alerts = ?');
    params.push(data.enable_alerts);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId);

  const sql = `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`;
  await query(sql, params);

  return await getUserPreferences(userId);
};