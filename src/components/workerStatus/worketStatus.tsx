// WorkerStatus.tsx
import { useState, useEffect } from "react";
import { useWorker } from "../../context/workerContext";
import "../../css/workerStatus.css";

const WorkerStatus: React.FC<any> = ({
  titulo = "Ejecución de proceso",
  textoListo = "Listo!",
  textoCargando = "Cargando...",
}) => {
  const { loading, result, error, setNotWorking, isWorkerActive } = useWorker();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    setNotWorking();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    if (loading) {
      setIsVisible(true);
    }
  }, [loading]);

  if (!isVisible) {
    return null; // No renderiza nada si se ha cerrado
  }

  return (
    <>
      {isWorkerActive && (
        <div
          className={`worker-status ${isMinimized ? "minimized" : ""} ${
            !loading && !error ? "ready" : !loading && error ? "error" : ""
          }`}
        >
          {!isMinimized && (
            <div className="status-header">
              <h3>{titulo}</h3>
              <h4></h4>
              {!loading && (
                <button className="close-btn" onClick={handleClose}>
                  X
                </button>
              )}
            </div>
          )}

          {!isMinimized && (
            <div className="status-content">
              {loading ? (
                <p className="loading">{textoCargando}</p>
              ) : error ? (
                <p className="error">Error: {error}</p>
              ) : result !== null ? (
                <p className="result">Result: {result}</p>
              ) : (
                <p className="ready">{textoListo}</p>
              )}
            </div>
          )}

          <button className="toggle-btn" onClick={handleMinimize}>
            {isMinimized && !loading
              ? textoListo
              : isMinimized
              ? "Abrir"
              : "Ocultar"}
          </button>
        </div>
      )}
    </>
  );
};

export default WorkerStatus;
