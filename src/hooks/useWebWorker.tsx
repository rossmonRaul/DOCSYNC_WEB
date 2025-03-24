import { useState, useCallback, useEffect } from "react";

type WorkerFunction = () => void;


const useWebWorker = (workerFunction: WorkerFunction, inputData: any) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const memoizedWorkerFunction = useCallback(workerFunction, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const code = memoizedWorkerFunction.toString();
      const blob = new Blob([`(${code})()`], {
        type: "application/javascript",
      });

      const workerScriptUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerScriptUrl);

      worker.postMessage(inputData);

      worker.onmessage = (e) => {
        setResult(e.data);
        setLoading(false);
      };

      worker.onerror = (e) => {
        setError(e.message);
        setLoading(false);
      };

      return () => {
        worker.terminate();
        URL.revokeObjectURL(workerScriptUrl);
      };
    } catch (e: any) {
      setError(e.message);
    }
  }, [inputData, memoizedWorkerFunction]);

  return { result, error, loading };
};

export default useWebWorker;
