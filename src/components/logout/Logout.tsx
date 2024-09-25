import { useNavigate } from "react-router-dom";
import { UserKey, resetUser } from "../../redux/state/User"
import { clearSessionStorage } from "../../utilities"
import { PublicRoutes } from "../../models/routes";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { IoLogOut } from "react-icons/io5";

/**
 * Componente funcional para cerrar sesión de usuario.
 */
function Logout() {
    const navigate = useNavigate(); // Hook de react-router-dom para la navegación
    const dispatch = useDispatch(); // Hook de react-redux para despachar acciones
    /**
     * Función para manejar el evento de cierre de sesión.
     * Muestra un mensaje de confirmación antes de cerrar la sesión.
     */
    const logOut = () => {
        Swal.fire({
            title: "Cerrar sesión",
            text: "¿Estás seguro de que deseas cerrar la sesión?",
            icon: "warning",
            showCancelButton: true, // Mostrar el botón de cancelar
            confirmButtonText: "Sí", // Texto del botón de confirmación
            cancelButtonText: "No" // Texto del botón de cancelar
        }).then((result) => {
            if (result.isConfirmed) {
                clearSessionStorage(UserKey);
                dispatch(resetUser());
                navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
            }
        });
    };

    return <button 
                style={{
                        color:"white",
                        backgroundColor: 'danger'                       
                    }}
                className="btn-cerrar-sesion"
                onClick={logOut}
            >
                <IoLogOut 
                  size={25}
                  style={{ marginRight: '4%' }}
                />{" "}
                Cerrar sesión
        </button>;
}

export default Logout;