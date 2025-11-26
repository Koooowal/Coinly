import React from 'react';
import './StatCard.css';

function StatCard({ title, value, currency = 'PLN', trend, icon, color = 'yellow' }) {
  const formatValue = (val) => {
    return new Intl.NumberFormat('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
        <h3 className="stat-card-title">{title}</h3>
      </div>
      <div className="stat-card-value">
        {formatValue(value)} <span className="stat-card-currency">{currency}</span>
      </div>
      {trend && (
        <div className={`stat-card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export default StatCard;