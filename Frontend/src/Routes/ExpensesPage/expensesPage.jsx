import React from 'react'
import styled from 'styled-components'

function expensesPage() {
  return (
    <ExpensesPageContainer>
      Expenses
    </ExpensesPageContainer>
  )
}

export default expensesPage

const ExpensesPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  width: 100%;
  height: 100vh;
  background-color:rgb(255, 250, 237);

`