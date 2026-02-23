import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const GenUIContext = createContext();

export const GenUIProvider = ({ children, initialShowOverview = true }) => {
  const [showOverview, setShowOverview] = useState(initialShowOverview);

  const toggleOverview = () => setShowOverview((prev) => !prev);

  const value = {
    showOverview,
    setShowOverview,
    toggleOverview,
    isProviderPresent: true,
  };

  return (
    <GenUIContext.Provider value={value}>
      {children}
    </GenUIContext.Provider>
  );
};

GenUIProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialShowOverview: PropTypes.bool,
};

export const useGenUIContext = () => {
  const context = useContext(GenUIContext);
  // Fallback to default values if not wrapped in Provider to ensure stability
  if (!context) {
    return {
      showOverview: false,
      setShowOverview: () => console.warn('useGenUIContext must be used within a GenUIProvider'),
      toggleOverview: () => console.warn('useGenUIContext must be used within a GenUIProvider'),
      isProviderPresent: false,
    };
  }
  return context;
};

export default GenUIContext;
