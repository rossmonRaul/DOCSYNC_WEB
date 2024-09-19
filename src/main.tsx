import React from "react";
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
import { Roles } from "./models";
import { PrivateRoutes, PublicRoutes } from "./models/routes";
import { Provider } from "react-redux";
import RolGuard from "./guards/RolGuard.tsx";
import CargarArchivos from "./pages/private/CargarArchivos/CargarArchivos.tsx";
import CargaScanner from "./pages/private/CargaScanner/CargaScanner.tsx";
import BuscarArchivos from "./pages/private/BuscarArchivos/BuscarArchivos.tsx";
import { Private } from "./pages/private/index.tsx";
import CatalogoPersonas from "./pages/private/CatalogoPersonas/CatalogoPersonas.tsx";
import AuthGuard from "./guards/AuthGuard.tsx";
import Login from "./pages/LoginPage.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Ruta por defecto redirige a la ruta privada */}
      <Route path="/" element={<Navigate to={PrivateRoutes.PRIVATE} />} />
      {/* Ruta pública para el inicio de sesión */}
      <Route path={PublicRoutes.LOGIN} element={<Login />} />

      {/* Ruta con guardia de autenticación */}
      <Route element={<AuthGuard privateValidation={true} />}>
        {/* Rutas privada */}
        <Route path={`${PrivateRoutes.PRIVATE}/*`} element={<Private />} />
      </Route>
      <Route element={<RolGuard rol={Roles.Admin} />}>
        <Route
          path={PrivateRoutes.CARGARARCHIVOS}
          element={<CargarArchivos />}
        />
        <Route path={PrivateRoutes.CARGASCANNER} element={<CargaScanner />} />
        <Route
          path={PrivateRoutes.BUSCARARCHIVOS}
          element={<BuscarArchivos />}
        />
        <Route
          path={PrivateRoutes.CATALOGOPERSONAS}
          element={<CatalogoPersonas />}
        />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={Store}>
    <RouterProvider router={router} />
  </Provider>
);
