import React from 'react';

export const ResponsiveContainer = ({ children, className = "" }) => (
  <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export const ResponsiveGrid = ({ 
  children, 
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = "4",
  className = ""
}) => {
  const gridClass = `grid grid-cols-${cols.base} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} gap-${gap}`;
  
  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveStack = ({ children, className = "" }) => (
  <div className={`flex flex-col md:flex-row gap-4 md:gap-6 ${className}`}>
    {children}
  </div>
);
