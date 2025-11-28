import { db } from '../database/db.js';
import { promisify } from 'util';
import ExcelJS from 'exceljs';

const query = promisify(db.query).bind(db);


export const getMonthlyData = async (userId, year, month) => {
  const sql = `
    SELECT 
      t.date,
      t.type,
      t.amount,
      t.description,
      t.payment_method,
      a.name as account_name,
      c.name as category_name
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.account_id
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ?
      AND YEAR(t.date) = ?
      AND MONTH(t.date) = ?
    ORDER BY t.date DESC, t.created_at DESC
  `;

  return await query(sql, [userId, year, month]);
};


export const getYearlyData = async (userId, year) => {
  const sql = `
    SELECT 
      t.date,
      t.type,
      t.amount,
      t.description,
      t.payment_method,
      a.name as account_name,
      c.name as category_name
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.account_id
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ?
      AND YEAR(t.date) = ?
    ORDER BY t.date DESC, t.created_at DESC
  `;

  return await query(sql, [userId, year]);
};


export const getRangeData = async (userId, startDate, endDate) => {
  const sql = `
    SELECT 
      t.date,
      t.type,
      t.amount,
      t.description,
      t.payment_method,
      a.name as account_name,
      c.name as category_name
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.account_id
    LEFT JOIN categories c ON t.category_id = c.category_id
    WHERE t.user_id = ?
      AND t.date BETWEEN ? AND ?
    ORDER BY t.date DESC, t.created_at DESC
  `;

  return await query(sql, [userId, startDate, endDate]);
};


export const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return 'No data available';
  }

  const headers = [
    'date',
    'type',
    'amount',
    'description',
    'payment_method',
    'account',
    'category'
  ];

  const rows = data.map(row => {
    let dateStr = row.date;
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    } else if (dateStr && typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    } else if (dateStr) {
      dateStr = String(dateStr);
    } else {
      dateStr = '';
    }

    let desc = row.description || '';
    if (desc.startsWith('[AUTO]')) {
      desc = desc.replace('[AUTO] ', '');
    }

    return [
      dateStr,
      row.type,
      row.amount,
      desc,
      row.payment_method || '',
      row.account_name || '',
      row.category_name || ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  return csvContent;
};


export const convertToExcel = async (data, sheetName = 'Transactions') => {
  const workbook = new ExcelJS.Workbook();
  
  const cleanSheetName = sheetName.replace(/[\*\?\:\/\\\[\]]/g, '_');
  const worksheet = workbook.addWorksheet(cleanSheetName);

  worksheet.columns = [
    { header: 'date', key: 'date', width: 12 },
    { header: 'type', key: 'type', width: 10 },
    { header: 'amount', key: 'amount', width: 12 },
    { header: 'description', key: 'description', width: 30 },
    { header: 'payment_method', key: 'payment_method', width: 15 },
    { header: 'account', key: 'account', width: 20 },
    { header: 'category', key: 'category', width: 20 }
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD500' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  data.forEach(row => {
    let dateStr = row.date;
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split('T')[0];
    } else if (dateStr && typeof dateStr === 'string' && dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    } else if (dateStr) {
      dateStr = String(dateStr);
    }

    let desc = row.description || '';
    if (desc.startsWith('[AUTO]')) {
      desc = desc.replace('[AUTO] ', '');
    }

    const addedRow = worksheet.addRow({
      date: dateStr,
      type: row.type,
      amount: parseFloat(row.amount),
      description: desc,
      payment_method: row.payment_method || '',
      account: row.account_name || '',
      category: row.category_name || ''
    });

    if (row.type === 'income') {
      addedRow.getCell('type').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C8E6C9' } 
      };
      addedRow.getCell('amount').font = { color: { argb: '4CAF50' } };
    } else if (row.type === 'expense') {
      addedRow.getCell('type').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCDD2' } 
      };
      addedRow.getCell('amount').font = { color: { argb: 'F44336' } };
    } else if (row.type === 'transfer') {
      addedRow.getCell('type').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9C4' } 
      };
      addedRow.getCell('amount').font = { color: { argb: 'FFD500' } };
    }
  });

  const totalIncome = data.filter(r => r.type === 'income').reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalExpense = data.filter(r => r.type === 'expense').reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const lastRow = worksheet.addRow({
    date: '',
    type: 'TOTAL',
    amount: netBalance,
    description: `Income: ${totalIncome.toFixed(2)} | Expense: ${totalExpense.toFixed(2)}`,
    payment_method: '',
    account: '',
    category: ''
  });

  lastRow.font = { bold: true };
  lastRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'E0E0E0' }
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};