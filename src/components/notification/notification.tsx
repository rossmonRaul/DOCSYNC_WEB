import { useEffect, useRef, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import "../../css/notificacions.css";
import { useWorker } from "../../context/workerContext";
import { useNavigate } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import {
  CrearNotificacion,
  EliminarNotificacion,
  ObtenerNotificaciones,
} from "../../servicios/ServicioNotificaciones";
import { AppStore } from "../../redux/Store";
import { useSelector } from "react-redux";

const Notification: React.FC = () => {
  const notificationRef = useRef<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  const { loading, result, error, taskTitle } = useWorker();

  const [showNotifications, setShowNotifications] = useState(false);
  const userState = useSelector((store: AppStore) => store.user);

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
    obtenerNotificaciones();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const crearNotificacion = async (notificacion: any) => {
    const response = await CrearNotificacion(notificacion);
    if (!response) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error emitir la notificación",
      });
    } else {
      return response.info;
    }
    return -1;
  };

  const obtenerNotificaciones = async () => {
    const response = await ObtenerNotificaciones({
      usuarioCreacion: userState.identificacion,
    });
    if (!response) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error emitir la notificación",
      });
    } else {
      setNotifications(response);
    }
    return -1;
  };

  const eliminarNotificacionServicio = async (id: any) => {
    const response = await EliminarNotificacion({ idNotificacion: id });
    if (!response) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error emitir la notificación",
      });
    }
  };

  useEffect(() => {
    if (!loading) {
      if (result || error) {
        const notificacionObj = {
          idNotificacion: -1,
          descripcion: result || error,
          usuarioCreacion: userState.identificacion,
        };
        crearNotificacion(notificacionObj)
          .then((_: any) => {
            obtenerNotificaciones();
            //notificacionObj.idNotificacion = resp;
            //setNotifications([...notifications, notificacionObj]);
          })
          .catch((error) => {
            console.error("Error al crear notificacion:", error);
          });
      }
    }
  }, [result, error]);

  const eliminarNotificacion = (id: Number) => {
    console.log(id);
    eliminarNotificacionServicio(id);
    setNotifications((prevArreglo) =>
      prevArreglo.filter((obj, _) => obj.idNotificacion !== id)
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
          <div className="notifications-header">
            <h5>Notificaciones</h5>
            <IoEye
              style={{
                cursor: "pointer",
                transition: "color 0.3s ease",
                color: "#fff",
              }}
              onClick={() => {
                navigate("/historial");
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              size={25}
            />
          </div>

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
                    {!isNaN(new Date(notification.fechaCreacion).getTime())
                      ? new Date(notification.fechaCreacion).toLocaleString()
                      : notification.fechaCreacion}
                  </p>
                  <br />
                  <strong>
                    {notification.error ? (
                      notification.error
                    ) : (
                      <a
                        className="notificacion-description"
                        style={{
                          cursor: "pointer",
                          color: "#497494",
                        }}
                        onClick={() => {
                          navigate(
                            `/historial?fecha=${notification.fechaCreacion}`
                          );
                        }}
                      >
                        {notification.descripcion}
                      </a>
                    )}
                  </strong>
                  <br />
                </div>
                <button
                  className="close-button"
                  onClick={(e) => {
                    e.preventDefault();
                    eliminarNotificacion(notification.idNotificacion);
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
