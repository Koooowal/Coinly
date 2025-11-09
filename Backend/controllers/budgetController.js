import * as budgetService from '../services/budgetService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getAllBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgets = await budgetService.getBudgets(userId);

    res.json(formatResponse(true, 'Budżety pobrane pomyślnie', budgets));
  } catch (error) {
    next(error);
  }
};

export const getBudgetById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await budgetService.getBudgetById(userId, budgetId);

    if (!budget) {
      return res.status(404).json(formatResponse(false, 'Budżet nie znaleziony'));
    }

    res.json(formatResponse(true, 'Budżet pobrany pomyślnie', budget));
  } catch (error) {
    next(error);
  }
};

export const getBudgetStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const status = await budgetService.checkBudgetStatus(userId, budgetId);

    res.json(formatResponse(true, 'Status budżetu pobrany pomyślnie', status));
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category_id, amount, period, start_date, end_date } = req.body;

    const result = await budgetService.createBudget(userId, {
      category_id,
      amount,
      period,
      start_date,
      end_date
    });

    res.status(201).json(formatResponse(true, 'Budżet utworzony pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { category_id, amount, period, start_date, end_date } = req.body;

    const result = await budgetService.updateBudget(userId, budgetId, {
      category_id,
      amount,
      period,
      start_date,
      end_date
    });

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Budżet nie znaleziony'));
    }

    res.json(formatResponse(true, 'Budżet zaktualizowany pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const result = await budgetService.deleteBudget(userId, budgetId);

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Budżet nie znaleziony'));
    }

    res.json(formatResponse(true, 'Budżet usunięty pomyślnie'));
  } catch (error) {
    next(error);
  }
};