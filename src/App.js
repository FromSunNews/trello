import React from 'react'
import './App.scss'

// custom components
import AppBar from 'components/AppBar/AppBar'
import BoardBar from 'components/BoardBar/BoardBar'
import BoardContent from 'components/BoardContent/BoardContent'

import { Routes, Route } from 'react-router-dom'
import Auth from 'components/Auth/Auth'
import NotFound from 'components/NotFound/NotFound'
import AccountVerification from 'components/Auth/AccountVerification/AccountVerification'

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <div className="trello-trungquandev-master">
          <AppBar />
          <BoardBar />
          <BoardContent />
        </div>
      }/>

      <Route path='/signIn' element={<Auth />} />

      <Route path='/signUp' element={<Auth />} />

      <Route path='/account/verification' element={<AccountVerification />} />

      {/* 404 offen set last */}
      <Route path='*' element={
        <NotFound/>
      }/>
    </Routes>

  )
}

export default App
