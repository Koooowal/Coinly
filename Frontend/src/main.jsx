import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter,Routes,Route} from 'react-router'
import MainLayout from './Layouts/mainLayout'
import HomePage from './Routes/HomePage/homePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route path='/' element={<HomePage/>} />
          <Route path='/about' element={<div>About</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
