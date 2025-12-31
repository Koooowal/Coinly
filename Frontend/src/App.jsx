import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './Components/ProtectedRoute/protectedRoute';
import WelcomePage from './Routes/WelcomePage/welcomePage';
import LoginPage from './Routes/LoginPage/loginPage';
import RegisterPage from './Routes/RegisterPage/registerPage';
import MainLayout from './Layouts/MainLayout/mainLayout';
import Dashboard from './Routes/DashboardPage/dashboardPage';
import Expenses from './Routes/ExpensesPage/expensesPage';
import Incomes from './Routes/IncomesPage/incomesPage';
import Budgets from './Routes/BudgetPage/budgetPage';
import Goals from './Routes/GoalPage/goalPage';
import Reports from './Routes/ReportPage/reportPage';
import Profile from './Routes/ProfilePage/profilePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast-custom.css';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/expenses" element={<Expenses />} />
              <Route path="/dashboard/incomes" element={<Incomes />} />
              <Route path="/dashboard/budgets" element={<Budgets />} />
              <Route path="/dashboard/goals" element={<Goals />} />
              <Route path="/dashboard/reports" element={<Reports />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ zIndex: 9999 }}
        />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
