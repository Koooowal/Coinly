import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId, email, username) => {
  const payload = {
    id: userId,
    email: email,
    username: username
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token wygasł');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Nieprawidłowy token');
    }
    throw new Error('Błąd weryfikacji tokenu');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};