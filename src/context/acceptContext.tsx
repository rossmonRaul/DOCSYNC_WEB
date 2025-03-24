import { createContext, useContext, useState, ReactNode } from 'react';
import AcceptModal from '../components/accept/acceptModal';

interface AcceptContextProps {
  openAccept: (message: string, onAccept: () => void) => void;
}

const AcceptContext = createContext<AcceptContextProps | undefined>(undefined);

export const useAccept = () => {
  const context = useContext(AcceptContext);
  if (!context) {
    throw new Error('useAccept must be used within a AcceptProvider');
  }
  return context;
};

interface AcceptProviderProps {
  children: ReactNode;
}

export const AcceptProvider = ({ children }: AcceptProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [onAccept, setOnAccept] = useState<() => void>(() => {});

  const openAccept = (AcceptMessage: string, AcceptAction: () => void) => {
    setMessage(AcceptMessage);
    setOnAccept(() => AcceptAction);
    setIsVisible(true);
  };

  const handleClose = () => setIsVisible(false);

  return (
    <AcceptContext.Provider value={{ openAccept }}>
      {children}
      {isVisible && (
        <AcceptModal
          show={isVisible}
          message={message}
          onConfirm={() => {
            onAccept();
            handleClose();
          }}
          onClose={handleClose}
        />
      )}
    </AcceptContext.Provider>
  );
};
