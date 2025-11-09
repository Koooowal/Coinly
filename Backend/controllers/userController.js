import * as userService from '../services/userService.js';
import { formatResponse } from '../utils/responseFormatter.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await userService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json(formatResponse(false, 'Profil nie znaleziony'));
    }

    res.json(formatResponse(true, 'Profil pobrany pomyślnie', profile));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, username } = req.body;

    const result = await userService.updateUserProfile(userId, { email, username });

    res.json(formatResponse(true, 'Profil zaktualizowany pomyślnie', result));
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = await userService.getUserPreferences(userId);

    res.json(formatResponse(true, 'Preferencje pobrane pomyślnie', preferences));
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currency, theme, enable_alerts } = req.body;

    const result = await userService.updateUserPreferences(userId, {
      currency,
      theme,
      enable_alerts
    });

    res.json(formatResponse(true, 'Preferencje zaktualizowane pomyślnie', result));
  } catch (error) {
    next(error);
  }
};