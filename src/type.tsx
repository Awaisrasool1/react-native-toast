export type ToastType = 'success' | 'error' | 'warning';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  message: string;
  type: ToastType;
  position: ToastPosition;
  duration: number; 
  onHide?: () => void;
}