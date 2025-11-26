import axios from './axios';

export const getTransactionStats = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get('/transactions/stats', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRecentTransactions = async (limit = 10) => {
  try {
    const response = await axios.get('/transactions', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAccounts = async () => {
  try {
    const response = await axios.get('/accounts');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSavingsGoals = async () => {
  try {
    const response = await axios.get('/savings/goals');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get('/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExpensesByCategory = async (startDate, endDate) => {
  try {
    const response = await axios.get('/reports/expenses-by-period', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};