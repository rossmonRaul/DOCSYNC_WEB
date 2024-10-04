import React, { createContext, useState, useContext } from "react";

// Define la interfaz para el contexto del spinner
interface SpinnerContextProps {
  showSpinner: boolean;
  setShowSpinner: (show: boolean) => void;
}

// Crea el contexto
const SpinnerContext = createContext<SpinnerContextProps | undefined>(undefined);

// Crea un proveedor para el contexto
export const SpinnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <SpinnerContext.Provider value={{ showSpinner, setShowSpinner }}>
      {children}
    </SpinnerContext.Provider>
  );
};

// Hook para usar el contexto
export const useSpinner = () => {
  const context = useContext(SpinnerContext);
  if (!context) {
    throw new Error("useSpinner debe ser usado dentro de un SpinnerProvider");
  }
  return context;
};
