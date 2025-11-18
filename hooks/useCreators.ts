
import { useContext } from 'react';
import { CreatorsContext } from '../context/CreatorsContext';

export const useCreators = () => {
  const context = useContext(CreatorsContext);
  if (!context) {
    throw new Error('useCreators must be used within a CreatorsProvider');
  }
  return context;
};
