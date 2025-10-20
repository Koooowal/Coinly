import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter,Routes,Route} from 'react-router'
import Dashboard from './Routes/DashboardPage/dashboardPage'
import Expenses from './Routes/ExpensesPage/expensesPage'
import Incomes from './Routes/IncomesPage/incomesPage'
import WelcomePage from './Routes/WelcomePage/welcomePage'
import MainLayout from './Layouts/MainLayout/mainLayout'
import Budgets from './Routes/BudgetPage/budgetPage'
import Goals from './Routes/GoalPage/goalPage'
import Reports from './Routes/ReportPage/reportPage'
import Profile from './Routes/ProfilePage/profilePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<WelcomePage/>} />
      <Route element={<MainLayout/>}>
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/dashboard/expenses' element={<Expenses/>} />
          <Route path='/dashboard/incomes' element={<Incomes/>} />
          <Route path='/dashboard/budgets' element={<Budgets/>} />
          <Route path='/dashboard/goals' element={<Goals/>} />
          <Route path='/dashboard/reports' element={<Reports/>} />
          <Route path='/dashboard/profile' element={<Profile/>} />
      </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
