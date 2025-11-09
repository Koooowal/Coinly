import * as transactionService from '../services/transactionService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getAllTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      type: req.query.type,
      category_id: req.query.category_id,
      account_id: req.query.account_id
    };

    const transactions = await transactionService.getTransactions(userId, filters);
    
    res.json(formatResponse(true, 'Transakcje pobrane pomyślnie', transactions));
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await transactionService.getTransactionById(userId, transactionId);
    
    if (!transaction) {
      return res.status(404).json(formatResponse(false, 'Transakcja nie znaleziona'));
    }

    res.json(formatResponse(true, 'Transakcja pobrana pomyślnie', transaction));
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionData = {
      account_id: req.body.account_id,
      category_id: req.body.category_id,
      amount: req.body.amount,
      type: req.body.type,
      target_account_id: req.body.target_account_id,
      description: req.body.description,
      payment_method: req.body.payment_method,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    const result = await transactionService.addTransaction(userId, transactionData);
    
    res.status(201).json(formatResponse(true, 'Transakcja dodana pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const updateData = {
      account_id: req.body.account_id,
      category_id: req.body.category_id,
      amount: req.body.amount,
      type: req.body.type,
      target_account_id: req.body.target_account_id,
      description: req.body.description,
      payment_method: req.body.payment_method,
      date: req.body.date
    };

    const result = await transactionService.updateTransaction(userId, transactionId, updateData);
    
    if (!result) {
      return res.status(404).json(formatResponse(false, 'Transakcja nie znaleziona'));
    }

    res.json(formatResponse(true, 'Transakcja zaktualizowana pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const result = await transactionService.deleteTransaction(userId, transactionId);
    
    if (!result) {
      return res.status(404).json(formatResponse(false, 'Transakcja nie znaleziona'));
    }

    res.json(formatResponse(true, 'Transakcja usunięta pomyślnie'));
  } catch (error) {
    next(error);
  }
};

export const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    const stats = await transactionService.getTransactionStats(userId, start_date, end_date);
    
    res.json(formatResponse(true, 'Statystyki pobrane pomyślnie', stats));
  } catch (error) {
    next(error);
  }
};