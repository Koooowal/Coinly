import React from 'react'
import styled from 'styled-components'

function homePage() {
  return (
    <HomePageContainer>
      Home
    </HomePageContainer>
  )
}

export default homePage

const HomePageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100%;
  font-size: 32px;
  width: 100%;
  height: 100vh;
  background-color:rgb(255, 250, 237);

`