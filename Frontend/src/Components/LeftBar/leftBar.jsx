import React from 'react'
import styled from 'styled-components'
import logo from '../../Assets/Logo/coinly.svg'

function leftBar() {
  return (
    <BarContainer>
      <div className='title'>
        <img src={logo} />
        <h2>Coinly</h2>
      </div>  
    </BarContainer>
  )
}

export default leftBar

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
  .title img{
  width: 50px;
  height: 50px;
  }
  .title{
  display: flex;
  align-items:center;
  gap:10px;
  font-family: "Winky Sans", sans-serif;
  font-size: 32px;
  font-weight: 700;
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
     0px  3px 0 black; /* Grubszy obrys */
}


`