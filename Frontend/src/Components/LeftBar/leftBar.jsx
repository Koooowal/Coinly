import React, { useState } from 'react';
import './leftBar.css';
import logo from '../../Assets/Logo/coinly.svg';
import { Link } from 'react-router';
import { FaUserCircle } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";

function LeftBar() {
  const [active, setActive] = useState('Home');
  const items = [
    { name: 'Home', path: '/' },
    { name: 'Expenses', path: '/expenses' },
    { name: 'Incomes', path: '/incomes' },
  ];
  return (
  <div className="left-bar">
    <div className="main">
      <div className="title">
        <img src={logo} alt="Coinly Logo" />
        <h2>Coinly</h2>
      </div>
      <div className="nav">
      {items.map(item => (
        <Link 
          key={item.path}
          to={item.path} 
          className={`nav-link ${active === item.path ? 'active' : ''}`}
        >
          {item.name}
        </Link>
      ))}
      </div>
    </div>
    <div className="user">
      <FaUserCircle />
      <h3>Username</h3>
      <div className="logout">
        <IoIosLogOut/>
      </div>
    </div>
  </div>
  );  
}

export default LeftBar;

