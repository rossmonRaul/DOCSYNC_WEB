import { useNavigate } from "react-router-dom";
import { UserKey, resetUser } from "../../redux/state/User";
import { clearSessionStorage } from "../../utilities";
import { PublicRoutes } from "../../models/routes";
import { useDispatch } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useConfirm } from "../../context/confirmContext";

/**
 * Componente funcional para cerrar sesión de usuario.
 */
function Logout() {
  const navigate = useNavigate(); // Hook de react-router-dom para la navegación
  const dispatch = useDispatch(); // Hook de react-redux para despachar acciones
  const { openConfirm } = useConfirm();
  /**
   * Función para manejar el evento de cierre de sesión.
   * Muestra un mensaje de confirmación antes de cerrar la sesión.
   */
  const logOut = () => {
    openConfirm("¿Está seguro que desea cerrar la sesión?", () => {
      clearSessionStorage(UserKey);
      dispatch(resetUser());
      navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
    });
  };

  return (
    <button
      style={{
        color: "white",
        backgroundColor: "#9E0000"

      }}
      className="btn-cerrar-sesion"
      onClick={logOut}
    >
      <IoLogOut size={25} style={{ marginRight: "4%" }} /> Cerrar sesión
    </button>
  );
}

export default Logout;
