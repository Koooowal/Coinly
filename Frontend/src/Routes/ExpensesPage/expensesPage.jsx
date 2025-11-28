import React, { useState, useEffect } from 'react';
import './expensesPage.css';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaExchangeAlt, FaRedoAlt } from 'react-icons/fa';
import { showSuccess, showError, showWarning, showConfirm, showBudgetAlert } from '../../utils/toast';

function ExpensesPage() {
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [transferTransactions, setTransferTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRecurringId, setEditingRecurringId] = useState(null);
  const [editingTransferId, setEditingTransferId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    category_id: '',
    account_id: ''
  });

  const [form, setForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    payment_method: 'card',
    date: new Date().toISOString().split('T')[0]
  });

  const [recurringForm, setRecurringForm] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const [transferForm, setTransferForm] = useState({
    account_id: '',
    target_account_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { type: 'expense', ...filters };
      const transferParams = { type: 'transfer', ...filters };
      
      const [trans, recurring, transfers, cats, accs] = await Promise.all([
        axios.get('/transactions', { params }),
        axios.get('/recurring'),
        axios.get('/transactions', { params: transferParams }),
        axios.get('/categories', { params: { type: 'expense' } }),
        axios.get('/accounts')
      ]);

      setTransactions(trans.data.data || []);
      setRecurringTransactions(recurring.data.data || []);
      setTransferTransactions(transfers.data.data || []);
      setCategories(cats.data.data || []);
      setAccounts(accs.data.data || []);
    } catch (err) {
      showError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setEditingId(transaction.transaction_id);
      setForm({
        account_id: transaction.account_id,
        category_id: transaction.category_id,
        amount: transaction.amount,
        description: transaction.description || '',
        payment_method: transaction.payment_method || 'card',
        date: transaction.date.split('T')[0]
      });
    } else {
      setEditingId(null);
      setForm({
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        payment_method: 'card',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { ...form, type: 'expense', amount: parseFloat(form.amount) };
      
      let response;
      if (editingId) {
        response = await axios.put(`/transactions/${editingId}`, data);
      } else {
        response = await axios.post('/transactions', data);
      }
      
      showSuccess(editingId ? 'Expense updated successfully!' : 'Expense added successfully!');
      setShowModal(false);
      fetchData();

      const budgetWarnings = response.data?.data?.budgetWarnings || [];
      if (budgetWarnings.length > 0) {
        setTimeout(() => {
          budgetWarnings.forEach(warning => {
            showBudgetAlert(warning.message, warning.type);
          });
        }, 500);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving transaction');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Are you sure you want to delete this expense?', async () => {
      try {
        await axios.delete(`/transactions/${id}`);
        showSuccess('Expense deleted successfully!');
        fetchData();
      } catch (err) {
        showError('Error deleting transaction');
      }
    });
  };

  const openRecurringModal = (recurring = null) => {
    if (recurring) {
      setEditingRecurringId(recurring.recurring_id);
      setRecurringForm({
        account_id: recurring.account_id,
        category_id: recurring.category_id,
        amount: recurring.amount,
        description: recurring.description || '',
        frequency: recurring.frequency,
        start_date: recurring.start_date.split('T')[0],
        end_date: recurring.end_date ? recurring.end_date.split('T')[0] : ''
      });
    } else {
      setEditingRecurringId(null);
      setRecurringForm({
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
    }
    setShowRecurringModal(true);
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { 
        ...recurringForm, 
        type: 'expense', 
        amount: parseFloat(recurringForm.amount) 
      };
      
      if (editingRecurringId) {
        await axios.put(`/recurring/${editingRecurringId}`, data);
      } else {
        await axios.post('/recurring', data);
      }
      
      showSuccess(editingRecurringId ? 'Recurring transaction updated!' : 'Recurring transaction created!');
      setShowRecurringModal(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving recurring transaction');
    }
  };

  const handleRecurringDelete = async (id) => {
    showConfirm('Are you sure you want to delete this recurring transaction?', async () => {
      try {
        await axios.delete(`/recurring/${id}`);
        showSuccess('Recurring transaction deleted successfully!');
        fetchData();
      } catch (err) {
        showError('Error deleting recurring transaction');
      }
    });
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(`/recurring/${id}/toggle`, { is_active: !currentStatus });
      fetchData();
    } catch (err) {
      showError('Error toggling recurring transaction status');
    }
  };

  const openTransferModal = (transfer = null) => {
    if (transfer) {
      setEditingTransferId(transfer.transaction_id);
      setTransferForm({
        account_id: transfer.account_id,
        target_account_id: transfer.target_account_id,
        amount: transfer.amount,
        description: transfer.description || '',
        date: transfer.date.split('T')[0]
      });
    } else {
      setEditingTransferId(null);
      setTransferForm({
        account_id: '',
        target_account_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { 
        ...transferForm, 
        type: 'transfer', 
        amount: parseFloat(transferForm.amount) 
      };
      
      if (editingTransferId) {
        await axios.put(`/transactions/${editingTransferId}`, data);
      } else {
        await axios.post('/transactions', data);
      }
      
      showSuccess('Transfer completed successfully!');
      setShowTransferModal(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving transfer');
    }
  };

  const handleTransferDelete = async (id) => {
    showConfirm('Are you sure you want to delete this transfer?', async () => {
      try {
        await axios.delete(`/transactions/${id}`);
        showSuccess('Transfer deleted successfully!');
        fetchData();
      } catch (err) {
        showError('Error deleting transfer');
      }
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const getNextExecution = (recurring) => {
    const start = new Date(recurring.start_date);
    const today = new Date();
    
    if (recurring.end_date && new Date(recurring.end_date) < today) {
      return 'Expired';
    }

    switch (recurring.frequency) {
      case 'daily':
        return 'Today';
      case 'weekly':
        const nextWeek = new Date(start);
        while (nextWeek < today) {
          nextWeek.setDate(nextWeek.getDate() + 7);
        }
        return formatDate(nextWeek);
      case 'monthly':
        const nextMonth = new Date(today.getFullYear(), today.getMonth(), start.getDate());
        if (nextMonth < today) {
          nextMonth.setMonth(nextMonth.getMonth() + 1);
        }
        return formatDate(nextMonth);
      case 'yearly':
        const nextYear = new Date(today.getFullYear(), start.getMonth(), start.getDate());
        if (nextYear < today) {
          nextYear.setFullYear(nextYear.getFullYear() + 1);
        }
        return formatDate(nextYear);
      default:
        return 'Unknown';
    }
  };

  const totalExpense = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) return <div className="page expenses-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page expenses-page">
      <div className="page-header">
        <h1>Expenses</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filters
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters">
          <input
            type="date"
            placeholder="Start Date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
          <select
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
          <select
            value={filters.account_id}
            onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
          >
            <option value="">All Accounts</option>
            {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.name}</option>)}
          </select>
          <button className="btn-text" onClick={() => setFilters({ start_date: '', end_date: '', category_id: '', account_id: '' })}>
            Clear
          </button>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No expenses found</p>
          <button className="btn-primary" onClick={() => openModal()}>
            <FaPlus /> Add First Expense
          </button>
        </div>
      ) : (
        <div className="expenses-list">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.transaction_id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.category_name || 'Uncategorized'}</td>
                  <td>{t.description || '-'}</td>
                  <td>{t.account_name}</td>
                  <td className="amount-expense">{formatCurrency(t.amount)} PLN</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => openModal(t)}>
                        <FaEdit />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(t.transaction_id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4"><strong>Total:</strong></td>
                <td className="amount-expense"><strong>{formatCurrency(totalExpense)} PLN</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="recurring-section">
        <h2>
          <FaRedoAlt /> Recurring Expenses
          <button className="btn-primary" onClick={() => openRecurringModal()} style={{ marginLeft: 'auto' }}>
            <FaPlus /> Add Recurring
          </button>
        </h2>

        {recurringTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No recurring expenses</p>
          </div>
        ) : (
          <div className="recurring-list">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Next Execution</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringTransactions.map(r => (
                  <tr key={r.recurring_id} className={!r.is_active ? 'inactive' : ''}>
                    <td>{r.description || '-'}</td>
                    <td>{r.category_name || 'Uncategorized'}</td>
                    <td>{r.account_name}</td>
                    <td className="amount-expense">{formatCurrency(r.amount)} PLN</td>
                    <td>
                      <span className="badge-frequency">{r.frequency}</span>
                    </td>
                    <td>
                      <span className={`next-exec ${getNextExecution(r) === 'Today' ? 'today' : ''}`}>
                        {getNextExecution(r)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${r.is_active ? 'active' : 'inactive'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          onClick={() => handleToggleActive(r.recurring_id, r.is_active)}
                          title={r.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {r.is_active ? '⏸' : '▶'}
                        </button>
                        <button className="btn-icon" onClick={() => openRecurringModal(r)}>
                          <FaEdit />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleRecurringDelete(r.recurring_id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="recurring-section">
        <h2>
          <FaExchangeAlt /> Transfers Between Accounts
          <button className="btn-primary" onClick={() => openTransferModal()} style={{ marginLeft: 'auto' }}>
            <FaPlus /> Add Transfer
          </button>
        </h2>

        {transferTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transfers found</p>
          </div>
        ) : (
          <div className="expenses-list">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>From Account</th>
                  <th>To Account</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transferTransactions.map(t => (
                  <tr key={t.transaction_id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.account_name}</td>
                    <td>{t.target_account_name}</td>
                    <td>{t.description || '-'}</td>
                    <td style={{ color: '#FFD500', fontWeight: '700' }}>{formatCurrency(t.amount)} PLN</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => openTransferModal(t)}>
                          <FaEdit />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleTransferDelete(t.transaction_id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Account *</label>
                  <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} required>
                    <option value="">Select Account</option>
                    {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecurringModal && (
        <div className="modal-overlay" onClick={() => setShowRecurringModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRecurringId ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h2>
            <form onSubmit={handleRecurringSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Account *</label>
                  <select value={recurringForm.account_id} onChange={(e) => setRecurringForm({ ...recurringForm, account_id: e.target.value })} required>
                    <option value="">Select Account</option>
                    {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={recurringForm.category_id} onChange={(e) => setRecurringForm({ ...recurringForm, category_id: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={recurringForm.amount}
                    onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Frequency *</label>
                  <select value={recurringForm.frequency} onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })} required>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={recurringForm.start_date}
                    onChange={(e) => setRecurringForm({ ...recurringForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date (optional)</label>
                  <input
                    type="date"
                    value={recurringForm.end_date}
                    onChange={(e) => setRecurringForm({ ...recurringForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={recurringForm.description}
                  onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                  placeholder="e.g., Netflix subscription"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRecurringModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTransferId ? 'Edit Transfer' : 'Add Transfer'}</h2>
            <div className="info-box">
              <strong>Transfer Money Between Accounts</strong>
              Transfer funds from one account to another. The amount will be deducted from the source account and added to the target account.
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="form-group">
                <label>From Account *</label>
                <select 
                  value={transferForm.account_id} 
                  onChange={(e) => setTransferForm({ ...transferForm, account_id: e.target.value })} 
                  required
                >
                  <option value="">Select Source Account</option>
                  {accounts.map(a => <option key={a.account_id} value={a.account_id}>{a.name}</option>)}
                </select>
              </div>
              
              <div className="transfer-arrow">↓</div>
              
              <div className="form-group">
                <label>To Account *</label>
                <select 
                  value={transferForm.target_account_id} 
                  onChange={(e) => setTransferForm({ ...transferForm, target_account_id: e.target.value })} 
                  required
                >
                  <option value="">Select Target Account</option>
                  {accounts.filter(a => a.account_id !== parseInt(transferForm.account_id)).map(a => 
                    <option key={a.account_id} value={a.account_id}>{a.name}</option>
                  )}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={transferForm.date}
                    onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensesPage;