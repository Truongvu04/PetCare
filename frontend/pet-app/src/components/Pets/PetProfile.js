import React from 'react';
import { pets, reminders, expenses, user } from '../../data/mockData';

const PetProfile = () => {
  const pet = pets[0];
  const upcomingReminders = reminders.filter(r => r.status === 'upcoming').slice(0, 2);
  const currentExpenses = expenses.filter(e => e.month === 'current');

  return React.createElement('div', { className: 'flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12' },
    React.createElement('div', { className: 'flex flex-col gap-12' },
      React.createElement('div', { className: 'flex flex-col md:flex-row justify-between items-start gap-4' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-4xl font-bold text-gray-900 dark:text-white' }, `Welcome back, ${user.name}!`),
          React.createElement('p', { className: 'mt-2 text-gray-600 dark:text-gray-400' },
            'Manage your pet\'s health, track expenses, and explore our marketplace.'
          )
        ),
        React.createElement('button', {
          className: 'bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary/90 transition-colors'
        }, 'Add New Pet')
      ),
      
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' },
        React.createElement('div', { className: 'lg:col-span-2 flex flex-col gap-8' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-900 dark:text-white' }, 'Your Pets'),
            React.createElement('div', { className: 'flex gap-6 overflow-x-auto pb-4' },
              React.createElement('div', { className: 'flex-shrink-0 w-48 text-center' },
                React.createElement('div', {
                  className: 'w-48 h-48 rounded-lg bg-cover bg-center mb-2',
                  style: { backgroundImage: `url("${pet.image}")` }
                }),
                React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-300' }, pet.name),
                React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, `${pet.breed}, ${pet.age} yrs`)
              )
            )
          ),
          
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' },
            React.createElement('div', null,
              React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-900 dark:text-white' }, 'Reminders'),
              React.createElement('div', { className: 'space-y-4' },
                ...upcomingReminders.map(reminder => 
                  React.createElement('div', {
                    key: reminder.id,
                    className: 'flex items-center gap-4 p-4 rounded-lg bg-gray-100/50 dark:bg-gray-800/50'
                  },
                    React.createElement('div', {
                      className: 'flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-primary/20 text-primary'
                    },
                      React.createElement('span', { className: 'material-symbols-outlined' }, reminder.icon)
                    ),
                    React.createElement('div', null,
                      React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-300' }, 
                        reminder.type === 'vaccination' ? 'Vaccination' : 'Check-up'
                      ),
                      React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' },
                        reminder.type === 'vaccination' ? 'Due in 2 weeks' : 'Scheduled for next month'
                      )
                    )
                  )
                )
              )
            ),
            
            React.createElement('div', null,
              React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-900 dark:text-white' }, 'Expenses'),
              React.createElement('div', { className: 'space-y-4' },
                ...currentExpenses.map(expense => 
                  React.createElement('div', {
                    key: expense.id,
                    className: 'flex items-center gap-4 p-4 rounded-lg bg-gray-100/50 dark:bg-gray-800/50'
                  },
                    React.createElement('div', {
                      className: 'flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-primary/20 text-primary'
                    },
                      React.createElement('span', { className: 'material-symbols-outlined' }, 
                        expense.category === 'Food' ? 'shopping_cart' : 'medication'
                      )
                    ),
                    React.createElement('div', null,
                      React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-300' }, expense.category),
                      React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, 
                        `Total this month: $${expense.amount}`
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        
        React.createElement('div', { className: 'flex flex-col gap-8' },
          React.createElement('div', { className: 'p-6 rounded-lg bg-gray-100 dark:bg-gray-800' },
            React.createElement('h2', { className: 'text-2xl font-bold mb-4 text-gray-900 dark:text-white' }, 'Health & Activity'),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('div', {
                  className: 'flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary'
                },
                  React.createElement('span', { className: 'material-symbols-outlined' }, 'monitor_weight')
                ),
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-300' }, 'Weight'),
                  React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, pet.weight)
                )
              ),
              React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('div', {
                  className: 'flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary'
                },
                  React.createElement('span', { className: 'material-symbols-outlined' }, 'restaurant')
                ),
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-300' }, 'Diet'),
                  React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, pet.diet)
                )
              ),
              React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('div', {
                  className: 'flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary'
                },
                  React.createElement('span', { className: 'material-symbols-outlined' }, 'description')
                ),
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-300' }, 'Medical History'),
                  React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, 'View records')
                )
              )
            )
          ),
          
          React.createElement('div', { className: 'p-6 rounded-lg bg-primary text-white' },
            React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Need Advice?'),
            React.createElement('p', { className: 'mb-6 opacity-80' },
              'Get instant advice from our AI chatbot. Available 24/7 to answer your pet care questions.'
            ),
            React.createElement('button', {
              className: 'bg-white text-primary font-bold py-3 px-6 rounded-full hover:bg-white/90 transition-colors'
            }, 'Chat Now')
          )
        )
      )
    )
  );
};

export default PetProfile;
