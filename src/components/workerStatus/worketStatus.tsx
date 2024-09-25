// WorkerStatus.tsx
import { useState, useEffect } from "react";
import { useWorker } from "../../context/workerContext";
import "../../css/workerStatus.css";
import { FaEye } from "react-icons/fa";

const WorkerStatus: React.FC<any> = ({
  textoListo = "Listo!",
  textoCargando = "Cargando...",
}) => {
  const {
    loading,
    result,
    error,
    setNotWorking,
    isWorkerActive,
    taskTitle,
    setTaskTitle,
  } = useWorker();
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
              <h3>{taskTitle}</h3>
              <div className="d-flex">
                <button className="toggle-btn" onClick={handleMinimize}>
                  {isMinimized && !loading
                    ? textoListo
                    : isMinimized
                    ? "Abrir"
                    : "---"}
                </button>

                {!loading && (
                  <button className="close-btn" onClick={handleClose}>
                    X
                  </button>
                )}
              </div>
            </div>
          )}

          {!isMinimized && (
            <div className="status-content">
              {loading ? (
                <p className="loading">{textoCargando}</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : result !== null ? (
                <>
                  <p className="result">{result}</p>
                </>
              ) : (
                <p className="ready">{textoListo}</p>
              )}
            </div>
          )}

          <button className="toggle-btn" onClick={handleMinimize}>
            {isMinimized && !loading ? (
              textoListo
            ) : isMinimized ? (
              <FaEye size={25} />
            ) : (
              ""
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default WorkerStatus;
