import React from 'react'
import styled from 'styled-components'
import LeftBar from '../Components/LeftBar/leftBar'
import { Outlet } from 'react-router'

function MainLayout() {
  return (
    <LayoutContainer>
      <LeftBar />
      <div className='content'>
        <Outlet />
      </div>
    </LayoutContainer>
  )
}

export default MainLayout;

const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  .content{
  display: flex;
  flex:1;
  }
`
