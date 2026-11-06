import { useContext } from 'react';
import { CrewContext } from '../context/CrewContextStore';

export function useCrew() {
  const context = useContext(CrewContext);
  if (!context) throw new Error('useCrew must be used within CrewProvider');
  return context;
}
