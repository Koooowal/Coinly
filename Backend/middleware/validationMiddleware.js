import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Błąd walidacji',
      errors: errors.array()
    });
  }
  next();
};

export const validateTransaction = [
  body('account_id').isInt().withMessage('ID konta musi być liczbą'),
  body('amount').isFloat({ gt: 0 }).withMessage('Kwota musi być większa od 0'),
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Nieprawidłowy typ transakcji'),
  body('description').optional().isString().trim(),
  body('date').optional().isISO8601().withMessage('Nieprawidłowy format daty'),
  validate
];

export const validateCategory = [
  body('name').notEmpty().trim().withMessage('Nazwa kategorii jest wymagana'),
  body('type').isIn(['income', 'expense']).withMessage('Typ musi być income lub expense'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Nieprawidłowy format koloru'),
  validate
];

export const validateAccount = [
  body('name').notEmpty().trim().withMessage('Nazwa konta jest wymagana'),
  body('type').isIn(['checking', 'credit', 'cash', 'crypto', 'savings']).withMessage('Nieprawidłowy typ konta'),
  body('balance').optional().isFloat().withMessage('Saldo musi być liczbą'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Waluta musi mieć 3 znaki'),
  validate
];

export const validateBudget = [
  body('category_id').isInt().withMessage('ID kategorii musi być liczbą'),
  body('amount').isFloat({ gt: 0 }).withMessage('Kwota musi być większa od 0'),
  body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Nieprawidłowy okres'),
  body('start_date').isISO8601().withMessage('Nieprawidłowa data rozpoczęcia'),
  body('end_date').isISO8601().withMessage('Nieprawidłowa data zakończenia'),
  validate
];