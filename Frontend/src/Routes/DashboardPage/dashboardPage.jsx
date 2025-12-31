import React, { useState, useEffect } from 'react';
import './dashboardPage.css';
import axios from '../../api/axios';
import { 
  FaWallet, 
  FaArrowUp, 
  FaArrowDown, 
  FaChartPie,
  FaBullseye,
  FaExchangeAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router';

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [accountsRes, transactionsRes, goalsRes, statsRes, categoryRes] = await Promise.all([
        axios.get('/accounts'),
        axios.get('/transactions'),
        axios.get('/savings/goals'),
        axios.get('/reports/monthly', {
          params: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          }
        }),
        axios.get('/reports/category', {
          params: {
            start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            type: 'expense'
          }
        })
      ]);

      if (accountsRes.data.success) {
        const accountsData = accountsRes.data.data || [];
        setAccounts(accountsData);
        const totalBalance = accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
        setStats(prev => ({ ...prev, totalBalance }));
      }

      if (transactionsRes.data.success) {
        setRecentTransactions(transactionsRes.data.data || []);
      }

      if (goalsRes.data.success) {
        setGoals(goalsRes.data.data || []);
      }

      if (statsRes.data.success) {
        const monthlyData = statsRes.data.data;
        setStats(prev => ({
          ...prev,
          monthlyIncome: parseFloat(monthlyData.summary?.total_income || 0),
          monthlyExpenses: parseFloat(monthlyData.summary?.total_expenses || 0)
        }));
      }

      if (categoryRes.data.success) {
        const catData = categoryRes.data.data;
        setCategoryExpenses(Array.isArray(catData) ? catData : (catData?.categories || []));
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const pieColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

  if (loading) {
    return <div className="page dashboard-page"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-stats">
        <div className="stat-box balance">
          <div className="stat-label">Balance</div>
          <div className="stat-value">{formatCurrency(stats.totalBalance)} zł</div>
        </div>
        <div className="stat-box income">
          <div className="stat-label">Income</div>
          <div className="stat-value green">{formatCurrency(stats.monthlyIncome)} zł</div>
          <div className="stat-subtitle">This month income</div>
        </div>
        <div className="stat-box expenses">
          <div className="stat-label">Expenses</div>
          <div className="stat-value red">{formatCurrency(stats.monthlyExpenses)} zł</div>
          <div className="stat-subtitle">This month expenses</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section transactions-section">
          <h2>Last transactions</h2>
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.slice(0, 10).map((trans) => (
                  <tr key={trans.transaction_id}>
                    <td>
                      <div className="transaction-category">
                        <div className={`transaction-icon ${trans.type}`}>
                          {trans.type === 'income' ? <FaArrowUp /> : trans.type === 'transfer' ? <FaExchangeAlt /> : <FaArrowDown />}
                        </div>
                        {trans.type === 'transfer' ? 'Transfer' : (trans.category_name || 'Uncategorized')}
                      </div>
                    </td>
                    <td className="date-cell">{formatDate(trans.date)}</td>
                    <td className={`amount-cell ${trans.type}`}>
                      {trans.type === 'income' ? '+' : '-'}{formatCurrency(trans.amount)} zł
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="dashboard-section chart-section">
            <h2>Expenses by category</h2>
            <div className="pie-chart-container">
              <svg viewBox="0 0 200 200" className="pie-chart">
                {categoryExpenses.length === 0 ? (
                  <text x="100" y="100" textAnchor="middle" fill="#666" fontSize="14">
                    No data
                  </text>
                ) : categoryExpenses.length === 1 ? (
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill={pieColors[0]} 
                    stroke="#1b1b1b" 
                    strokeWidth="2"
                  />
                ) : (
                  (() => {
                    let currentAngle = 0;
                    return categoryExpenses.slice(0, 6).map((cat, index) => {
                      const percentage = parseFloat(cat.percentage || 0);
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      
                      const x1 = 100 + 90 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const y1 = 100 + 90 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const x2 = 100 + 90 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const y2 = 100 + 90 * Math.sin((endAngle - 90) * Math.PI / 180);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      const path = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`;
                      
                      currentAngle += angle;
                      
                      return (
                        <path
                          key={index}
                          d={path}
                          fill={pieColors[index % pieColors.length]}
                          stroke="#1b1b1b"
                          strokeWidth="2"
                        />
                      );
                    });
                  })()
                )}
                <circle cx="100" cy="100" r="50" fill="#1b1b1b" />
              </svg>
            </div>
            <div className="chart-legend">
              {categoryExpenses.slice(0, 6).map((cat, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="legend-label">{cat.category_name}</span>
                  <span className="legend-value">{parseFloat(cat.percentage || 0).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section goals-section">
            <h2>Goals</h2>
            <div className="goals-list">
              {goals.slice(0, 3).map((goal) => {
                const percentage = Math.min(((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100), 100);
                return (
                  <div key={goal.goal_id} className="goal-item">
                    <div className="goal-info">
                      <div className="goal-icon">
                        <FaBullseye />
                      </div>
                      <div className="goal-details">
                        <div className="goal-name">{goal.name}</div>
                        <div className="goal-amount">
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)} zł
                        </div>
                      </div>
                    </div>
                    <div className="goal-percentage">{percentage.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-section accounts-section">
            <h2>Accounts</h2>
            <div className="accounts-list">
              {accounts.map((account) => (
                <div key={account.account_id} className="account-item">
                  <div className="account-info">
                    <div className="account-icon">
                      <FaWallet />
                    </div>
                    <div className="account-details">
                      <div className="account-name">{account.name}</div>
                      <div className="account-type">{account.type}</div>
                    </div>
                  </div>
                  <div className={`account-balance ${parseFloat(account.balance) < 0 ? 'negative' : ''}`}>
                    {formatCurrency(account.balance)} zł
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;