/**
 * Testy jednostkowe dla aplikacji Coinly
 * Narzędzie: Jest
 * Uruchomienie: npm test
 */

// ===== FUNKCJE DO TESTOWANIA =====

/**
 * Formatuje wartość jako walutę PLN
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pl-PL', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
}

/**
 * Oblicza status budżetu na podstawie wydatków i limitu
 */
function calculateBudgetStatus(spent, limit) {
  if (limit <= 0) return 'invalid';
  const percentage = (spent / limit) * 100;
  if (percentage > 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'ok';
}

/**
 * Oblicza procent realizacji celu oszczędnościowego
 */
function calculateGoalProgress(current, target) {
  if (target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(progress, 100); // max 100%
}

/**
 * Waliduje dane transakcji
 */
function validateTransaction(data) {
  const errors = [];
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Kwota musi być większa od 0');
  }
  if (!data.account_id) {
    errors.push('Konto jest wymagane');
  }
  if (!data.type || !['income', 'expense', 'transfer'].includes(data.type)) {
    errors.push('Nieprawidłowy typ transakcji');
  }
  if (!data.date) {
    errors.push('Data jest wymagana');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Oblicza bilans netto
 */
function calculateNetBalance(income, expenses) {
  return parseFloat(income || 0) - parseFloat(expenses || 0);
}


// ===== TESTY =====

describe('formatCurrency - formatowanie walut', () => {
  test('formatuje standardową kwotę', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1234');
    expect(result).toContain(',56');
  });

  test('formatuje kwotę bez groszy', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1000');
    expect(result).toContain(',00');
  });

  test('obsługuje wartość zero', () => {
    expect(formatCurrency(0)).toBe('0,00');
  });

  test('obsługuje null jako zero', () => {
    expect(formatCurrency(null)).toBe('0,00');
  });

  test('obsługuje undefined jako zero', () => {
    expect(formatCurrency(undefined)).toBe('0,00');
  });

  test('formatuje duże kwoty', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('000');
    expect(result).toContain(',00');
  });
});


describe('calculateBudgetStatus - status budżetu', () => {
  test('zwraca "ok" przy 50% wykorzystania', () => {
    expect(calculateBudgetStatus(500, 1000)).toBe('ok');
  });

  test('zwraca "ok" przy 79% wykorzystania', () => {
    expect(calculateBudgetStatus(790, 1000)).toBe('ok');
  });

  test('zwraca "warning" przy dokładnie 80%', () => {
    expect(calculateBudgetStatus(800, 1000)).toBe('warning');
  });

  test('zwraca "warning" przy 95% wykorzystania', () => {
    expect(calculateBudgetStatus(950, 1000)).toBe('warning');
  });

  test('zwraca "exceeded" przy 100% wykorzystania', () => {
    expect(calculateBudgetStatus(1000, 1000)).toBe('warning');
  });

  test('zwraca "exceeded" przy przekroczeniu limitu', () => {
    expect(calculateBudgetStatus(1500, 1000)).toBe('exceeded');
  });

  test('zwraca "invalid" dla zerowego limitu', () => {
    expect(calculateBudgetStatus(100, 0)).toBe('invalid');
  });
});


describe('calculateGoalProgress - postęp celu', () => {
  test('oblicza 50% postępu', () => {
    expect(calculateGoalProgress(500, 1000)).toBe(50);
  });

  test('oblicza 0% dla pustego celu', () => {
    expect(calculateGoalProgress(0, 1000)).toBe(0);
  });

  test('nie przekracza 100%', () => {
    expect(calculateGoalProgress(1500, 1000)).toBe(100);
  });

  test('zwraca 0 dla zerowego celu', () => {
    expect(calculateGoalProgress(500, 0)).toBe(0);
  });

  test('oblicza dokładnie 100%', () => {
    expect(calculateGoalProgress(1000, 1000)).toBe(100);
  });
});


describe('validateTransaction - walidacja transakcji', () => {
  test('akceptuje poprawną transakcję', () => {
    const data = {
      amount: 100,
      account_id: 1,
      type: 'expense',
      date: '2024-01-15'
    };
    const result = validateTransaction(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('odrzuca transakcję bez kwoty', () => {
    const data = {
      account_id: 1,
      type: 'expense',
      date: '2024-01-15'
    };
    const result = validateTransaction(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Kwota musi być większa od 0');
  });

  test('odrzuca transakcję z ujemną kwotą', () => {
    const data = {
      amount: -50,
      account_id: 1,
      type: 'expense',
      date: '2024-01-15'
    };
    const result = validateTransaction(data);
    expect(result.valid).toBe(false);
  });

  test('odrzuca transakcję bez konta', () => {
    const data = {
      amount: 100,
      type: 'expense',
      date: '2024-01-15'
    };
    const result = validateTransaction(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Konto jest wymagane');
  });

  test('odrzuca nieprawidłowy typ transakcji', () => {
    const data = {
      amount: 100,
      account_id: 1,
      type: 'invalid_type',
      date: '2024-01-15'
    };
    const result = validateTransaction(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Nieprawidłowy typ transakcji');
  });

  test('akceptuje typ income', () => {
    const data = {
      amount: 100,
      account_id: 1,
      type: 'income',
      date: '2024-01-15'
    };
    expect(validateTransaction(data).valid).toBe(true);
  });

  test('akceptuje typ transfer', () => {
    const data = {
      amount: 100,
      account_id: 1,
      type: 'transfer',
      date: '2024-01-15'
    };
    expect(validateTransaction(data).valid).toBe(true);
  });
});


describe('calculateNetBalance - bilans netto', () => {
  test('oblicza dodatni bilans', () => {
    expect(calculateNetBalance(1000, 600)).toBe(400);
  });

  test('oblicza ujemny bilans', () => {
    expect(calculateNetBalance(500, 800)).toBe(-300);
  });

  test('oblicza zerowy bilans', () => {
    expect(calculateNetBalance(1000, 1000)).toBe(0);
  });

  test('obsługuje null jako zero', () => {
    expect(calculateNetBalance(null, 100)).toBe(-100);
  });

  test('obsługuje oba null jako zero', () => {
    expect(calculateNetBalance(null, null)).toBe(0);
  });
});

