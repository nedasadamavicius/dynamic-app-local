import { createContext, useContext } from 'react';

export const ManagementModeContext = createContext<{
  isManaging: boolean;
  toggleManaging: () => void;
} | null>(null);

export const useManagementMode = () => {
  const ctx = useContext(ManagementModeContext);
  if (!ctx) throw new Error('ManagementModeContext not provided');
  return ctx;
};