import React, { createContext, useContext, useState, useEffect } from "react";

type WorkerContextType = {
  result: any;
  error: any;
  loading: boolean;
  startWorker: (workerFunction: Function, input: any) => void;
  isWorkerActive: boolean;
  setNotWorking: () => void;
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

  const setNotWorking = () => {
    setIsWorkerActive(false);
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
      setResult(e.data.result);
      setLoading(false);
    };

    newWorker.onerror = (e) => {
      setError(e.message);
      setLoading(false);
    };

    return () => {
      newWorker.terminate();
      URL.revokeObjectURL(workerScriptUrl);
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
