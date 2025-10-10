import React from 'react';

const Footer = () => {
  return React.createElement('footer', { className: 'bg-background-dark/5 dark:bg-background-light/5' },
    React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8 py-12' },
      React.createElement('div', { className: 'flex flex-col md:flex-row justify-between items-center gap-8' },
        React.createElement('nav', { className: 'flex flex-wrap justify-center gap-x-6 gap-y-2' },
          React.createElement('a', {
            className: 'text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          }, 'About Us'),
          React.createElement('a', {
            className: 'text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          }, 'Contact'),
          React.createElement('a', {
            className: 'text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          }, 'Terms of Service'),
          React.createElement('a', {
            className: 'text-sm text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          }, 'Privacy Policy')
        ),
        React.createElement('div', { className: 'flex justify-center gap-6' },
          React.createElement('a', {
            className: 'text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('svg', { className: 'h-6 w-6', fill: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { d: 'M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.49-1.74.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C7.38 8.98 4.2 7.15 2.14 4.5c-.34.58-.53 1.25-.53 1.97 0 1.49.76 2.8 1.91 3.57-.71 0-1.37-.22-1.95-.54v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.27 14.2 20.27 8.17v-.45c.84-.6 1.56-1.36 2.19-2.26z' })
            )
          ),
          React.createElement('a', {
            className: 'text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('svg', { className: 'h-6 w-6', fill: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.882c-3.264 0-3.66.014-4.944.076-4.237.194-6.074 1.996-6.268 6.268-.062 1.284-.076 1.68-.076 4.944s.014 3.66.076 4.944c.194 4.272 2.031 6.074 6.268 6.268 1.284.062 1.68.076 4.944.076s3.66-.014 4.944-.076c4.237-.194 6.074-1.996 6.268-6.268.062-1.284.076-1.68.076-4.944s-.014-3.66-.076-4.944c-.194-4.272-2.031-6.074-6.268-6.268C15.66.295 15.264.281 12 .281zM12 7.218c-2.64 0-4.782 2.142-4.782 4.782s2.142 4.782 4.782 4.782 4.782-2.142 4.782-4.782-2.142-4.782-4.782-4.782zm0 7.681c-1.6 0-2.899-1.3-2.899-2.899s1.3-2.899 2.899-2.899 2.899 1.3 2.899 2.899-1.299 2.899-2.899 2.899zm5.232-7.82c-.62 0-1.121.502-1.121 1.121s.501 1.121 1.121 1.121c.62 0 1.121-.502 1.121-1.121s-.501-1.121-1.121-1.121z' })
            )
          ),
          React.createElement('a', {
            className: 'text-background-dark/60 dark:text-background-light/60 hover:text-primary dark:hover:text-primary transition-colors',
            href: '#'
          },
            React.createElement('svg', { className: 'h-6 w-6', fill: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' })
            )
          )
        )
      ),
      React.createElement('div', { className: 'mt-8 border-t border-background-dark/10 dark:border-background-light/10 pt-8 text-center text-sm text-background-dark/60 dark:text-background-light/60' },
        React.createElement('p', null, '© 2024 PetCare+. All rights reserved.')
      )
    )
  );
};

export default Footer;
