import { db } from '../database/db.js';
import { promisify } from 'util';

const query = promisify(db.query).bind(db);


export const executeRecurringTransactions = async () => {
  try {
    console.log('[CRON] Starting recurring transactions execution...');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const sql = `
      SELECT r.*, 
             a.balance as account_balance,
             c.name as category_name
      FROM recurring_transactions r
      LEFT JOIN accounts a ON r.account_id = a.account_id
      LEFT JOIN categories c ON r.category_id = c.category_id
      WHERE r.is_active = 1
        AND r.start_date <= ?
        AND (r.end_date IS NULL OR r.end_date >= ?)
      ORDER BY r.recurring_id
    `;
    
    const recurringList = await query(sql, [todayStr, todayStr]);
    
    console.log(`[CRON] Found ${recurringList.length} active recurring transactions`);
    
    let executedCount = 0;
    let skippedCount = 0;
    
    for (const recurring of recurringList) {
      const shouldExecute = await shouldExecuteToday(recurring, today);
      
      if (shouldExecute) {
        try {
          await executeTransaction(recurring, todayStr);
          
          await updateLastExecution(recurring.recurring_id, todayStr);
          
          executedCount++;
          console.log(`[CRON] ✅ Executed recurring ${recurring.recurring_id}: ${recurring.description} (${recurring.amount} PLN)`);
        } catch (error) {
          console.error(`[CRON] ❌ Failed to execute recurring ${recurring.recurring_id}:`, error.message);
          skippedCount++;
        }
      }
    }
    
    console.log(`[CRON] Finished. Executed: ${executedCount}, Skipped: ${skippedCount}`);
    
    return { executedCount, skippedCount };
    
  } catch (error) {
    console.error('[CRON] Error in executeRecurringTransactions:', error);
    throw error;
  }
};


async function shouldExecuteToday(recurring, today) {
  const startDate = new Date(recurring.start_date);
  
  const todayStr = today.toISOString().split('T')[0];
  const checkSql = `
    SELECT COUNT(*) as count 
    FROM transactions 
    WHERE recurring_transaction_id = ? 
      AND date = ?
  `;
  const checkResult = await query(checkSql, [recurring.recurring_id, todayStr]);
  
  if (checkResult[0].count > 0) {
    console.log(`[CRON] Recurring ${recurring.recurring_id} already executed today`);
    return false;
  }
  
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  
  switch (recurring.frequency) {
    case 'daily':
      return true;
      
    case 'weekly':
      return daysSinceStart % 7 === 0;
      
    case 'monthly':
      return today.getDate() === startDate.getDate();
      
    case 'yearly':
      return today.getDate() === startDate.getDate() && 
             today.getMonth() === startDate.getMonth();
      
    default:
      return false;
  }
}


async function executeTransaction(recurring, date) {
  const callSql = 'CALL sp_add_transaction(?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  await query(callSql, [
    recurring.user_id,
    recurring.account_id,
    recurring.category_id,
    recurring.amount,
    recurring.type,
    recurring.target_account_id || null,
    `[AUTO] ${recurring.description || 'Recurring transaction'}`,
    'auto',
    date
  ]);
  
  const updateSql = `
    UPDATE transactions 
    SET recurring_transaction_id = ?
    WHERE user_id = ? 
      AND date = ? 
      AND amount = ?
      AND recurring_transaction_id IS NULL
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  
  await query(updateSql, [
    recurring.recurring_id,
    recurring.user_id,
    date,
    recurring.amount
  ]);
}


async function updateLastExecution(recurringId, date) {
  
  
  const sql = 'UPDATE recurring_transactions SET last_execution = ? WHERE recurring_id = ?';
  await query(sql, [date, recurringId]);
}

export const executeRecurringNow = async () => {
  console.log('[MANUAL] Manual execution triggered');
  return await executeRecurringTransactions();
};

export const previewTodayExecutions = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const sql = `
      SELECT r.*, 
             a.name as account_name,
             c.name as category_name
      FROM recurring_transactions r
      LEFT JOIN accounts a ON r.account_id = a.account_id
      LEFT JOIN categories c ON r.category_id = c.category_id
      WHERE r.is_active = 1
        AND r.start_date <= ?
        AND (r.end_date IS NULL OR r.end_date >= ?)
    `;
    
    const recurringList = await query(sql, [todayStr, todayStr]);
    
    const toExecute = [];
    
    for (const recurring of recurringList) {
      const shouldExecute = await shouldExecuteToday(recurring, today);
      if (shouldExecute) {
        toExecute.push({
          recurring_id: recurring.recurring_id,
          description: recurring.description,
          amount: recurring.amount,
          frequency: recurring.frequency,
          account_name: recurring.account_name,
          category_name: recurring.category_name
        });
      }
    }
    
    return toExecute;
    
  } catch (error) {
    console.error('Error in previewTodayExecutions:', error);
    throw error;
  }
};