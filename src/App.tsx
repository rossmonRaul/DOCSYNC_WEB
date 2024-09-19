import { Outlet } from "react-router-dom";
import "./App.css";
import NavbarMenu from "./components/navbarMenu/NavBarMenu";
import { AppStore } from "./redux/Store";
import { useSelector } from "react-redux";

// Importar componentes con lazy loading
function App() {
  const userState = useSelector((store: AppStore) => store.user);
  return (
    <>
      {userState.identificacion && <NavbarMenu />}
      <Outlet />
    </>
  );
}

export default App;
