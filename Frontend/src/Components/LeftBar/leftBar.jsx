import React, { useState } from 'react';
import './leftbar.css';
import logo from '../../Assets/Logo/coinly.svg';
import { Link } from 'react-router'; 
import { FaUserCircle } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";

function LeftBar() {
  const [active, setActive] = useState('/dashboard');
  
  const items = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Expenses', path: '/dashboard/expenses' },
    { name: 'Incomes', path: '/dashboard/incomes' },
  ];
  
  const handleClick = (path) => {
    setActive(path);
  }
  
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
          <h3>Username</h3>
        </div>
        <div className="logout">
          <IoIosLogOut/>
        </div>
      </div>
    </div>
  );
}

export default LeftBar;