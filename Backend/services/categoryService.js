import { db } from '../database/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);

export const getCategories = async (userId, type) => {
  let sql = `
    SELECT category_id, name, type, color, icon, created_at
    FROM categories
    WHERE user_id = ?
  `;
  
  const params = [userId];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  sql += ' ORDER BY name ASC';

  return await query(sql, params);
};

export const getCategoryById = async (userId, categoryId) => {
  const sql = `
    SELECT category_id, name, type, color, icon, created_at
    FROM categories
    WHERE user_id = ? AND category_id = ?
  `;
  
  const rows = await query(sql, [userId, categoryId]);
  return rows.length > 0 ? rows[0] : null;
};

export const createCategory = async (userId, data) => {
  const sql = `
    INSERT INTO categories (user_id, name, type, color, icon)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const result = await query(sql, [
    userId,
    data.name,
    data.type,
    data.color,
    data.icon
  ]);

  return {
    category_id: result.insertId,
    ...data
  };
};

export const updateCategory = async (userId, categoryId, data) => {
  const checkSql = 'SELECT category_id FROM categories WHERE user_id = ? AND category_id = ?';
  const exists = await query(checkSql, [userId, categoryId]);

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
  if (data.color) {
    updates.push('color = ?');
    params.push(data.color);
  }
  if (data.icon) {
    updates.push('icon = ?');
    params.push(data.icon);
  }

  if (updates.length === 0) {
    return null;
  }

  params.push(userId, categoryId);

  const sql = `UPDATE categories SET ${updates.join(', ')} WHERE user_id = ? AND category_id = ?`;
  await query(sql, params);

  return await getCategoryById(userId, categoryId);
};

export const deleteCategory = async (userId, categoryId) => {
  const checkSql = 'SELECT category_id FROM categories WHERE user_id = ? AND category_id = ?';
  const exists = await query(checkSql, [userId, categoryId]);

  if (exists.length === 0) {
    return null;
  }

  const sql = 'DELETE FROM categories WHERE user_id = ? AND category_id = ?';
  await query(sql, [userId, categoryId]);

  return { success: true };
};