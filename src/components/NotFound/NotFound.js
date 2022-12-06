import React from 'react'
import './NotFound.scss'

import {useNavigate} from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className='notfound_container'>
      <h1 className='notfound_heading'>404</h1>
      <p className='notfound_desc'>Oops! Something is wrong.</p>
      <a className='notfound_button' href='/'><i className='notfound_icon-home'></i>Go back!</a>
    </div>
  )
}

export default NotFound