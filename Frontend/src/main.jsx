import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter,Routes,Route} from 'react-router'
import Dashboard from './Routes/DashboardPage/dashboardPage'
import Expenses from './Routes/ExpensesPage/expensesPage'
import Incomes from './Routes/IncomesPage/incomesPage'
import WelcomePage from './Routes/WelcomePage/welcomePage'
import MainLayout from './Layouts/MainLayout/mainLayout'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<WelcomePage/>} />
      <Route element={<MainLayout/>}>
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/dashboard/expenses' element={<Expenses/>} />
          <Route path='/dashboard/incomes' element={<Incomes/>} />
      </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
