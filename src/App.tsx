import { Outlet } from "react-router-dom";
import "./App.css";
import NavbarMenu from "./components/navbarMenu/NavbarMenu";
import { AppStore } from "./redux/Store";
import { useSelector } from "react-redux";
import WorkerStatus from "./components/workerStatus/worketStatus";

// Importar componentes con lazy loading
function App() {
  const userState = useSelector((store: AppStore) => store.user);
  return (
    <>
      {userState.identificacion && <NavbarMenu />}
      <Outlet />
      <WorkerStatus/>
    </>
  );
}

export default App;
