import React from 'react';
import { Link } from 'react-router';
import './welcomePage.css';

function WelcomePage() {
  return (
    <div className='welcome-page'>
      <img src="/coins.png" alt="Decorative coins" className='coins'/>
      <div className="title-wp">
          <img src="/coinly.png" alt="Coinly Logo" className='logo'/>
          <h1>COINLY</h1>
        </div>
      <div className="left-container">
        <h1>Coinly</h1>
        <h2>Supercharge your finance</h2>
        <h3>
        Take control of your money with smart tracking, insightful analytics, and personalized recommendations. Coinly helps you build wealth, reduce debt, and achieve financial freedom—all in one intuitive platform.
        </h3>
        <Link to="/dashboard">Get started</Link>
      </div>
      <img src="/coins.png" alt="Decorative coins" className='coins2'/>
      <div className="right-container">
        <div className="box">
          <div className="img-container">
            <img src="/man.png" alt="Man" className='man'/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;