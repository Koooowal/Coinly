import * as categoryService from '../services/categoryService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const type = req.query.type; 

    const categories = await categoryService.getCategories(userId, type);

    res.json(formatResponse(true, 'Kategorie pobrane pomyślnie', categories));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const category = await categoryService.getCategoryById(userId, categoryId);

    if (!category) {
      return res.status(404).json(formatResponse(false, 'Kategoria nie znaleziona'));
    }

    res.json(formatResponse(true, 'Kategoria pobrana pomyślnie', category));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, type, color, icon } = req.body;

    const result = await categoryService.createCategory(userId, {
      name,
      type,
      color: color || '#808080',
      icon: icon || 'default'
    });

    res.status(201).json(formatResponse(true, 'Kategoria utworzona pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name, type, color, icon } = req.body;

    const result = await categoryService.updateCategory(userId, categoryId, {
      name,
      type,
      color,
      icon
    });

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Kategoria nie znaleziona'));
    }

    res.json(formatResponse(true, 'Kategoria zaktualizowana pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const result = await categoryService.deleteCategory(userId, categoryId);

    if (!result) {
      return res.status(404).json(formatResponse(false, 'Kategoria nie znaleziona'));
    }

    res.json(formatResponse(true, 'Kategoria usunięta pomyślnie'));
  } catch (error) {
    next(error);
  }
};