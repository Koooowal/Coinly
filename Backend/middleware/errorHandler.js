export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          success: false,
          message: 'Rekord już istnieje w bazie danych'
        });
      
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          success: false,
          message: 'Nieprawidłowe powiązanie z innym rekordem'
        });
      
      case 'ECONNREFUSED':
        return res.status(503).json({
          success: false,
          message: 'Brak połączenia z bazą danych'
        });
    }
  }

  if (err.message) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Wystąpił nieoczekiwany błąd serwera',
    ...(process.env.NODE_ENV === 'development' && { error: err.toString() })
  });
};