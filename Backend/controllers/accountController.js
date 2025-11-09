import * as accountService from '../services/accountService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getAllAccounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accounts = await accountService.getAccounts(userId);

    res.json(formatResponse(true, 'Konta pobrane pomyślnie', accounts));
  } catch (error) {
    next(error);
  }
};

export const getAccountById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const account = await accountService.getAccountById(userId, accountId);

    if (!account) {
      return res.status(404).json(formatResponse(false, 'Konto nie znalezione'));
    }

    res.json(formatResponse(true, 'Konto pobrane pomyślnie', account));
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, type, balance, currency } = req.body;

    const result = await accountService.createAccount(userId, {
      name,
      type,
      balance: balance || 0,
      currency: currency || 'PLN'
    });

    res.status(201).json(formatResponse(true, 'Konto utworzone pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;
    const { name, type, balance, currency } = req.body;

    const result = await accountService.updateAccount(userId, accountId, {
      name,
      type,
      balance,
      currency
    });

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Konto nie znalezione'));
    }

    res.json(formatResponse(true, 'Konto zaktualizowane pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const result = await accountService.deleteAccount(userId, accountId);

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Konto nie znalezione'));
    }

    res.json(formatResponse(true, 'Konto usunięte pomyślnie'));
  } catch (error) {
    next(error);
  }
};