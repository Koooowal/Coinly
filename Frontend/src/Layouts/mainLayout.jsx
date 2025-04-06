import React from 'react'
import './mainLayout.css'
import LeftBar from '../Components/LeftBar/leftBar'
import { Outlet } from 'react-router'

function MainLayout() {
  return (
    <div className='main-layout'>
      <LeftBar />
      <div className='content'>
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout;


