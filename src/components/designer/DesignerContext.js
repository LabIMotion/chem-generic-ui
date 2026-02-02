import React, { createContext, useContext } from 'react';

const DesignerContext = createContext();

export const DesignerProvider = ({ children, value }) => {
  return (
    <DesignerContext.Provider value={value}>
      {children}
    </DesignerContext.Provider>
  );
};

export const useDesignerContext = () => {
  const context = useContext(DesignerContext);
  if (context === undefined) {
    throw new Error('useDesignerContext must be used within a DesignerProvider');
  }
  return context;
};

export default DesignerContext;
