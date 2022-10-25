import React from 'react'
import './NotFound.scss'

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Oops! Something is wrong.</p>
      <a className='button' href='#'><i className='icon-home'></i> Go back in initial page, is better.</a>
    </div>
  )
}

export default NotFound