import React from 'react'

import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  EMAIL_RULE_MESSAGE,
  fieldErrorMessage
} from 'utilities/validators'

function SignUp() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmitSignUp = (data) => {

  }

  return (
    <form className="auth__form form__sign-up" onSubmit={handleSubmit(onSubmitSignUp)}>
            <h2 className="auth__form__title">Sign Up</h2>
            <div className="auth__form__input-field">
              <i className="fa fa-envelope"></i>
              <input 
                type="text" 
                // name="email" 
                placeholder="Email"
                autoComplete='nope'
                {...register('email',{
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern:{
                    value: EMAIL_RULE,
                    message: EMAIL_RULE_MESSAGE
                  }
                })}
              />
            </div>
            {fieldErrorMessage(errors,'email')}
            <div className="auth__form__input-field">
              <i className="fa fa-lock"></i>
              <input 
                type="text" 
                // name="email" 
                placeholder="Password"
                {...register('password',{
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
              />
            </div>
            {fieldErrorMessage(errors,'password')}
            <div className="auth__form__input-field">
              <i className="fa fa-lock"></i>
              <input 
                type="password" 
                placeholder="Confirm Password"
                {...register('password_confirmation', {
                  validate: (value) => {
                    return value === watch('password') || 'Password confirmation does not match.'
                  }
                })}
              />
            </div>
            {fieldErrorMessage(errors,'password_confirmation')}

            <button className="auth__form__submit" type="submit">Sign Up</button>
          </form>
  )
}

export default SignUp