import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return React.createElement('div', { className: 'relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display' },
    React.createElement('div', { className: 'flex h-full grow flex-col' },
      React.createElement(Header),
      React.createElement('main', { className: 'flex-1' }, children),
      React.createElement(Footer)
    )
  );
};

export default Layout;
