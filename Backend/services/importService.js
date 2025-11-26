// importService.js - Service for importing data

import { db } from '../database/db.js';
import { promisify } from 'util';
import ExcelJS from 'exceljs';

const query = promisify(db.query).bind(db);

/**
 * Parse CSV file
 */
export const parseCSV = async (buffer) => {
  const csvString = buffer.toString('utf-8');
  const lines = csvString.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  console.log('CSV Headers:', headers);

  // Parse rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    // Skip if line has no values or wrong number
    if (values.length === 0 || values.every(v => !v || v.trim() === '')) {
      console.log(`Skipping empty line ${i + 1}`);
      continue;
    }
    
    const row = {};
    headers.forEach((header, index) => {
      // Get value or empty string
      const value = values[index] !== undefined ? values[index].trim() : '';
      row[header] = value;
    });
    
    // Only add if row has at least date, type, and amount
    if (row.date && row.type && row.amount) {
      data.push(row);
    } else {
      console.log(`Skipping invalid row ${i + 1}:`, row);
    }
  }

  console.log(`Parsed ${data.length} valid rows from CSV`);

  return normalizeData(data);
};

/**
 * Parse CSV line (handles quoted values with commas)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Push the last value
  values.push(current);
  
  return values;
}

/**
 * Parse JSON file
 */
export const parseJSON = (buffer) => {
  try {
    const jsonString = buffer.toString('utf-8');
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of transactions');
    }

    return normalizeData(data);
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
};

/**
 * Parse Excel file
 */
export const parseExcel = async (buffer) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Excel file has no worksheets');
    }

    const data = [];
    const headers = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Parse headers
        row.eachCell((cell) => {
          headers.push(String(cell.value).toLowerCase().trim());
        });
      } else {
        // Parse data rows
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            let value = cell.value;
            
            // Handle Excel dates (serial numbers)
            if (header === 'date' && typeof value === 'number') {
              // Excel serial date to JS Date
              const date = new Date((value - 25569) * 86400 * 1000);
              value = date.toISOString().split('T')[0];
            } else if (header === 'date' && value instanceof Date) {
              // Already a Date object
              value = value.toISOString().split('T')[0];
            }
            
            rowData[header] = value;
          }
        });
        
        // Only add rows with data (skip TOTAL row)
        if (Object.keys(rowData).length > 0 && rowData.type !== 'TOTAL') {
          data.push(rowData);
        }
      }
    });

    return normalizeData(data);
  } catch (error) {
    throw new Error('Invalid Excel format: ' + error.message);
  }
};

/**
 * Normalize data (map different column names to standard format)
 */
function normalizeData(data) {
  return data.map((row, index) => {
    // Convert date if it's in ISO format (from exported JSON)
    let dateValue = row.date || row.Date || row.DATE || row.transaction_date;
    
    if (dateValue) {
      // Handle different date formats
      if (typeof dateValue === 'number') {
        // Excel serial date
        const date = new Date((dateValue - 25569) * 86400 * 1000);
        dateValue = date.toISOString().split('T')[0];
      } else if (dateValue instanceof Date) {
        // JS Date object
        dateValue = dateValue.toISOString().split('T')[0];
      } else if (typeof dateValue === 'string') {
        // Check if it's a Date.toString() format
        if (dateValue.includes('GMT') || dateValue.includes('00:00:00')) {
          // Parse as date: "Mon Nov 24 2025 00:00:00 GMT" → Date object
          const parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            dateValue = parsedDate.toISOString().split('T')[0];
          }
        } else if (dateValue.includes('T')) {
          // ISO format: 2025-11-24T23:00:00.000Z → 2025-11-25
          dateValue = dateValue.split('T')[0];
        } else {
          // Already in correct format (hopefully)
          dateValue = dateValue.trim();
        }
      }
    }

    // Get description (skip [AUTO] prefix from exports)
    let description = row.description || row.Description || row.DESCRIPTION || row.desc;
    if (description && description.startsWith('[AUTO]')) {
      description = description.replace('[AUTO] ', '');
    }
    // Convert null to empty string
    if (description === null || description === 'null') {
      description = '';
    }

    // Map common variations of column names
    const normalized = {
      date: dateValue,
      type: row.type || row.Type || row.TYPE || row.transaction_type,
      amount: row.amount || row.Amount || row.AMOUNT,
      description: description,
      category: row.category || row.Category || row.CATEGORY || row.category_name,
      account: row.account || row.Account || row.ACCOUNT || row.account_name,
      payment_method: row.payment_method || row['payment method'] || row.PaymentMethod || row.method
    };

    // Debug log for first row
    if (index === 0) {
      console.log('First row normalized:', normalized);
      console.log('Original date value:', row.date, typeof row.date);
    }

    return normalized;
  });
}

/**
 * Validate imported data
 */
export const validateData = (data) => {
  const errors = [];
  const required = ['date', 'type', 'amount'];

  console.log(`\n=== VALIDATING ${data.length} ROWS ===`);

  data.forEach((row, index) => {
    // Check required fields (skip null/undefined/empty)
    required.forEach(field => {
      const value = row[field];
      if (!value || value === null || value === '' || value === undefined) {
        const error = `Row ${index + 1}: Missing ${field} (value: ${JSON.stringify(value)})`;
        errors.push(error);
        console.log(`❌ ${error}`);
      }
    });

    // Validate type (skip if missing)
    if (row.type) {
      const validTypes = ['income', 'expense', 'transfer'];
      if (!validTypes.includes(row.type.toLowerCase())) {
        const error = `Row ${index + 1}: Invalid type '${row.type}'. Must be: income, expense, or transfer`;
        errors.push(error);
        console.log(`❌ ${error}`);
      }
    }

    // Validate amount (skip if missing)
    if (row.amount) {
      const amountNum = parseFloat(row.amount);
      if (isNaN(amountNum)) {
        const error = `Row ${index + 1}: Invalid amount '${row.amount}'. Must be a number`;
        errors.push(error);
        console.log(`❌ ${error}`);
      } else if (amountNum <= 0) {
        const error = `Row ${index + 1}: Amount must be greater than 0`;
        errors.push(error);
        console.log(`❌ ${error}`);
      }
    }

    // Validate date format (skip if missing)
    if (row.date && !isValidDate(row.date)) {
      const error = `Row ${index + 1}: Invalid date '${row.date}'. Use format: YYYY-MM-DD`;
      errors.push(error);
      console.log(`❌ ${error}`);
    }
  });

  console.log(`=== VALIDATION RESULT: ${errors.length === 0 ? '✅ VALID' : '❌ INVALID'} ===\n`);

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

/**
 * Check if date is valid
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Import transactions into database
 */
export const importTransactions = async (userId, data) => {
  let imported = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      // Get or create account
      let accountId = await getOrCreateAccount(userId, row.account);

      // Get or create category (skip for transfers)
      let categoryId = null;
      if (row.type.toLowerCase() !== 'transfer' && row.category) {
        categoryId = await getOrCreateCategory(userId, row.category, row.type);
      }

      // Insert transaction
      const sql = `
        INSERT INTO transactions 
        (user_id, account_id, category_id, amount, type, description, payment_method, date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      await query(sql, [
        userId,
        accountId,
        categoryId,
        parseFloat(row.amount),
        row.type.toLowerCase(),
        row.description || null,
        row.payment_method || null,
        row.date
      ]);

      // Update account balance
      const balanceUpdate = row.type.toLowerCase() === 'income' 
        ? parseFloat(row.amount) 
        : -parseFloat(row.amount);

      await query(
        'UPDATE accounts SET balance = balance + ? WHERE account_id = ?',
        [balanceUpdate, accountId]
      );

      imported++;
    } catch (error) {
      failed++;
      errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  return { imported, failed, errors };
};

/**
 * Get or create account
 */
async function getOrCreateAccount(userId, accountName) {
  if (!accountName) {
    accountName = 'Imported';
  }

  // Try to find existing account
  const existingSql = 'SELECT account_id FROM accounts WHERE user_id = ? AND name = ?';
  const existing = await query(existingSql, [userId, accountName]);

  if (existing.length > 0) {
    return existing[0].account_id;
  }

  // Create new account
  const insertSql = `
    INSERT INTO accounts (user_id, name, type, balance, currency, created_at)
    VALUES (?, ?, 'checking', 0, 'PLN', NOW())
  `;
  
  const result = await query(insertSql, [userId, accountName]);
  return result.insertId;
}

/**
 * Get or create category
 */
async function getOrCreateCategory(userId, categoryName, type) {
  if (!categoryName) {
    categoryName = 'Imported';
  }

  // Try to find existing category
  const existingSql = 'SELECT category_id FROM categories WHERE user_id = ? AND name = ?';
  const existing = await query(existingSql, [userId, categoryName]);

  if (existing.length > 0) {
    return existing[0].category_id;
  }

  // Create new category
  const categoryType = type.toLowerCase() === 'income' ? 'income' : 'expense';
  const insertSql = `
    INSERT INTO categories (user_id, name, type, color, icon, created_at)
    VALUES (?, ?, ?, '#9E9E9E', 'FaFolder', NOW())
  `;
  
  const result = await query(insertSql, [userId, categoryName, categoryType]);
  return result.insertId;
}

/**
 * Generate CSV template
 */
export const generateTemplate = (format) => {
  if (format === 'csv') {
    return `date,type,amount,description,category,account,payment_method
2025-11-25,expense,100.50,Groceries,Food,Bank,card
2025-11-24,income,5000.00,Salary,Income,Bank,transfer
2025-11-23,expense,49.99,Netflix,Entertainment,Bank,card`;
  }

  if (format === 'json') {
    return JSON.stringify([
      {
        date: '2025-11-25',
        type: 'expense',
        amount: 100.50,
        description: 'Groceries',
        category: 'Food',
        account: 'Bank',
        payment_method: 'card'
      },
      {
        date: '2025-11-24',
        type: 'income',
        amount: 5000.00,
        description: 'Salary',
        category: 'Income',
        account: 'Bank',
        payment_method: 'transfer'
      }
    ], null, 2);
  }

  return '';
};

/**
 * Generate Excel template
 */
export const generateExcelTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template');

  // Define columns
  worksheet.columns = [
    { header: 'date', key: 'date', width: 12 },
    { header: 'type', key: 'type', width: 10 },
    { header: 'amount', key: 'amount', width: 12 },
    { header: 'description', key: 'description', width: 30 },
    { header: 'category', key: 'category', width: 20 },
    { header: 'account', key: 'account', width: 20 },
    { header: 'payment_method', key: 'payment_method', width: 15 }
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD500' }
  };

  // Add example rows
  worksheet.addRow({
    date: '2025-11-25',
    type: 'expense',
    amount: 100.50,
    description: 'Groceries',
    category: 'Food',
    account: 'Bank',
    payment_method: 'card'
  });

  worksheet.addRow({
    date: '2025-11-24',
    type: 'income',
    amount: 5000.00,
    description: 'Salary',
    category: 'Income',
    account: 'Bank',
    payment_method: 'transfer'
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};