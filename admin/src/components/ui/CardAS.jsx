import React from 'react';

const CardAS = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`rounded-xl bg-white bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeaderAS = ({ className = '', children, ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitleAS = ({ className = '', children, ...props }) => {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardContentAS = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { CardAS, CardHeaderAS, CardTitleAS, CardContentAS };