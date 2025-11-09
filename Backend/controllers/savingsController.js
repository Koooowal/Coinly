import * as savingsService from '../services/savingsService.js';
import { formatResponse } from '../utils/responseFormatter.js';



export const getAllGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goals = await savingsService.getSavingsGoals(userId);

    res.json(formatResponse(true, 'Cele oszczędnościowe pobrane pomyślnie', goals));
  } catch (error) {
    next(error);
  }
};

export const getGoalById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const goal = await savingsService.getSavingsGoalById(userId, goalId);

    if (!goal) {
      return res.status(404).json(formatResponse(false, 'Cel nie znaleziony'));
    }

    res.json(formatResponse(true, 'Cel pobrany pomyślnie', goal));
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, target_amount, current_amount, target_date } = req.body;

    const result = await savingsService.createSavingsGoal(userId, {
      name,
      target_amount,
      current_amount: current_amount || 0,
      target_date
    });

    res.status(201).json(formatResponse(true, 'Cel utworzony pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { name, target_amount, current_amount, target_date, status } = req.body;

    const result = await savingsService.updateSavingsGoal(userId, goalId, {
      name,
      target_amount,
      current_amount,
      target_date,
      status
    });

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Cel nie znaleziony'));
    }

    res.json(formatResponse(true, 'Cel zaktualizowany pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const result = await savingsService.deleteSavingsGoal(userId, goalId);

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Cel nie znaleziony'));
    }

    res.json(formatResponse(true, 'Cel usunięty pomyślnie'));
  } catch (error) {
    next(error);
  }
};

export const depositToGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { savings_account_id, amount, description, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json(formatResponse(false, 'Kwota musi być większa od 0'));
    }

    const result = await savingsService.addDepositToGoal(userId, goalId, {
      savings_account_id,
      amount,
      description: description || 'Wpłata na cel oszczędnościowy',
      date: date || new Date().toISOString().split('T')[0]
    });

    res.json(formatResponse(true, 'Wpłata dodana pomyślnie', result));
  } catch (error) {
    next(error);
  }
};


export const getAllSavingsAccounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accounts = await savingsService.getSavingsAccounts(userId);

    res.json(formatResponse(true, 'Konta oszczędnościowe pobrane pomyślnie', accounts));
  } catch (error) {
    next(error);
  }
};

export const getSavingsAccountById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const account = await savingsService.getSavingsAccountById(userId, accountId);

    if (!account) {
      return res.status(404).json(formatResponse(false, 'Konto nie znalezione'));
    }

    res.json(formatResponse(true, 'Konto pobrane pomyślnie', account));
  } catch (error) {
    next(error);
  }
};

export const createSavingsAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, balance, interest_rate } = req.body;

    const result = await savingsService.createSavingsAccount(userId, {
      name,
      balance: balance || 0,
      interest_rate: interest_rate || 0
    });

    res.status(201).json(formatResponse(true, 'Konto oszczędnościowe utworzone pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const updateSavingsAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;
    const { name, balance, interest_rate } = req.body;

    const result = await savingsService.updateSavingsAccount(userId, accountId, {
      name,
      balance,
      interest_rate
    });

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Konto nie znalezione'));
    }

    res.json(formatResponse(true, 'Konto zaktualizowane pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const deleteSavingsAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const result = await savingsService.deleteSavingsAccount(userId, accountId);

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Konto nie znalezione'));
    }

    res.json(formatResponse(true, 'Konto usunięte pomyślnie'));
  } catch (error) {
    next(error);
  }
};