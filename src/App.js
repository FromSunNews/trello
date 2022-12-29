import React from 'react'
import './App.scss'

// custom components
import AppBar from 'components/AppBar/AppBar'
import BoardBar from 'components/BoardBar/BoardBar'
import BoardContent from 'components/BoardContent/BoardContent'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Auth from 'components/Auth/Auth'
import NotFound from 'components/NotFound/NotFound'
import AccountVerification from 'components/Auth/AccountVerification/AccountVerification'

import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser} from 'redux/user/userSlice'
import UserPage from 'components/UserPage/UserPage'
import Boards from 'components/Boards/Boards'

import { selectCurrentActiveCard } from 'redux/activeCard/activeCardSlice'
import ActiveCardModal from 'components/Common/ActiveCardModal'

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const publicRoutes = ['/signIn','/signUp','/account/verification','/404']
  const location = useLocation()
  const currentUSer = useSelector(selectCurrentUser)

  const currentActiveCard = useSelector(selectCurrentActiveCard)

  if (!publicRoutes.includes(location.pathname) && ! isAuthenticated) {
    return <Navigate to='/signIn' />
  }

  return (
    <Routes>
      <Route path='/' element={
        <Navigate to={`/u/${currentUSer?.username}/boards?currentPage=1&itemsPerPage=12`}/>
      }/>

      <Route path='/signIn' element={<Auth />} />

      <Route path='/signUp' element={<Auth />} />

      <Route path='/account/verification' element={<AccountVerification />} />

      <Route path='/u/:username' element={
        <div className='user__page'>
          <AppBar />
          <UserPage />
        </div>
      } />

      <Route path='/b/:boardId' element={
        <div className="trello-trungquandev-master">
          <AppBar />
          <BoardBar />
          <BoardContent />
          {currentActiveCard && <ActiveCardModal />}
        </div>
      } />

      <Route path='/u/:username/boards' element={
        <div className='boards__page'>
          <AppBar />
          <Boards />
        </div>
      } />

      {/* 404 offen set last */}
      <Route path='*' element={
        <NotFound/>
      }/>
    </Routes>

  )
}

export default App
