import React from 'react';
import { pets, user } from '../../data/mockData';

const PetList = () => {
  return React.createElement('div', { className: 'flex min-h-screen' },
    React.createElement('aside', { className: 'w-72 bg-white/50 dark:bg-black/20 p-6 flex-shrink-0' },
      React.createElement('div', { className: 'flex flex-col h-full' },
        React.createElement('div', { className: 'flex items-center gap-4 mb-10' },
          React.createElement('div', {
            className: 'w-12 h-12 rounded-full bg-cover bg-center',
            style: { backgroundImage: `url("${user.avatar}")` }
          }),
          React.createElement('div', null,
            React.createElement('h1', { className: 'font-bold text-lg text-gray-900 dark:text-white' }, user.name),
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, user.role)
          )
        ),
        React.createElement('nav', { className: 'flex flex-col gap-2' },
          React.createElement('a', {
            className: 'flex items-center gap-3 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'dashboard'),
            React.createElement('span', { className: 'font-medium' }, 'Dashboard')
          ),
          React.createElement('a', {
            className: 'flex items-center gap-3 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'search'),
            React.createElement('span', { className: 'font-medium' }, 'Find a Pet')
          ),
          React.createElement('a', {
            className: 'flex items-center gap-3 px-4 py-3 rounded-full bg-primary/20 text-primary font-bold',
            href: '#'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'pets'),
            React.createElement('span', { className: 'font-medium' }, 'My Pets')
          ),
          React.createElement('a', {
            className: 'flex items-center gap-3 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'calendar_month'),
            React.createElement('span', { className: 'font-medium' }, 'My Appointments')
          ),
          React.createElement('a', {
            className: 'flex items-center gap-3 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'person'),
            React.createElement('span', { className: 'font-medium' }, 'My Profile')
          )
        )
      )
    ),
    
    React.createElement('main', { className: 'flex-1 p-8' },
      React.createElement('div', { className: 'max-w-4xl mx-auto' },
        React.createElement('header', { className: 'flex justify-between items-center mb-8' },
          React.createElement('h1', { className: 'text-4xl font-bold text-gray-900 dark:text-white' }, 'My Pets'),
          React.createElement('button', {
            className: 'flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary/90 transition-colors'
          },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'add'),
            React.createElement('span', null, 'Add a Pet')
          )
        ),
        
        React.createElement('div', { className: 'space-y-6' },
          ...pets.map(pet => 
            React.createElement('div', {
              key: pet.id,
              className: 'bg-white dark:bg-background-dark/50 rounded-lg p-6 flex items-center gap-8 shadow-sm hover:shadow-lg transition-shadow duration-300'
            },
              React.createElement('div', {
                className: 'w-48 h-48 rounded-lg bg-cover bg-center flex-shrink-0',
                style: { backgroundImage: `url("${pet.image}")` }
              }),
              React.createElement('div', { className: 'flex-1' },
                React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, pet.type),
                React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-white mt-1' }, pet.name),
                React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 mt-1' }, `${pet.breed}, ${pet.age} years old`),
                React.createElement('div', { className: 'mt-4 flex gap-3' },
                  React.createElement('button', { className: 'text-sm font-medium text-primary hover:underline' }, 'View Profile'),
                  React.createElement('button', {
                    className: 'text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                  }, 'Edit')
                )
              )
            )
          )
        )
      )
    )
  );
};

export default PetList;
