import React, {createContext, useContext, useState, ReactNode} from 'react';
import { ToastPosition, ToastProps, ToastType } from './src/type';
import Toast from './src/CustomToast';


interface ToastContextProps {
  showToast: (
    message: string,
    type: ToastType,
    position: ToastPosition,
    duration: number,
  ) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [toast, setToast] = useState<Omit<ToastProps, 'onHide'> | null>(null);

  const showToast = (
    message: string,
    type: ToastType,
    position: ToastPosition,
    duration: number,
  ) => {
    setToast({message, type, position, duration});
  };

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      {toast && <Toast {...toast} onHide={hideToast} />}
    </ToastContext.Provider>
  );
};
