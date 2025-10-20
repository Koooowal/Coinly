import * as authService from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email, username i hasło są wymagane')
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Hasło musi mieć minimum 6 znaków')
      );
    }

    const user = await authService.registerUser(email, username, password);
    const token = generateToken(user.userId, user.email, user.username);

    res.status(201).json(
      formatResponse(true, 'Rejestracja zakończona sukcesem', {
        token,
        user: {
          id: user.userId,
          email: user.email,
          username: user.username
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email i hasło są wymagane')
      );
    }

    const user = await authService.loginUser(email, password);
    const token = generateToken(user.userId, user.email, user.username);

    res.json(
      formatResponse(true, 'Logowanie zakończone sukcesem', {
        token,
        user: {
          id: user.userId,
          email: user.email,
          username: user.username
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'Użytkownik nie znaleziony')
      );
    }

    res.json(
      formatResponse(true, 'Dane użytkownika pobrane', user)
    );
  } catch (error) {
    next(error);
  }
};