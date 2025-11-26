import React, { useState, useEffect } from 'react';
import './reportPage.css';
import axios from '../../api/axios';
import { FaCalendar, FaChartPie, FaExchangeAlt, FaDownload, FaUpload, FaFileExport } from 'react-icons/fa';

function ReportPage() {
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(false);
  
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthlyDate, setMonthlyDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [yearlyReport, setYearlyReport] = useState(null);
  const [yearlyYear, setYearlyYear] = useState(new Date().getFullYear());

  const [categoryReport, setCategoryReport] = useState(null);
  const [categoryFilters, setCategoryFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  // Income vs Expenses
  const [incomeVsExpenses, setIncomeVsExpenses] = useState(null);
  const [incomeVsFilters, setIncomeVsFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Import/Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);

  useEffect(() => {
    if (activeTab === 'monthly') fetchMonthlyReport();
    if (activeTab === 'yearly') fetchYearlyReport();
    if (activeTab === 'category') fetchCategoryReport();
    if (activeTab === 'incomeVsExpenses') fetchIncomeVsExpenses();
  }, [activeTab]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports/monthly', {
        params: monthlyDate
      });
      if (response.data.success) {
        setMonthlyReport(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports/yearly', {
        params: { year: yearlyYear }
      });
      if (response.data.success) {
        setYearlyReport(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports/category', {
        params: categoryFilters
      });
      if (response.data.success) {
        setCategoryReport(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeVsExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports/income-vs-expenses', {
        params: incomeVsFilters
      });
      if (response.data.success) {
        setIncomeVsExpenses(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const handleExportMonthly = async (format) => {
    try {
      const url = `/export/monthly?year=${monthlyDate.year}&month=${monthlyDate.month}&format=${format}`;
      const response = await axios.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions_${monthlyDate.year}_${String(monthlyDate.month).padStart(2, '0')}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      alert('Export successful!');
      setShowExportModal(false);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportYearly = async (format) => {
    try {
      const url = `/export/yearly?year=${yearlyYear}&format=${format}`;
      const response = await axios.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions_${yearlyYear}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      alert('Export successful!');
      setShowExportModal(false);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportRange = async (format) => {
    try {
      const url = `/export/range?start_date=${incomeVsFilters.start_date}&end_date=${incomeVsFilters.end_date}&format=${format}`;
      const response = await axios.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `transactions_${incomeVsFilters.start_date}_to_${incomeVsFilters.end_date}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      alert('Export successful!');
      setShowExportModal(false);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Import functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setImportPreview(null);
    }
  };

  const handlePreviewImport = async () => {
    if (!importFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await axios.post('/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setImportPreview(response.data.data);
      }
    } catch (err) {
      alert('Preview failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file first');
      return;
    }

    if (!window.confirm('Are you sure you want to import these transactions? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await axios.post('/import/transactions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert(`Import successful! Imported: ${response.data.data.imported}, Failed: ${response.data.data.failed}`);
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview(null);
        
        // Refresh current report
        if (activeTab === 'monthly') fetchMonthlyReport();
        if (activeTab === 'yearly') fetchYearlyReport();
        if (activeTab === 'category') fetchCategoryReport();
        if (activeTab === 'incomeVsExpenses') fetchIncomeVsExpenses();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      const errors = err.response?.data?.data?.errors;
      if (errors && errors.length > 0) {
        alert(`Import failed: ${errorMsg}\n\nFirst 5 errors:\n${errors.slice(0, 5).join('\n')}`);
      } else {
        alert('Import failed: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (format) => {
    try {
      const url = `/import/template?format=${format}`;
      const response = await axios.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `import_template.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(val || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  return (
    <div className="page report-page">
      <div className="page-header">
        <h1>Financial Reports</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowExportModal(true)}>
            <FaDownload /> Export
          </button>
          <button className="btn-secondary" onClick={() => setShowImportModal(true)}>
            <FaUpload /> Import
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <FaCalendar /> Monthly
        </button>
        <button 
          className={`tab ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly')}
        >
          <FaCalendar /> Yearly
        </button>
        <button 
          className={`tab ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          <FaChartPie /> Category
        </button>
        <button 
          className={`tab ${activeTab === 'incomeVsExpenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('incomeVsExpenses')}
        >
          <FaExchangeAlt /> Income vs Expenses
        </button>
      </div>

      {loading && <div className="loading">Loading report...</div>}

      {activeTab === 'monthly' && !loading && (
        <div className="report-content">
          <div className="report-filters">
            <select
              value={monthlyDate.month}
              onChange={(e) => setMonthlyDate({ ...monthlyDate, month: parseInt(e.target.value) })}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
            <input
              type="number"
              value={monthlyDate.year}
              onChange={(e) => setMonthlyDate({ ...monthlyDate, year: parseInt(e.target.value) })}
              min="2000"
              max="2100"
            />
            <button className="btn-primary" onClick={fetchMonthlyReport}>
              Generate Report
            </button>
          </div>

          {monthlyReport && (
            <>
              <div className="stats-grid">
                <div className="stat-card income">
                  <h3>Total Income</h3>
                  <p className="amount">{formatCurrency(monthlyReport.summary.total_income)} PLN</p>
                </div>
                <div className="stat-card expense">
                  <h3>Total Expenses</h3>
                  <p className="amount">{formatCurrency(monthlyReport.summary.total_expenses)} PLN</p>
                </div>
                <div className="stat-card balance">
                  <h3>Net Balance</h3>
                  <p className="amount">{formatCurrency(monthlyReport.summary.net_balance)} PLN</p>
                </div>
              </div>

              {monthlyReport.categories && monthlyReport.categories.length > 0 && (
                <div className="report-section">
                  <h2>Breakdown by Category</h2>
                  <div className="category-list">
                    {monthlyReport.categories.map((cat, index) => (
                      <div key={index} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{cat.category_name}</span>
                          <span className="category-type">{cat.type}</span>
                        </div>
                        <div className="category-amount">
                          <span className={cat.type === 'income' ? 'amount-income' : 'amount-expense'}>
                            {formatCurrency(cat.total)} PLN
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'yearly' && !loading && (
        <div className="report-content">
          <div className="report-filters">
            <input
              type="number"
              value={yearlyYear}
              onChange={(e) => setYearlyYear(parseInt(e.target.value))}
              min="2000"
              max="2100"
            />
            <button className="btn-primary" onClick={fetchYearlyReport}>
              Generate Report
            </button>
          </div>

          {yearlyReport && (
            <>
              <div className="stats-grid">
                <div className="stat-card income">
                  <h3>Total Income</h3>
                  <p className="amount">{formatCurrency(yearlyReport.summary.total_income)} PLN</p>
                </div>
                <div className="stat-card expense">
                  <h3>Total Expenses</h3>
                  <p className="amount">{formatCurrency(yearlyReport.summary.total_expenses)} PLN</p>
                </div>
                <div className="stat-card balance">
                  <h3>Net Balance</h3>
                  <p className="amount">{formatCurrency(yearlyReport.summary.net_balance)} PLN</p>
                </div>
              </div>

              {yearlyReport.monthly_breakdown && yearlyReport.monthly_breakdown.length > 0 && (
                <div className="report-section">
                  <h2>Monthly Breakdown</h2>
                  <div className="monthly-list">
                    {yearlyReport.monthly_breakdown.map((month, index) => (
                      <div key={index} className="month-item">
                        <span className="month-name">{getMonthName(month.month)}</span>
                        <div className="month-stats">
                          <span className="amount-income">+{formatCurrency(month.total_income)} PLN</span>
                          <span className="amount-expense">-{formatCurrency(month.total_expenses)} PLN</span>
                          <span className={`net ${parseFloat(month.net_balance) >= 0 ? 'positive' : 'negative'}`}>
                            Net: {formatCurrency(month.net_balance)} PLN
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'category' && !loading && (
        <div className="report-content">
          <div className="report-filters">
            <input
              type="date"
              value={categoryFilters.start_date}
              onChange={(e) => setCategoryFilters({ ...categoryFilters, start_date: e.target.value })}
            />
            <input
              type="date"
              value={categoryFilters.end_date}
              onChange={(e) => setCategoryFilters({ ...categoryFilters, end_date: e.target.value })}
            />
            <select
              value={categoryFilters.type}
              onChange={(e) => setCategoryFilters({ ...categoryFilters, type: e.target.value })}
            >
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
            <button className="btn-primary" onClick={fetchCategoryReport}>
              Generate Report
            </button>
          </div>

          {categoryReport && (
            <>
              <div className="total-info">
                <strong>Total {categoryFilters.type === 'expense' ? 'Expenses' : 'Income'}:</strong>
                <span className={categoryFilters.type === 'expense' ? 'amount-expense' : 'amount-income'}>
                  {formatCurrency(categoryReport.total)} PLN
                </span>
              </div>

              {categoryReport.categories && categoryReport.categories.length > 0 && (
                <div className="category-list">
                  {categoryReport.categories.map((cat, index) => (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{cat.category_name || 'Uncategorized'}</span>
                        <div className="progress-bar-small">
                          <div 
                            className="progress-fill-small"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: categoryFilters.type === 'expense' ? '#F44336' : '#4CAF50'
                            }}
                          />
                        </div>
                      </div>
                      <div className="category-stats">
                        <span className={categoryFilters.type === 'expense' ? 'amount-expense' : 'amount-income'}>
                          {formatCurrency(cat.total)} PLN
                        </span>
                        <span className="percentage">{cat.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'incomeVsExpenses' && !loading && (
        <div className="report-content">
          <div className="report-filters">
            <input
              type="date"
              value={incomeVsFilters.start_date}
              onChange={(e) => setIncomeVsFilters({ ...incomeVsFilters, start_date: e.target.value })}
            />
            <input
              type="date"
              value={incomeVsFilters.end_date}
              onChange={(e) => setIncomeVsFilters({ ...incomeVsFilters, end_date: e.target.value })}
            />
            <button className="btn-primary" onClick={fetchIncomeVsExpenses}>
              Generate Report
            </button>
          </div>

          {incomeVsExpenses && (
            <>
              <div className="stats-grid">
                <div className="stat-card income">
                  <h3>Total Income</h3>
                  <p className="amount">{formatCurrency(incomeVsExpenses.total_income)} PLN</p>
                  <p className="count">{incomeVsExpenses.income_count} transactions</p>
                </div>
                <div className="stat-card expense">
                  <h3>Total Expenses</h3>
                  <p className="amount">{formatCurrency(incomeVsExpenses.total_expenses)} PLN</p>
                  <p className="count">{incomeVsExpenses.expense_count} transactions</p>
                </div>
                <div className="stat-card balance">
                  <h3>Net Balance</h3>
                  <p className="amount">{formatCurrency(incomeVsExpenses.net_balance)} PLN</p>
                  <p className={`trend ${parseFloat(incomeVsExpenses.net_balance) >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(incomeVsExpenses.net_balance) >= 0 ? '↑ Positive' : '↓ Negative'}
                  </p>
                </div>
              </div>

              <div className="comparison-chart">
                <h3>Income vs Expenses Comparison</h3>
                <div className="comparison-bar">
                  <div 
                    className="bar income-bar"
                    style={{
                      width: `${(parseFloat(incomeVsExpenses.total_income) / (parseFloat(incomeVsExpenses.total_income) + parseFloat(incomeVsExpenses.total_expenses))) * 100}%`
                    }}
                  >
                    Income: {formatCurrency(incomeVsExpenses.total_income)} PLN
                  </div>
                  <div 
                    className="bar expense-bar"
                    style={{
                      width: `${(parseFloat(incomeVsExpenses.total_expenses) / (parseFloat(incomeVsExpenses.total_income) + parseFloat(incomeVsExpenses.total_expenses))) * 100}%`
                    }}
                  >
                    Expenses: {formatCurrency(incomeVsExpenses.total_expenses)} PLN
                  </div>
                </div>
                <div className="comparison-legend">
                  <div className="legend-item">
                    <div className="legend-color income"></div>
                    <span className="legend-text">Income:</span>
                    <span className="legend-value">{formatCurrency(incomeVsExpenses.total_income)} PLN</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color expense"></div>
                    <span className="legend-text">Expenses:</span>
                    <span className="legend-value">{formatCurrency(incomeVsExpenses.total_expenses)} PLN</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
            <h2><FaFileExport /> Export Transactions</h2>
            
            <div className="export-options">
              <h3>Select Report Type:</h3>
              <div className="export-type-buttons">
                <button 
                  className={`export-type-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                  onClick={() => setActiveTab('monthly')}
                >
                  Monthly Report
                  <small>{getMonthName(monthlyDate.month)} {monthlyDate.year}</small>
                </button>
                <button 
                  className={`export-type-btn ${activeTab === 'yearly' ? 'active' : ''}`}
                  onClick={() => setActiveTab('yearly')}
                >
                  Yearly Report
                  <small>{yearlyYear}</small>
                </button>
                <button 
                  className={`export-type-btn ${activeTab === 'incomeVsExpenses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('incomeVsExpenses')}
                >
                  Date Range
                  <small>{incomeVsFilters.start_date} to {incomeVsFilters.end_date}</small>
                </button>
              </div>

              <h3>Select Format:</h3>
              <div className="format-buttons">
                <button 
                  className="format-btn"
                  onClick={() => {
                    if (activeTab === 'monthly') handleExportMonthly('csv');
                    else if (activeTab === 'yearly') handleExportYearly('csv');
                    else handleExportRange('csv');
                  }}
                >
                  📄 CSV
                  <small>Comma-separated values</small>
                </button>
                <button 
                  className="format-btn"
                  onClick={() => {
                    if (activeTab === 'monthly') handleExportMonthly('json');
                    else if (activeTab === 'yearly') handleExportYearly('json');
                    else handleExportRange('json');
                  }}
                >
                  📋 JSON
                  <small>JavaScript Object Notation</small>
                </button>
                <button 
                  className="format-btn"
                  onClick={() => {
                    if (activeTab === 'monthly') handleExportMonthly('excel');
                    else if (activeTab === 'yearly') handleExportYearly('excel');
                    else handleExportRange('excel');
                  }}
                >
                  📊 Excel
                  <small>Microsoft Excel (.xlsx)</small>
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
            <h2><FaUpload /> Import Transactions</h2>
            
            <div className="import-section">
              <h3>Step 1: Download Template (Optional)</h3>
              <p>Start with a template to ensure correct format</p>
              <div className="template-buttons">
                <button 
                  className="btn-secondary"
                  onClick={() => handleDownloadTemplate('csv')}
                >
                  📄 CSV Template
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => handleDownloadTemplate('json')}
                >
                  📋 JSON Template
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => handleDownloadTemplate('excel')}
                >
                  📊 Excel Template
                </button>
              </div>

              <h3>Step 2: Select File</h3>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={handleFileSelect}
                  id="import-file"
                />
                <label htmlFor="import-file" className="file-input-label">
                  {importFile ? importFile.name : 'Choose file...'}
                </label>
              </div>

              {importFile && (
                <>
                  <h3>Step 3: Preview (Optional)</h3>
                  <button 
                    className="btn-secondary full-width"
                    onClick={handlePreviewImport}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Preview Import'}
                  </button>
                </>
              )}

              {importPreview && (
                <div className="preview-box">
                  <h4>Preview:</h4>
                  <p>Total rows: {importPreview.total}</p>
                  <p className={importPreview.valid ? 'text-success' : 'text-error'}>
                    {importPreview.valid ? '✅ Valid format' : '❌ Invalid format'}
                  </p>
                  {importPreview.errors.length > 0 && (
                    <div className="errors-box">
                      <strong>Errors:</strong>
                      <ul>
                        {importPreview.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {importPreview.errors.length > 5 && (
                          <li>...and {importPreview.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {importPreview.preview && importPreview.preview.length > 0 && (
                    <div className="preview-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.preview.map((row, i) => (
                            <tr key={i}>
                              <td>{row.date}</td>
                              <td>{row.type}</td>
                              <td>{row.amount}</td>
                              <td>{row.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportPreview(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleImport}
                disabled={!importFile || loading}
              >
                {loading ? 'Importing...' : 'Import Transactions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;