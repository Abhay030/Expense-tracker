import React from 'react'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Dashboard/Home'
import Income from './pages/Dashboard/Income'
import Expense from './pages/Dashboard/Expense'
import Analytics from './pages/Dashboard/Analytics'
import Settings from './pages/Dashboard/Settings'
import NotFound from './pages/NotFound/NotFound'
import UserProvider from './context/userContext'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>

      <Toaster 
        toastOptions={{
          className: "",
          style: {
            fontSize: '13px',
          }
        }}
      />
    </UserProvider>
  )
}

export default App

const Root = () => {

  // Check if the user is authenticated
  const isAuthenticated = localStorage.getItem('token');

  // Redirect to the login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  // Render the dashboard if authenticated
  return <Navigate to="/dashboard" />;
}

