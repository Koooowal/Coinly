import React, { useState, useEffect } from 'react';
import './incomesPage.css';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { showSuccess, showError, showConfirm } from '../../utils/toast';

function IncomesPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    payment_method: 'transfer',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { type: 'income', ...filters };
      
      const [trans, cats, accs] = await Promise.all([
        axios.get('/transactions', { params }),
        axios.get('/categories', { params: { type: 'income' } }),
        axios.get('/accounts')
      ]);

      setTransactions(trans.data.data || []);
      setCategories(cats.data.data || []);
      setAccounts(accs.data.data || []);
    } catch (err) {
      console.error(err);
      showError('Error loading data');
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
        payment_method: transaction.payment_method || 'transfer',
        date: transaction.date.split('T')[0]
      });
    } else {
      setEditingId(null);
      setForm({
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        payment_method: 'transfer',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = { ...form, type: 'income', amount: parseFloat(form.amount) };
      
      if (editingId) {
        await axios.put(`/transactions/${editingId}`, data);
      } else {
        await axios.post('/transactions', data);
      }
      
      showSuccess(editingId ? 'Income updated successfully!' : 'Income added successfully!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Error saving transaction');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Are you sure you want to delete this income?', async () => {
      try {
        await axios.delete(`/transactions/${id}`);
        showSuccess('Income deleted successfully!');
        fetchData();
      } catch (err) {
        showError('Error deleting transaction');
      }
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) return <div className="page incomes-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page incomes-page">
      <div className="page-header">
        <h1>Incomes</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filters
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            <FaPlus /> Add Income
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
          <p>No incomes found</p>
          <button className="btn-primary" onClick={() => openModal()}>
            <FaPlus /> Add First Income
          </button>
        </div>
      ) : (
        <div className="incomes-list">
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
                  <td className="amount-income">{formatCurrency(t.amount)} PLN</td>
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
                <td className="amount-income"><strong>{formatCurrency(totalIncome)} PLN</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Income' : 'Add Income'}</h2>
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
                  <option value="transfer">Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
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
    </div>
  );
}

export default IncomesPage;