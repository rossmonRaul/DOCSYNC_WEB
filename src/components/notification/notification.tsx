import { useEffect, useRef, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import "../../css/notificacions.css";
import { useWorker } from "../../context/workerContext";
import { obtenerFechaConHora } from "../../utils/utils";

const Notification: React.FC = () => {
  const notificationRef = useRef<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { loading, result, error, taskTitle } = useWorker();

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClickOutside = (event: any) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      if (result || error) {
        setNotifications([
          ...notifications,
          {
            result,
            fecha: new Date().toLocaleDateString(),
            error,
          },
        ]);
      }
    }
  }, [result, error]);

  const eliminarNotificacion = (index: Number) => {
    setNotifications((prevArreglo) =>
      prevArreglo.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="notifications" ref={notificationRef}>
      <FaRegBell
        size={30}
        className="bell-icon"
        style={{ margin: 15 }}
        onClick={toggleNotifications}
      />{" "}
      {notifications.length > 0 && (
        <span className="notification-count">{notifications.length}</span>
      )}
      {/* Icono de notificaciones */}
      {/* Mostrar las notificaciones si showNotifications es true */}
      {showNotifications && notifications.length >= 0 && (
        <div className="notification-list">
          <h3>Notificaciones:</h3>
          {notifications.length <= 0 && (
            <p style={{ color: "#000", margin: 10, marginLeft: 15 }}>
              Aún no hay notificaciones que mostrar.
            </p>
          )}
          <ul>
            {notifications.map((notification, index) => (
              <li
                style={{ color: notification.error ? "red" : "green" }}
                key={index}
                className="notification-item"
              >
                <div className="notification-content">
                  <p className="notification-small-text">
                    {notification.fecha}
                  </p>
                  <br />
                  <strong>
                    {notification.error
                      ? notification.error
                      : notification.result}
                  </strong>
                  <br />
                </div>
                <button
                  className="close-button"
                  onClick={(e) => {
                    e.preventDefault();
                    eliminarNotificacion(index);
                  }}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notification;
