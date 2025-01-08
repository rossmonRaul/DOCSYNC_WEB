import { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmModal from '../components/confirm/confirmModal';

interface ConfirmContextProps {
  openConfirm: (message: string, onConfirm: () => void) => void;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider = ({ children }: ConfirmProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

  const openConfirm = (confirmMessage: string, confirmAction: () => void) => {
    setMessage(confirmMessage);
    setOnConfirm(() => confirmAction);
    setIsVisible(true);
  };

  const handleClose = () => setIsVisible(false);

  return (
    <ConfirmContext.Provider value={{ openConfirm }}>
      {children}
      {isVisible && (
        <ConfirmModal
          show={isVisible}
          message={message}
          onConfirm={() => {
            onConfirm();
            handleClose();
          }}
          onClose={handleClose}
        />
      )}
    </ConfirmContext.Provider>
  );
};
