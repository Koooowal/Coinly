import React, { useState, useEffect } from 'react';
import './profilePage.css';
import axios from '../../api/axios';
import { FaPlus, FaEdit, FaTrash, FaUser, FaCog, FaWallet, FaTag, FaTimes } from 'react-icons/fa';
import { showSuccess, showError } from '../../utils/toast';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const { updateTheme } = useTheme();
  const { updateUser } = useAuth();
  
  const [profile, setProfile] = useState({ email: '', username: '' });
  const [preferences, setPreferences] = useState({ currency: 'PLN', theme: 'dark', enable_alerts: true });
  
  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', type: 'checking', balance: '' });
   
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'expense', color: '#FFD500', icon: 'default' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, prefsRes, accountsRes, categoriesRes] = await Promise.all([
        axios.get('/users/profile'),
        axios.get('/users/preferences'),
        axios.get('/accounts'),
        axios.get('/categories')
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (prefsRes.data.success) setPreferences(prefsRes.data.data);
      if (accountsRes.data.success) setAccounts(accountsRes.data.data);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
    } catch (err) {
      showError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/users/profile', profile);
      updateUser({ email: profile.email, username: profile.username });
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError('Error updating profile');
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/users/preferences', preferences);
      updateTheme(preferences.theme);
      showSuccess('Preferences updated successfully!');
    } catch (err) {
      showError('Error updating preferences');
    }
  };

  const openAccountModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setAccountForm({
        name: account.name,
        type: account.type,
        balance: account.balance
      });
    } else {
      setEditingAccount(null);
      setAccountForm({ name: '', type: 'checking', balance: '' });
    }
    setShowAccountModal(true);
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await axios.put(`/accounts/${editingAccount.account_id}`, accountForm);
      } else {
        await axios.post('/accounts', accountForm);
      }
      showSuccess(editingAccount ? 'Account updated successfully!' : 'Account created successfully!');
      setShowAccountModal(false);
      fetchData();
    } catch (err) {
      showError('Error saving account');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/accounts/${deleteItem.account_id}`);
      showSuccess('Account deleted successfully!');
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      showError('Error deleting account');
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', type: 'expense', color: '#FFD500', icon: 'default' });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/categories/${editingCategory.category_id}`, categoryForm);
      } else {
        await axios.post('/categories', categoryForm);
      }
      showSuccess(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      showError('Error saving category');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(`/categories/${deleteItem.category_id}`);
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  if (loading) return <div className="page"><div className="loading">Loading...</div></div>;

  return (
    <div className="page profile-page">
      <h1>Profile Settings</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FaCog /> Preferences
        </button>
        <button 
          className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <FaWallet /> Accounts
        </button>
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FaTag /> Categories
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-card">
          <h2>Account Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="profile-card">
          <h2>User Preferences</h2>
          <form onSubmit={handlePreferencesSubmit}>
            <div className="form-group">
              <label>Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
              >
                <option value="PLN">PLN (Polish Złoty)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.enable_alerts}
                  onChange={(e) => setPreferences({ ...preferences, enable_alerts: e.target.checked })}
                />
                Enable Alerts
              </label>
            </div>
            <button type="submit" className="btn-primary">Save Preferences</button>
          </form>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="profile-content">
          <div className="content-header">
            <h2>Your Accounts</h2>
            <button className="btn-primary" onClick={() => openAccountModal()}>
              <FaPlus /> Add Account
            </button>
          </div>
          
          {accounts.length === 0 ? (
            <p className="empty">No accounts yet</p>
          ) : (
            <div className="items-list">
              {accounts.map(account => (
                <div key={account.account_id} className="item-card">
                  <div className="item-info">
                    <h3>{account.name}</h3>
                    <p className="item-detail">{account.type}</p>
                    <p className="item-balance">{formatCurrency(account.balance)} PLN</p>
                  </div>
                  <div className="item-actions">
                    <button className="btn-icon" onClick={() => openAccountModal(account)}>
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => { 
                        setDeleteItem(account); 
                        setShowDeleteModal(true); 
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="profile-content">
          <div className="content-header">
            <h2>Your Categories</h2>
            <button className="btn-primary" onClick={() => openCategoryModal()}>
              <FaPlus /> Add Category
            </button>
          </div>
          
          {categories.length === 0 ? (
            <p className="empty">No categories yet</p>
          ) : (
            <div className="items-list">
              {categories.map(category => (
                <div key={category.category_id} className="item-card">
                  <div className="item-info">
                    <div className="category-badge" style={{ backgroundColor: category.color }}>
                      {category.name}
                    </div>
                    <p className="item-detail">{category.type}</p>
                  </div>
                  <div className="item-actions">
                    <button className="btn-icon" onClick={() => openCategoryModal(category)}>
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => { 
                        setDeleteItem(category); 
                        setShowDeleteModal(true); 
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAccountModal && (
        <div className="modal" onClick={() => setShowAccountModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Account' : 'Add Account'}</h2>
              <button className="btn-close" onClick={() => setShowAccountModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAccountSubmit}>
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Type *</label>
                <select
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>
              <div className="form-group">
                <label>Balance (PLN) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.balance}
                  onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAccountModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="btn-close" onClick={() => setShowCategoryModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category Type *</label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="color-picker"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save</button>
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
            <p>Are you sure you want to delete this {deleteItem?.account_id ? 'account' : 'category'}?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={deleteItem?.account_id ? handleDeleteAccount : handleDeleteCategory}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;