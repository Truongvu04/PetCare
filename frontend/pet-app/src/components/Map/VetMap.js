import React from 'react';
import { vetClinics } from '../../data/mockData';

const VetMap = () => {
  const clinic = vetClinics[0];

  return React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8 py-8' },
    React.createElement('div', { className: 'flex flex-col gap-8' },
      React.createElement('div', { className: 'flex flex-col md:flex-row gap-4 items-center' },
        React.createElement('div', { className: 'relative flex-grow w-full' },
          React.createElement('span', {
            className: 'material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500'
          }, 'search'),
          React.createElement('input', {
            className: 'w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500',
            placeholder: 'Search vets by name, specialty, or location',
            type: 'text'
          })
        ),
        React.createElement('button', {
          className: 'w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity'
        },
          React.createElement('span', { className: 'material-symbols-outlined' }, 'filter_list'),
          React.createElement('span', null, 'Filters')
        )
      ),
      
      React.createElement('div', { className: 'relative h-[60vh] md:h-[70vh] rounded-xl overflow-hidden shadow-lg' },
        React.createElement('div', {
          className: 'absolute inset-0 bg-cover bg-center',
          style: {
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2Jg37KrCrXDCOL5Z9CLZd48n95WqMPUaO38_xJZ_LCCDRe8YxvI5X7S36jKjZLBhBmA-gVmoLu7b1_nETEmVA2V6lM_9Ier-VL2OTKEWmhFwF1HB8XJBNMk-Z6LDWwYHWK5ulVTEAGqV-MpaIPHJOk7D90q_LUgIZISQr_8VJdG2kTXBLJPw_ALs-myb234aXJ6wpH6Mf0EmJqIgBbcsQqvF69nvDQn0OxyuWgiHS-uHyJkxR1MrbZriFJ0GieDr4FtgW1aEXhkrl")'
          }
        }),
        
        React.createElement('div', { className: 'absolute top-4 right-4 flex flex-col gap-2' },
          React.createElement('div', { className: 'flex flex-col rounded-lg bg-background-light dark:bg-background-dark shadow-md' },
            React.createElement('button', {
              className: 'p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-t-lg transition-colors'
            },
              React.createElement('span', { className: 'material-symbols-outlined' }, 'add')
            ),
            React.createElement('button', {
              className: 'p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-b-lg transition-colors'
            },
              React.createElement('span', { className: 'material-symbols-outlined' }, 'remove')
            )
          ),
          React.createElement('button', {
            className: 'p-3 rounded-lg bg-background-light dark:bg-background-dark text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-md transition-colors'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'my_location')
          )
        ),
        
        React.createElement('div', { className: 'absolute bottom-4 left-4 right-4 md:bottom-8 md:left-auto' },
          React.createElement('div', {
            className: 'bg-background-light dark:bg-background-dark p-4 rounded-xl shadow-2xl max-w-sm w-full'
          },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('div', {
                className: 'w-16 h-16 rounded-lg bg-cover bg-center bg-primary/20 flex items-center justify-center'
              },
                React.createElement('span', { className: 'material-symbols-outlined text-4xl text-primary' }, 'pets')
              ),
              React.createElement('div', { className: 'flex-1' },
                React.createElement('h3', { className: 'font-bold text-lg text-gray-900 dark:text-white' }, clinic.name),
                React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-400' }, clinic.address),
                React.createElement('div', { className: 'flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400' },
                  React.createElement('span', { className: 'material-symbols-outlined text-base text-amber-500' }, 'star'),
                  React.createElement('span', { className: 'font-bold text-gray-800 dark:text-gray-200' }, clinic.rating),
                  React.createElement('span', null, `(${clinic.reviews} reviews)`)
                ),
                React.createElement('p', { className: 'text-sm mt-1 text-primary font-semibold' }, clinic.status)
              )
            )
          )
        )
      )
    )
  );
};

export default VetMap;
