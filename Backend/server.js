import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import cron from 'node-cron';
import * as cronService from './utils/cronService.js';
import exportRoutes from './routes/exportRoutes.js';
import importRoutes from './routes/importRoutes.js';

dotenv.config({quiet: true});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);


cron.schedule('1 0 * * *', async () => {
  console.log('\n=== CRON JOB STARTED ===');
  try {
    const result = await cronService.executeRecurringTransactions();
    console.log(`=== CRON JOB FINISHED: ${result.executedCount} executed, ${result.skippedCount} skipped ===\n`);
  } catch (error) {
    console.error('=== CRON JOB FAILED ===', error);
  }
}, {
  timezone: "Europe/Warsaw" 
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});