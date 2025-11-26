import React, { useState, useEffect } from 'react';
import './budgetPage.css';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);

  const [form, setForm] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (form.start_date && form.period) {
      const calculatedEndDate = calculateEndDate(form.start_date, form.period);
      setForm(prev => ({ ...prev, end_date: calculatedEndDate }));
    }
  }, [form.period, form.start_date]);

  const calculateEndDate = (startDate, period) => {
    const start = new Date(startDate);
    let end = new Date(startDate);

    switch (period) {
    case 'daily':
      end = new Date(start);
      break;
    case 'weekly':
      end.setDate(start.getDate() + 6); 
      break;
    case 'monthly':
      end.setDate(start.getDate() + 29); 
      break;
    case 'yearly':
      end.setDate(start.getDate() + 364); 
      break;
    default:
      end = new Date(start);
  }

    return end.toISOString().split('T')[0];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [budgetsRes, categoriesRes] = await Promise.all([
        axios.get('/budgets'),
        axios.get('/categories', { params: { type: 'expense' } })
      ]);

      if (budgetsRes.data.success) {
        const budgetsWithStatus = await Promise.all(
          budgetsRes.data.data.map(async (budget) => {
            try {
              const statusRes = await axios.get(`/budgets/${budget.budget_id}/status`);
              return {
                ...budget,
                status: statusRes.data.data
              };
            } catch (err) {
              return budget;
            }
          })
        );
        setBudgets(budgetsWithStatus);
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setForm({
        category_id: budget.category_id,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.start_date.split('T')[0],
        end_date: budget.end_date.split('T')[0]
      });
    } else {
      setEditingBudget(null);
      const today = new Date().toISOString().split('T')[0];
      const endDate = calculateEndDate(today, 'monthly');
      setForm({
        category_id: '',
        amount: '',
        period: 'monthly',
        start_date: today,
        end_date: endDate
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount)
      };
      
      if (editingBudget) {
        await axios.put(`/budgets/${editingBudget.budget_id}`, data);
      } else {
        await axios.post('/budgets', data);
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving budget');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/budgets/${deletingBudget.budget_id}`);
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      alert('Error deleting budget');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const getStatusColor = (status) => {
    if (!status) return '#888';
    if (status === 'OK') return '#4CAF50';
    if (status === 'WARNING' || status === 'OSTRZEŻENIE') return '#FF9800';
    if (status === 'EXCEEDED' || status === 'PRZEKROCZONY') return '#F44336';
    return '#888';
  };

  const getProgressPercentage = (budget) => {
    if (!budget.status) return 0;
    const spent = parseFloat(budget.status.spent || 0);
    const limit = parseFloat(budget.amount);
    return Math.min((spent / limit) * 100, 100);
  };

  const getPeriodLabel = (period) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[period] || period;
  };

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page budget-page">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p>Manage your spending limits</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <FaPlus /> Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="empty">
          <p>No budgets yet</p>
          <button className="btn-primary" onClick={() => openModal()}>
            <FaPlus /> Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map(budget => {
            const progress = getProgressPercentage(budget);
            const statusColor = getStatusColor(budget.status?.status);
            const spent = parseFloat(budget.status?.spent || 0);
            const remaining = parseFloat(budget.status?.remaining || 0);

            return (
              <div key={budget.budget_id} className="budget-card">
                <div className="budget-header">
                  <div>
                    <h3>{budget.category_name || 'Unknown Category'}</h3>
                    <span 
                      className="budget-status" 
                      style={{ color: statusColor }}
                    >
                      {budget.status?.status || 'N/A'}
                    </span>
                  </div>
                  <div className="budget-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => openModal(budget)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => {
                        setDeletingBudget(budget);
                        setShowDeleteModal(true);
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="budget-amount">
                  <div className="amount-spent">
                    <span className="label">Spent:</span>
                    <span className="value" style={{ color: statusColor }}>
                      {formatCurrency(spent)} PLN
                    </span>
                  </div>
                  <div className="amount-limit">
                    <span className="label">Limit:</span>
                    <span className="value">{formatCurrency(budget.amount)} PLN</span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: statusColor
                      }}
                    />
                  </div>
                  <span className="progress-text">{progress.toFixed(1)}%</span>
                </div>

                <div className="budget-footer">
                  <div className="budget-remaining">
                    <span className="label">Remaining:</span>
                    <span className="value" style={{ color: remaining >= 0 ? '#4CAF50' : '#F44336' }}>
                      {formatCurrency(remaining)} PLN
                    </span>
                  </div>
                  <div className="budget-period">
                    <span className="period-badge">{getPeriodLabel(budget.period)}</span>
                    <span className="dates">
                      {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBudget ? 'Edit Budget' : 'Add Budget'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Budget Amount (PLN) *</label>
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
                <label>Period *</label>
                <select
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (7 days)</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <small className="period-hint">
                  End date will be automatically set based on the period
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date (auto-calculated)</label>
                  <input
                    type="date"
                    value={form.end_date}
                    readOnly
                    className="readonly-input"
                    title="End date is automatically calculated based on period"
                  />
                </div>
              </div>

              <div className="date-info">
                <small>
                  📅 <strong>Period:</strong> {getPeriodLabel(form.period)} 
                  ({formatDate(form.start_date)} - {formatDate(form.end_date)})
                </small>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <p>Are you sure you want to delete this budget?</p>
            <div className="delete-info">
              <p><strong>Category:</strong> {deletingBudget?.category_name}</p>
              <p><strong>Amount:</strong> {formatCurrency(deletingBudget?.amount)} PLN</p>
            </div>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;