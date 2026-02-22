import React, { Suspense, lazy } from 'react'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import UserProvider from './context/userContext'
import { Toaster } from 'react-hot-toast'

// Lazy-loaded pages — only loaded when the user navigates to them
const Login = lazy(() => import('./pages/Auth/Login'))
const SignUp = lazy(() => import('./pages/Auth/SignUp'))
const Home = lazy(() => import('./pages/Dashboard/Home'))
const Income = lazy(() => import('./pages/Dashboard/Income'))
const Expense = lazy(() => import('./pages/Dashboard/Expense'))
const Analytics = lazy(() => import('./pages/Dashboard/Analytics'))
const Settings = lazy(() => import('./pages/Dashboard/Settings'))
const NotFound = lazy(() => import('./pages/NotFound/NotFound'))

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
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
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <Navigate to="/dashboard" />;
}
