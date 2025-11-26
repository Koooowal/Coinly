import * as recurringService from '../services/recurringService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getAllRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recurring = await recurringService.getAllRecurring(userId);
    
    res.json(formatResponse(true, 'Recurring transactions retrieved successfully', recurring));
  } catch (error) {
    next(error);
  }
};

export const getRecurringById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const recurring = await recurringService.getRecurringById(id, userId);
    
    if (!recurring) {
      return res.status(404).json(formatResponse(false, 'Recurring transaction not found'));
    }
    
    res.json(formatResponse(true, 'Recurring transaction retrieved successfully', recurring));
  } catch (error) {
    next(error);
  }
};

export const createRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { account_id, category_id, amount, type, description, frequency, start_date, end_date } = req.body;
    
    if (!account_id || !amount || !type || !frequency || !start_date) {
      return res.status(400).json(formatResponse(false, 'Missing required fields'));
    }
    
    const data = {
      account_id,
      category_id,
      amount,
      type,
      description,
      frequency,
      start_date,
      end_date: end_date || null,
      is_active: true
    };
    
    const recurringId = await recurringService.createRecurring(userId, data);
    
    res.status(201).json(formatResponse(true, 'Recurring transaction created successfully', { recurring_id: recurringId }));
  } catch (error) {
    next(error);
  }
};

export const updateRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = req.body;
    
    const updated = await recurringService.updateRecurring(id, userId, data);
    
    if (!updated) {
      return res.status(404).json(formatResponse(false, 'Recurring transaction not found'));
    }
    
    res.json(formatResponse(true, 'Recurring transaction updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const deleted = await recurringService.deleteRecurring(id, userId);
    
    if (!deleted) {
      return res.status(404).json(formatResponse(false, 'Recurring transaction not found'));
    }
    
    res.json(formatResponse(true, 'Recurring transaction deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const toggleActiveStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { is_active } = req.body;
    
    const updated = await recurringService.toggleActiveStatus(id, userId, is_active);
    
    if (!updated) {
      return res.status(404).json(formatResponse(false, 'Recurring transaction not found'));
    }
    
    res.json(formatResponse(true, `Recurring transaction ${is_active ? 'activated' : 'deactivated'} successfully`));
  } catch (error) {
    next(error);
  }
};