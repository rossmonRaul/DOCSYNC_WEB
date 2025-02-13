import React, { createContext, useContext, useState, useEffect } from "react";

type WorkerContextType = {
  result: any;
  error: any;
  loading: boolean;
  startWorker: (workerFunction: Function, input: any) => void;
  isWorkerActive: boolean;
  setNotWorking: () => void;
  setTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  taskTitle: string;
};

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isWorkerActive, setIsWorkerActive] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string | any>(
    "Ejecución de proceso"
  );

  const setNotWorking = () => {
    setIsWorkerActive(false);
  };

  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (loading) {
      event.preventDefault();
      return (event.returnValue = "Are you sure you want to exit?");
    }
  };

  const startWorker = (workerFunction: Function, input: any) => {
    setIsWorkerActive(true);
    setLoading(true);
    const code = workerFunction.toString();
    const blob = new Blob([`(${code})()`], { type: "application/javascript" });
    const workerScriptUrl = URL.createObjectURL(blob);
    const newWorker = new Worker(workerScriptUrl);

    newWorker.postMessage(input);
    setWorker(newWorker);

    newWorker.onmessage = (e) => {
      if (e.data.type === "Error" || e.data.type === "ErrorConexionServidor") {
        setError(e.data.result);
        if (e.data.type === "ErrorConexionServidor") {
          //que se salga de la sesión
        }
      } else {
        setError(null);
        setResult(e.data.result);
      }
      setLoading(false);

      // Eliminar el listener 'beforeunload' al completar la tarea
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

    newWorker.onerror = (e) => {
      setError(e.message);
      setLoading(false);
      // Eliminar el listener 'beforeunload' en caso de error
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

    return () => {
      newWorker.terminate();
      URL.revokeObjectURL(workerScriptUrl);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  };

  useEffect(() => {
    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, [worker]);

  return (
    <WorkerContext.Provider
      value={{
        result,
        error,
        loading,
        startWorker,
        isWorkerActive,
        setNotWorking,
        setTaskTitle,
        taskTitle,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
};
