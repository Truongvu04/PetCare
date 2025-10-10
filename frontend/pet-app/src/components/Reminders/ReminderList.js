import React from 'react';
import { reminders } from '../../data/mockData';

const ReminderList = () => {
  const upcomingReminders = reminders.filter(r => r.status === 'upcoming');
  const overdueReminders = reminders.filter(r => r.status === 'overdue');

  const formatDueDate = (date) => {
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Due in 1 day';
    if (diffDays === 2) return 'Due in 2 days';
    if (diffDays === 7) return 'Due in 1 week';
    if (diffDays === 14) return 'Due in 2 weeks';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    return `Due in ${diffDays} days`;
  };

  return React.createElement('div', { className: 'container mx-auto px-6 py-8' },
    React.createElement('div', { className: 'max-w-4xl mx-auto' },
      React.createElement('div', { className: 'mb-8' },
        React.createElement('h2', { className: 'text-3xl font-bold text-gray-900 dark:text-white' }, 'Reminders'),
        React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-1' },
          'Manage your pet\'s reminders to ensure they stay healthy and happy.'
        )
      ),
      
      React.createElement('div', { className: 'space-y-8' },
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2' },
            React.createElement('span', { className: 'material-symbols-outlined text-primary' }, 'notifications_active'),
            'Upcoming Reminders'
          ),
          React.createElement('div', { className: 'space-y-4' },
            ...upcomingReminders.map(reminder => 
              React.createElement('div', {
                key: reminder.id,
                className: 'bg-white dark:bg-background-dark/50 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-300'
              },
                React.createElement('div', { className: 'flex items-center gap-4' },
                  React.createElement('div', { className: 'bg-primary/10 dark:bg-primary/20 p-3 rounded-full' },
                    React.createElement('span', { className: 'material-symbols-outlined text-primary' }, reminder.icon)
                  ),
                  React.createElement('div', null,
                    React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-100' }, reminder.title),
                    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, formatDueDate(reminder.dueDate))
                  )
                ),
                React.createElement('button', {
                  className: 'p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors'
                },
                  React.createElement('span', { className: 'material-symbols-outlined text-gray-600 dark:text-gray-300' }, 'edit')
                )
              )
            )
          )
        ),
        
        overdueReminders.length > 0 && React.createElement('div', null,
          React.createElement('h3', { className: 'text-xl font-bold text-red-500 dark:text-red-400 mb-4 flex items-center gap-2' },
            React.createElement('span', { className: 'material-symbols-outlined' }, 'notification_important'),
            'Overdue Reminders'
          ),
          React.createElement('div', { className: 'space-y-4' },
            ...overdueReminders.map(reminder => 
              React.createElement('div', {
                key: reminder.id,
                className: 'bg-red-50/50 dark:bg-red-900/20 rounded-lg p-4 flex items-center justify-between shadow-sm border border-red-200 dark:border-red-800'
              },
                React.createElement('div', { className: 'flex items-center gap-4' },
                  React.createElement('div', { className: 'bg-red-100/50 dark:bg-red-900/30 p-3 rounded-full' },
                    React.createElement('span', { className: 'material-symbols-outlined text-red-500 dark:text-red-400' }, reminder.icon)
                  ),
                  React.createElement('div', null,
                    React.createElement('p', { className: 'font-semibold text-gray-800 dark:text-gray-100' }, reminder.title),
                    React.createElement('p', { className: 'text-sm text-red-600 dark:text-red-400 font-medium' }, formatDueDate(reminder.dueDate))
                  )
                ),
                React.createElement('button', {
                  className: 'p-2 rounded-full hover:bg-red-100/80 dark:hover:bg-red-900/50 transition-colors'
                },
                  React.createElement('span', { className: 'material-symbols-outlined text-red-600 dark:text-red-400' }, 'edit')
                )
              )
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'mt-12 flex justify-end' },
        React.createElement('button', {
          className: 'bg-primary text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg'
        },
          React.createElement('span', { className: 'material-symbols-outlined' }, 'add'),
          React.createElement('span', null, 'Add New Reminder')
        )
      )
    )
  );
};

export default ReminderList;
