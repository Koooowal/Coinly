import React, { useState, useEffect } from 'react';
import './goalPage.css';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCoins } from 'react-icons/fa';

function GoalPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [depositGoal, setDepositGoal] = useState(null);

  const [form, setForm] = useState({
  name: '',
  target_amount: '',
  current_amount: '0',
  target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
  description: ''
});

  const [depositForm, setDepositForm] = useState({
    amount: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/savings/goals');
      if (response.data.success) {
        setGoals(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (goal = null) => {
  if (goal) {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.deadline ? goal.deadline.split('T')[0] : '', 
      description: goal.description || ''
    });
  } else {
    setEditingGoal(null);
      const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    setForm({
      name: '',
      target_amount: '',
      current_amount: '0',
      target_date: futureDate.toISOString().split('T')[0], 
      description: ''
    });
  }
  setShowModal(true);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...form,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount || 0)
      };
      
      if (editingGoal) {
        await axios.put(`/savings/goals/${editingGoal.goal_id}`, data);
      } else {
        await axios.post('/savings/goals', data);
      }
      
      setShowModal(false);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving goal');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/savings/goals/${deletingGoal.goal_id}`);
      setShowDeleteModal(false);
      fetchGoals();
    } catch (err) {
      alert('Error deleting goal');
    }
  };

  const openDepositModal = (goal) => {
    setDepositGoal(goal);
    setDepositForm({ amount: '' });
    setShowDepositModal(true);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/savings/goals/${depositGoal.goal_id}/deposit`, {
        amount: parseFloat(depositForm.amount)
      });
      
      setShowDepositModal(false);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Error making deposit');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const dateOnly = date.split('T')[0];
    const d = new Date(dateOnly + 'T00:00:00');
    
    if (isNaN(d.getTime())) return 'N/A';
    
    return d.toLocaleDateString('pl-PL');
  } catch (err) {
    console.error('Date format error:', err);
    return 'N/A';
  }
};


  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (target_date) => {
  if (!target_date) return 0;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(target_date.split('T')[0] + 'T00:00:00');
    
    if (isNaN(deadlineDate.getTime())) return 0;
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (err) {
    console.error('Days calculation error:', err);
    return 0;
  }
};

  const getStatusColor = (status) => {
    if (status === 'completed') return '#4CAF50';
    if (status === 'active') return '#FFD500';
    if (status === 'cancelled') return '#888';
    return '#FFD500';
  };

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page goal-page">
      <div className="page-header">
        <div>
          <h1>Savings Goals</h1>
          <p>Track your financial goals</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <FaPlus /> Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty">
          <p>No savings goals yet</p>
          <button className="btn-primary" onClick={() => openModal()}>
            <FaPlus /> Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const statusColor = getStatusColor(goal.status);
            const remaining = goal.target_amount - goal.current_amount;

            return (
              <div key={goal.goal_id} className="goal-card">
                <div className="goal-header">
                  <div>
                    <h3>{goal.name}</h3>
                    <span 
                      className="goal-status" 
                      style={{ color: statusColor }}
                    >
                      {goal.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="goal-actions">
                    {goal.status === 'active' && (
                      <button 
                        className="btn-deposit" 
                        onClick={() => openDepositModal(goal)}
                        title="Add Deposit"
                      >
                        <FaCoins />
                      </button>
                    )}
                    <button 
                      className="btn-icon" 
                      onClick={() => openModal(goal)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => {
                        setDeletingGoal(goal);
                        setShowDeleteModal(true);
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}

                <div className="goal-amounts">
                  <div className="amount-current">
                    <span className="label">Current:</span>
                    <span className="value">{formatCurrency(goal.current_amount)} PLN</span>
                  </div>
                  <div className="amount-target">
                    <span className="label">Target:</span>
                    <span className="value">{formatCurrency(goal.target_amount)} PLN</span>
                  </div>
                </div>

                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: progress >= 100 ? '#4CAF50' : '#FFD500'
                      }}
                    />
                  </div>
                  <span className="progress-text">{progress.toFixed(1)}%</span>
                </div>

                <div className="goal-footer">
                  <div className="goal-remaining">
                    <span className="label">Remaining:</span>
                    <span className="value" style={{ color: remaining <= 0 ? '#4CAF50' : '#888' }}>
                      {formatCurrency(Math.max(remaining, 0))} PLN
                    </span>
                  </div>
                  <div className="goal-deadline">
                    <span className="deadline-badge" style={{ 
                      backgroundColor: daysRemaining < 0 ? '#F44336' : daysRemaining < 30 ? '#FF9800' : '#333'
                    }}>
                      {daysRemaining < 0 ? 'OVERDUE' : `${daysRemaining} days left`}
                    </span>
                    <span className="dates">Due: {formatDate(goal.target_date)}</span>
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
              <h2>{editingGoal ? 'Edit Goal' : 'Add Goal'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., New Car, Vacation, Emergency Fund"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount (PLN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Current Amount (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.current_amount}
                    onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description for this goal"
                  rows="3"
                />
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

      {showDepositModal && (
        <div className="modal" onClick={() => setShowDepositModal(false)}>
          <div className="modal-box small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Deposit</h2>
              <button className="btn-close" onClick={() => setShowDepositModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="deposit-info">
              <p><strong>Goal:</strong> {depositGoal?.name}</p>
              <p><strong>Current:</strong> {formatCurrency(depositGoal?.current_amount)} PLN</p>
              <p><strong>Target:</strong> {formatCurrency(depositGoal?.target_amount)} PLN</p>
              <p><strong>Remaining:</strong> {formatCurrency(depositGoal?.target_amount - depositGoal?.current_amount)} PLN</p>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label>Deposit Amount (PLN) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowDepositModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Deposit
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
            <p>Are you sure you want to delete this goal?</p>
            <div className="delete-info">
              <p><strong>Goal:</strong> {deletingGoal?.name}</p>
              <p><strong>Current:</strong> {formatCurrency(deletingGoal?.current_amount)} PLN</p>
              <p><strong>Target:</strong> {formatCurrency(deletingGoal?.target_amount)} PLN</p>
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

export default GoalPage;