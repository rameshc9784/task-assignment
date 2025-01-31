import React from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/dashboard'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard /> } />
      </Routes>
    </>
  )
}

export default App
