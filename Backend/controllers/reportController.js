import * as reportService from '../services/reportService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json(formatResponse(false, 'Rok i miesiąc są wymagane'));
    }

    const report = await reportService.generateMonthlyReport(userId, year, month);

    res.json(formatResponse(true, 'Raport miesięczny wygenerowany pomyślnie', report));
  } catch (error) {
    next(error);
  }
};

export const getYearlyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    if (!year) {
      return res.status(400).json(formatResponse(false, 'Rok jest wymagany'));
    }

    const report = await reportService.generateYearlyReport(userId, year);

    res.json(formatResponse(true, 'Raport roczny wygenerowany pomyślnie', report));
  } catch (error) {
    next(error);
  }
};

export const getCategoryReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date, type } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json(formatResponse(false, 'Daty początkowa i końcowa są wymagane'));
    }

    const report = await reportService.generateCategoryReport(userId, start_date, end_date, type);

    res.json(formatResponse(true, 'Raport kategorii wygenerowany pomyślnie', report));
  } catch (error) {
    next(error);
  }
};

export const getExpensesByPeriod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json(formatResponse(false, 'Daty początkowa i końcowa są wymagane'));
    }

    const expenses = await reportService.getExpensesByPeriod(userId, start_date, end_date);

    res.json(formatResponse(true, 'Wydatki pobrane pomyślnie', expenses));
  } catch (error) {
    next(error);
  }
};

export const getIncomeVsExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json(formatResponse(false, 'Daty początkowa i końcowa są wymagane'));
    }

    const comparison = await reportService.getIncomeVsExpenses(userId, start_date, end_date);

    res.json(formatResponse(true, 'Porównanie pobrane pomyślnie', comparison));
  } catch (error) {
    next(error);
  }
};