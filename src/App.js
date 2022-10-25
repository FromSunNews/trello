import React from 'react'
import './App.scss'

// custom components
import AppBar from 'components/AppBar/AppBar'
import BoardBar from 'components/BoardBar/BoardBar'
import BoardContent from 'components/BoardContent/BoardContent'

import {Routes, Route} from 'react-router-dom'
import Auth from 'components/Auth/Auth'

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

      {/* 404 offen set last */}
      <Route path='*' element={
        <div className="not-found">
          <h3>404 Not Found</h3>
        </div>
      }/>
    </Routes>

  )
}

export default App
