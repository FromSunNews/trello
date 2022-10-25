import React from 'react'

import './Auth.scss'
import authSignUpBg from 'resources/images/auth-sign-up-bg.webp'
import authSignInBg from 'resources/images/auth-sign-in-bg.png'

function Auth() {
  return (
    <div className="auth__container sign-up-mode">
      <div className="auth__container__forms">
        <div className="auth__form-area">
          <form className="auth__form form__sign-in">
            <h2 className="auth__form__title">Sign In</h2>
            <div className="auth__form__input-field">
              <i className="fa fa-envelope"></i>
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div className="auth__form__input-field">
              <i className="fa fa-lock"></i>
              <input type="password" name="password" placeholder="Password" required />
            </div>

            <button className="auth__form__submit" type="button">Login</button>
          </form>

          <form className="auth__form form__sign-up">
            <h2 className="auth__form__title">Sign Up</h2>
            <div className="auth__form__input-field">
              <i className="fa fa-envelope"></i>
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div className="auth__form__input-field">
              <i className="fa fa-lock"></i>
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <div className="auth__form__input-field">
              <i className="fa fa-lock"></i>
              <input type="password" name="password_confirmation" placeholder="Password Confirmation" required />
            </div>

            <button className="auth__form__submit" type="button">Sign Up</button>
          </form>
        </div>
      </div>
      <div className="auth__container__panels">
        <div className="panel panel__left">
          <div className="panel__content">
            <h3 className="panel__title">New here ?</h3>
            <p className="panel__paragraph">
              Enter your personal details and start journey with us
            </p>
            <button className="auth__btn auth__btn-transparent" id="sign-up-btn">
              Sign Up
            </button>
          </div>
          <img className="panel__image" src={authSignUpBg} alt="" />
        </div>
        <div className="panel panel__right">
          <div className="panel__content">
            <h3 className="panel__title">One of us ?</h3>
            <p className="panel__paragraph">
              To keep connected with us please login with your personal info
            </p>
            <button className="auth__btn auth__btn-transparent" id="sign-in-btn">
              Sign In
            </button>
          </div>
          <img className="panel__image" src={authSignInBg} alt="" />
        </div>
      </div>
    </div>
  )
}

export default Auth
