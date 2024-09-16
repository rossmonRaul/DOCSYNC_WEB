import { useSelector } from "react-redux";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Sidebar from "../../../components/sidebar/Sidebar";
import { AppStore } from "../../../redux/Store";
import Topbar from "../../../components/topbar/Topbar";

function Dashboard() {
  const userState = useSelector((store: AppStore) => store.user);

  let dashboardContent: JSX.Element;

  // Determinar qué contenido mostrar según el rol del usuario, aca irian los componentes para cada daschboard (comunidad), sin embargp
  // para dar el ejemplo voy a poner html en su lugar
  switch (userState.idRol) {
    case 1:
      dashboardContent = (
        <div>
          <Sidebar>
            <div className="main-container">
              <BordeSuperior />
            </div>
          </Sidebar>
        </div>
      );
      break;
    case 2:
      dashboardContent = (
        <div>
          <BordeSuperior />
          <Topbar />
          <div className="content"></div>
        </div>
      );
      break;
    case 3:
      dashboardContent = (
        <div>
          <BordeSuperior />
          <Topbar />
          <div className="content"></div>
        </div>
      );
      break;
    case 4:
      dashboardContent = (
        <div>
          <BordeSuperior />
          <Topbar />
          <div className="content"></div>
        </div>
      );
      break;
    default:
      dashboardContent = (
        <div>No se encontró un dashboard para este rol de usuario.</div>
      );
      break;
  }

  return <div>{dashboardContent}</div>;
}
export default Dashboard;
