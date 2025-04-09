import React from 'react'
import { Link } from 'react-router'
import './welcomePage.css'

function WelcomePage() {
  return (
    <div className='welcome-page'>
      <img src="/coins.png" alt="" className='coins'/>
      <div className="left-container">
        <h1>Coinly</h1>
        <h2>Supercharge your finance</h2>
        <h3>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat sint
          dolorem doloribus, architecto dolor.
        </h3>
        <Link to={"/dashboard"}>Get started</Link>
      </div>
      <div className="right-container">
        RIGHT
      </div>
    </div>
  )
}

export default WelcomePage
