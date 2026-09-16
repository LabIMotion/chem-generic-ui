import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const GenUIContext = createContext();

export function GenUIProvider({
  children,
  initialShowOverview = true,
  initialShowConsumer = false,
}) {
  const [showOverview, setShowOverview] = useState(initialShowOverview);
  const [showConsumer, setShowConsumer] = useState(initialShowConsumer);

  const toggleOverview = () => setShowOverview((prev) => !prev);
  const toggleConsumer = () => setShowConsumer((prev) => !prev);

  const value = {
    showOverview,
    setShowOverview,
    toggleOverview,
    showConsumer,
    setShowConsumer,
    toggleConsumer,
    isProviderPresent: true,
  };

  return (
    <GenUIContext.Provider value={value}>{children}</GenUIContext.Provider>
  );
}

GenUIProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialShowOverview: PropTypes.bool,
  initialShowConsumer: PropTypes.bool,
};

export const useGenUIContext = () => {
  const context = useContext(GenUIContext);
  // Fallback to default values if not wrapped in Provider to ensure stability
  if (!context) {
    return {
      showOverview: false,
      setShowOverview: () =>
        console.warn('useGenUIContext must be used within a GenUIProvider'),
      toggleOverview: () =>
        console.warn('useGenUIContext must be used within a GenUIProvider'),
      showConsumer: false,
      setShowConsumer: () =>
        console.warn('useGenUIContext must be used within a GenUIProvider'),
      toggleConsumer: () =>
        console.warn('useGenUIContext must be used within a GenUIProvider'),
      isProviderPresent: false,
    };
  }
  return context;
};

export default GenUIContext;
