import React, { useState } from 'react';
import './leftBar.css';
import logo from '../../Assets/Logo/coinly.svg';
import { Link, useNavigate, useLocation } from 'react-router';
import { FaUserCircle } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from '../../context/AuthContext';

function LeftBar({ onLinkClick }) {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Expenses', path: '/dashboard/expenses' },
    { name: 'Incomes', path: '/dashboard/incomes' },
    { name: 'Budgets', path: '/dashboard/budgets' },
    { name: 'Goals', path: '/dashboard/goals' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Profile', path: '/dashboard/profile' },
  ];

  const handleClick = (path) => {
    setActive(path);
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="left-bar">
      <div className="main">
        <div className="title">
          <img src={logo} alt="Coinly Logo" />
          <h2>COINLY</h2>
        </div>
        <div className="nav">
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => handleClick(item.path)}
              className={`nav-link ${active === item.path ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="user">
        <div className="user-details">
          <FaUserCircle />
          <h3>{user?.username || 'User'}</h3>
        </div>
        <div className="logout" onClick={handleLogout} title="Logout">
          <IoIosLogOut />
        </div>
      </div>
    </div>
  );
}

export default LeftBar;