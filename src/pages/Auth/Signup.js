import React, { useState } from 'react';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email } from '../../util/validators';
import Auth from './Auth';

function Signup({ onSignup, loading }) {
  const [signupForm, setSignupForm] = useState({
    email: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, email]
    },
    password: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, length({ min: 5 })]
    },
    name: {
      value: '',
      valid: false,
      touched: false,
      validators: [required]
    },
    formIsValid: false
  });

  const inputChangeHandler = (input, value) => {
    setSignupForm(prevForm => {
      let isValid = true;
      for (const validator of prevForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevForm,
        [input]: {
          ...prevForm[input],
          valid: isValid,
          value: value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        if (inputName !== 'formIsValid') {
          formIsValid = formIsValid && updatedForm[inputName].valid;
        }
      }
      return {
        ...updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  const inputBlurHandler = (input) => {
    setSignupForm(prevForm => ({
      ...prevForm,
      [input]: {
        ...prevForm[input],
        touched: true
      }
    }));
  };

  return (
    <Auth>
      <form onSubmit={e => onSignup(e, { signupForm })}>
        <Input
          id="email"
          label="Your E-Mail"
          type="email"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('email')}
          value={signupForm['email'].value}
          valid={signupForm['email'].valid}
          touched={signupForm['email'].touched}
        />
        <Input
          id="name"
          label="Your Name"
          type="text"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('name')}
          value={signupForm['name'].value}
          valid={signupForm['name'].valid}
          touched={signupForm['name'].touched}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          control="input"
          onChange={inputChangeHandler}
          onBlur={() => inputBlurHandler('password')}
          value={signupForm['password'].value}
          valid={signupForm['password'].valid}
          touched={signupForm['password'].touched}
        />
        <Button design="raised" type="submit" loading={loading}>
          Signup
        </Button>
      </form>
    </Auth>
  );
}

export default Signup;
