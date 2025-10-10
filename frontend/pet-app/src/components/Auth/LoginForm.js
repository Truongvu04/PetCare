import React, { useState } from 'react';

const LoginForm = () => {
  const [isRegister, setIsRegister] = useState(false);

  return React.createElement('div', { className: 'flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8' },
    React.createElement('div', { className: 'max-w-md w-full space-y-8 bg-white dark:bg-background-dark/50 p-10 rounded-xl shadow-lg' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('h2', { className: 'text-3xl font-extrabold text-gray-900 dark:text-white' }, 'Welcome to PetCare+'),
        React.createElement('p', { className: 'mt-2 text-sm text-gray-600 dark:text-gray-400' },
          'Your one-stop solution for pet happiness.'
        )
      ),
      
      React.createElement('div', { className: 'flex justify-center' },
        React.createElement('div', { className: 'relative w-72 h-10 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1' },
          React.createElement('button', {
            className: `relative w-1/2 h-full rounded-full transition-colors duration-300 ease-in-out z-10 font-semibold ${
              !isRegister ? 'bg-primary text-white' : 'text-gray-500 dark:text-gray-400'
            }`,
            onClick: () => setIsRegister(false)
          }, 'Login'),
          React.createElement('button', {
            className: `relative w-1/2 h-full rounded-full transition-colors duration-300 ease-in-out z-10 font-semibold ${
              isRegister ? 'bg-primary text-white' : 'text-gray-500 dark:text-gray-400'
            }`,
            onClick: () => setIsRegister(true)
          }, 'Register')
        )
      ),
      
      !isRegister ? React.createElement('div', { className: 'mt-8 space-y-6' },
        React.createElement('form', { className: 'space-y-6', method: 'POST' },
          React.createElement('div', { className: 'rounded-md -space-y-px' },
            React.createElement('div', null,
              React.createElement('label', { className: 'sr-only', htmlFor: 'login-email' }, 'Phone number or email'),
              React.createElement('input', {
                className: 'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-background-light dark:bg-background-dark focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm',
                id: 'login-email',
                name: 'email',
                placeholder: 'Phone number or email',
                required: true,
                type: 'text'
              })
            ),
            React.createElement('div', { className: 'pt-4' },
              React.createElement('label', { className: 'sr-only', htmlFor: 'login-password' }, 'Password'),
              React.createElement('input', {
                autoComplete: 'current-password',
                className: 'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-background-light dark:bg-background-dark focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm',
                id: 'login-password',
                name: 'password',
                placeholder: 'Password',
                required: true,
                type: 'password'
              })
            )
          ),
          React.createElement('div', { className: 'flex items-center justify-end' },
            React.createElement('div', { className: 'text-sm' },
              React.createElement('a', { className: 'font-medium text-primary hover:text-primary/80', href: '#' }, 'Forgot your password?')
            )
          ),
          React.createElement('div', null,
            React.createElement('button', {
              className: 'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
              type: 'submit'
            }, 'Login')
          )
        )
      ) : React.createElement('div', { className: 'mt-8 space-y-6' },
        React.createElement('form', { className: 'space-y-6', method: 'POST' },
          React.createElement('div', { className: 'rounded-md -space-y-px' },
            React.createElement('div', null,
              React.createElement('label', { className: 'sr-only', htmlFor: 'register-email' }, 'Phone number or email'),
              React.createElement('input', {
                className: 'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-background-light dark:bg-background-dark focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm',
                id: 'register-email',
                name: 'email',
                placeholder: 'Phone number or email',
                required: true,
                type: 'text'
              })
            ),
            React.createElement('div', { className: 'pt-4' },
              React.createElement('label', { className: 'sr-only', htmlFor: 'register-password' }, 'Password'),
              React.createElement('input', {
                autoComplete: 'new-password',
                className: 'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-background-light dark:bg-background-dark focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm',
                id: 'register-password',
                name: 'password',
                placeholder: 'Password',
                required: true,
                type: 'password'
              })
            ),
            React.createElement('div', { className: 'pt-4' },
              React.createElement('label', { className: 'sr-only', htmlFor: 'register-password-confirm' }, 'Re-enter Password'),
              React.createElement('input', {
                autoComplete: 'new-password',
                className: 'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-background-light dark:bg-background-dark focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm',
                id: 'register-password-confirm',
                name: 'password_confirmation',
                placeholder: 'Re-enter Password',
                required: true,
                type: 'password'
              })
            ),
            React.createElement('div', { className: 'flex gap-2 pt-4' },
              React.createElement('input', {
                className: 'appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-background-light dark:bg-background-dark focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm',
                name: 'verification_code',
                placeholder: 'Verification Code',
                type: 'text'
              }),
              React.createElement('button', {
                className: 'px-4 py-2 text-sm font-medium rounded-lg text-black bg-primary/50 hover:bg-primary/60 whitespace-nowrap',
                type: 'button'
              }, 'Send Code')
            )
          ),
          React.createElement('div', null,
            React.createElement('button', {
              className: 'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
              type: 'submit'
            }, 'Register')
          )
        )
      ),
      
      React.createElement('div', { className: 'relative flex py-2 items-center' },
        React.createElement('div', { className: 'flex-grow border-t border-gray-300 dark:border-gray-600' }),
        React.createElement('span', { className: 'flex-shrink mx-4 text-gray-400 dark:text-gray-500' }, 'Or continue with'),
        React.createElement('div', { className: 'flex-grow border-t border-gray-300 dark:border-gray-600' })
      ),
      
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('button', {
          className: 'w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-background-dark text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary/10'
        },
          React.createElement('img', {
            alt: 'Google logo',
            className: 'h-5 w-5 mr-2',
            src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDElFXWtBvruvFgvKHLlTinhYSmPviHkmV7iu8V8N1INhnlHw_fidzE7u1MyT_49uA98DNo9zhXFnGVq7WbmjpW8Ap3Vm_VgyxX6-NjmYiLkfJGbTuJa9c_Dw7QI7TYg93OxQ0hw4PtAJX9gvPBbvS2Dz-7-Tpf97hksFHeCF9uQ8FsUD6p9g9jzOoWTFFKthsH-VX0uVkcU8EdQabJ0j96IEj7JNe_fbdOrfDx65Wvax_gZiOIv1TLQBO0ctAGOm8q6cfp9lww-p3'
          }),
          'Continue with Google'
        ),
        React.createElement('button', {
          className: 'w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-background-dark text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary/10'
        },
          React.createElement('img', {
            alt: 'Facebook logo',
            className: 'h-5 w-5 mr-2',
            src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiTRkQeK-I6Ygxxf7B-3W2j2dR1UHvJkBQr-v471m8lKQ_mPzA5emEabCKrB56agIOtV3Rz9MDOMc7j8OIQUMh4vdVGqtftdArWP-c3qmRqXWKdgEVQy2OpHiRAXJHq14avFJDItrgpijXULoxPS0_MppI33eOyzFQXTG875SHMFMbAq9NR1-3KHQr84oMMXqfYijqUNYkVG4xgIjAd8lLCD6HHUepay8oK0iGUELy5itzCKHJH3u6lJFd_1VST6gozaHB1mYChq5G',
          }),
          'Continue with Facebook'
        )
      )
    )
  );
};

export default LoginForm;
