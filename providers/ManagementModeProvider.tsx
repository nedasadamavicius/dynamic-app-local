import React, { useState } from 'react';
import { ManagementModeContext } from '@/contexts/ManagementModeContext';

export const ManagementModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isManaging, setIsManaging] = useState(false);
  const toggleManaging = () => setIsManaging((prev) => !prev);

  return (
    <ManagementModeContext.Provider value={{ isManaging, toggleManaging, setManaging: setIsManaging }}>
      {children}
    </ManagementModeContext.Provider>
  );
};