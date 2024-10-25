import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import Store from "./redux/Store";
import { PrivateRoutes, PublicRoutes } from "./models/routes";
import { Provider } from "react-redux";
import CargarArchivos from "./pages/private/CargarArchivos/CargarArchivos.tsx";
import CargaScanner from "./pages/private/CargaScanner/CargaScanner.tsx";
import BuscarArchivos from "./pages/private/BuscarArchivos/BuscarArchivos.tsx";
import { Private } from "./pages/private/index.tsx";
import CatalogoPersonas from "./pages/private/Catalogos/CatalogoPersonas.tsx";
import AuthGuard from "./guards/AuthGuard.tsx";
import Login from "./pages/LoginPage.tsx";
import CatalogoEstados from "./pages/private/Catalogos/CatalogoEstados.tsx";
import { WorkerProvider } from "./context/workerContext.tsx";
import { SpinnerProvider } from "./context/spinnerContext";
import CatalogoTiposDocumentos from "./pages/private/Catalogos/CatalogoTiposDocumentos.tsx";
import CatalogoJerarquiasDocumentos from "./pages/private/Catalogos/CatalogoJerarquiasDocumentos.tsx";
import CatalogoUsuarios from "./pages/private/Catalogos/CatalogoUsuarios.tsx";
import AdministrarRoles from "./pages/private/AdministrarRoles/AdministrarRoles.tsx";
import CatalogoDepartamentos from "./pages/private/Catalogos/CatalogoDepartamentos.tsx";
import CatalogoPuestos from "./pages/private/Catalogos/CatalogoPuestos.tsx";
import Historial from "./pages/private/Historial/Historial.tsx";
import CatalogoCriterioBusqueda from "./pages/private/Catalogos/CatalogoCriterioBusqueda.tsx";
import BuscarArchivosSolicitud from "./pages/private/BuscarArchivosSolicitud/BuscarArchivosSolicitud.tsx";
import { ConfirmProvider } from "./context/confirmContext.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Ruta por defecto redirige a la ruta privada */}
      <Route path="/" element={<Navigate to={PrivateRoutes.PRIVATE} />} />
      {/* Ruta pública para el inicio de sesión */}
      <Route path={PublicRoutes.LOGIN} element={<Login />} />
      <Route
        path={PublicRoutes.BUSCARARCHIVOSSOLICITUD}
        element={<BuscarArchivosSolicitud />}
      />

      {/* Ruta con guardia de autenticación */}
      <Route element={<AuthGuard privateValidation={true} />}>
        {/* Rutas privada */}
        <Route path={`${PrivateRoutes.PRIVATE}/*`} element={<Private />} />

        {/* <Route element={<RolGuard rol={Roles.SuperAdmin} />}> */}
        <Route
          path={PrivateRoutes.CARGARARCHIVOS}
          element={<CargarArchivos />}
        />
        <Route path={PrivateRoutes.CARGASCANNER} element={<CargaScanner />} />
        <Route
          path={PrivateRoutes.BUSCARARCHIVOS}
          element={<BuscarArchivos />}
        />
        <Route path={PrivateRoutes.HISTORIALARCHIVOS} element={<Historial />} />
        <Route
          path={PrivateRoutes.CATALOGOPERSONAS}
          element={<CatalogoPersonas />}
        />
        <Route
          path={PrivateRoutes.CATALOGOESTADOS}
          element={<CatalogoEstados />}
        />
        <Route
          path={PrivateRoutes.CATALOGOTIPOSDOCUMENTOS}
          element={<CatalogoTiposDocumentos />}
        />
        <Route
          path={PrivateRoutes.CATALOGOJERARQUIADOCUMENTOS}
          element={<CatalogoJerarquiasDocumentos />}
        />
        <Route
          path={PrivateRoutes.CATALOGOUSUARIOS}
          element={<CatalogoUsuarios />}
        />
        <Route path={PrivateRoutes.ADMINROLES} element={<AdministrarRoles />} />
        <Route
          path={PrivateRoutes.CATALOGODEPARTAMENTOS}
          element={<CatalogoDepartamentos />}
        />
        <Route
          path={PrivateRoutes.CATALOGODEPUESTOS}
          element={<CatalogoPuestos />}
        />
        <Route
          path={PrivateRoutes.CATALOGOCRITERIOBUSQUEDA}
          element={<CatalogoCriterioBusqueda />}
        />
      </Route>
      {/* </Route> */}
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={Store}>
    <WorkerProvider>
      <SpinnerProvider>
        <ConfirmProvider>
          <RouterProvider router={router} />
        </ConfirmProvider>
      </SpinnerProvider>
    </WorkerProvider>
  </Provider>
);
