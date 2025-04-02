import React, { useState } from 'react';
import styled from 'styled-components';
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
  <BarContainer>
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
  </BarContainer>
  );  
}

export default LeftBar;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 20%;
  height: 100vh;
  position: sticky;
  background-color: #fff0cf;
  top: 0;
  padding: 16px 0px;
  min-width: 200px;

  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "Winky Sans", sans-serif;
    font-size: 32px;
    font-weight: 700;
  }

  .title img {
    width: 50px;
    height: 50px;
  }

  .title h2 {
    color: white;
    text-shadow: 
      -2px -2px 0 black, 
       2px -2px 0 black, 
      -2px  2px 0 black, 
       2px  2px 0 black,
      -3px  0px 0 black, 
       3px  0px 0 black, 
       0px -3px 0 black, 
       0px  3px 0 black;
  }

  .nav {
    display: flex;
    padding: 0;
    flex-direction: column;
  }

  .nav-link {
    width: 180px;
    list-style: none;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 16px;
    border-radius: 16px;
    padding: 8px;
    transition: background 0.3s ease;
  }

  .nav-link:hover {
    background-color: #ffcc5c;
  }

  .nav-link.active {
    background-color: #ffcc5c;
  }

  .user{
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }

  .user svg,.logout svg{
    width: 32px;
    height: 32px;
  }

  .logout{
    margin-left: 40px;
  }

  .logout:hover, .user:hover{
    cursor: pointer;
  }
`;
