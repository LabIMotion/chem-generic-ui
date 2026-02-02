import React, { createContext, useContext } from 'react';

const GenInterfaceContext = createContext();

export const GenInterfaceProvider = ({ children, value }) => {
  return (
    <GenInterfaceContext.Provider value={value}>
      {children}
    </GenInterfaceContext.Provider>
  );
};

export const useGenInterfaceContext = () => {
  const context = useContext(GenInterfaceContext);
  if (context === undefined) {
    return { refSource: {} };
  }
  return context;
};

export default GenInterfaceContext;
