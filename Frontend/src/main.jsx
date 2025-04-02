import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter,Routes,Route} from 'react-router'
import MainLayout from './Layouts/mainLayout'
import HomePage from './Routes/HomePage/homePage'
import Expenses from './Routes/ExpensesPage/expensesPage'
import Incomes from './Routes/IncomesPage/incomesPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route path='/' element={<HomePage/>} />
          <Route path='/expenses' element={<Expenses/>} />
          <Route path='/incomes' element={<Incomes/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
