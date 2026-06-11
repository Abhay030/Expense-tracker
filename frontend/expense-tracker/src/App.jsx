import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import UserProvider from './context/userContext'
import { Toaster } from 'react-hot-toast'

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Auth/Login'))
const SignUp = lazy(() => import('./pages/Auth/SignUp'))
const Home = lazy(() => import('./pages/Dashboard/Home'))
const Income = lazy(() => import('./pages/Dashboard/Income'))
const Expense = lazy(() => import('./pages/Dashboard/Expense'))
const Analytics = lazy(() => import('./pages/Dashboard/Analytics'))
const Settings = lazy(() => import('./pages/Dashboard/Settings'))
const NotFound = lazy(() => import('./pages/NotFound/NotFound'))

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-navy">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"
        style={{ borderWidth: '3px' }}></div>
      <p className="text-text-muted text-sm">Loading...</p>
    </div>
  </div>
)

const App = () => {
  return (
    <UserProvider>
      <Router>
        <AnimatedRoutes />
        <Toaster
          position="top-right"
          gutter={12}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A2332',
              color: '#F1F5F9',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              fontSize: '13px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#1A2332' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1A2332' },
            },
          }}
        />
      </Router>
    </UserProvider>
  )
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
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
    </AnimatePresence>
  )
}

const Root = () => {
  const isAuthenticated = localStorage.getItem('token')
  if (!isAuthenticated) return <Navigate to="/login" />
  return <Navigate to="/dashboard" />
}

export default App
