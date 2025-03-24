import { Outlet } from "react-router-dom";
import "./App.css";
import NavbarMenu from "./components/navbarMenu/NavbarMenu";
import { AppStore } from "./redux/Store";
import { useSelector } from "react-redux";
import WorkerStatus from "./components/workerStatus/worketStatus";
import SpinnerPersonalizado from "./components/spinnerPersonalizado/spinnerPersonalizado";
import { useSpinner } from "./context/spinnerContext"; 

// Importar componentes con lazy loading
function App() {
  const userState = useSelector((store: AppStore) => store.user);
  const { showSpinner } = useSpinner(); // Obtener el estado del spinner

  return (
    <>
      {userState.identificacion && <NavbarMenu />}
      <Outlet />
      <WorkerStatus/>
      <SpinnerPersonalizado show={showSpinner} />
    </>
  );
}

export default App;
