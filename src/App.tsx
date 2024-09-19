import './App.css'
import { BrowserRouter, Navigate, Route } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from './models/routes';
import { AuthGuard, RolGuard } from './guards';
import { RoutesWithNotFound } from './utilities';
import { Suspense, lazy } from 'react';
import { Provider } from 'react-redux';
import Store from './redux/Store';
import { Roles } from './models';
import { Dashboard } from './pages/private';
import { Spinner } from 'reactstrap';
import CargarArchivos from './pages/private/CargarArchivos/CargarArchivos';
import CatalogoPersonas from './pages/private/CatalogoPersonas/CatalogoPersonas';
import CargaScanner from './pages/private/CargaScanner/CargaScanner';
import BuscarArchivos from './pages/private/BuscarArchivos/BuscarArchivos';

// Importar componentes con lazy loading
const Login = lazy(() => import('./pages/LoginPage'));
const Private = lazy(() => import('./pages/private/Private'));
const AdministrarEmpresas = lazy(() => import('./pages/private/AdministrarEmpresas/AdministrarEmpresas'))
const AdministrarFincas = lazy(() => import('./pages/private/AdministrarFincas/AdministrarFincas'))
function App() {
  return (
    // Suspense para manejar la carga de componentes lazy
    <Suspense fallback={<Spinner color="success">Cargando...</Spinner>}>
      {/* Proveedor del store de Redux */}
      <Provider store={Store}>
        {/* Enrutador principal */}
        <BrowserRouter>
          {/* Rutas con NotFound handling */}
          <RoutesWithNotFound>
            {/* Ruta por defecto redirige a la ruta privada */}
            <Route path="/" element={<Navigate to={PrivateRoutes.PRIVATE} />} />
            {/* Ruta pública para el inicio de sesión */}
            <Route path={PublicRoutes.LOGIN} element={<Login />} />

            {/* Ruta con guardia de autenticación */}
            <Route element={<AuthGuard privateValidation={true} />}>
              {/* Rutas privada */}
              <Route path={`${PrivateRoutes.PRIVATE}/*`} element={<Private />} />
            </Route>

            {/* Rutas accesibles solo para el rol de SuperAdmin */}
            <Route element={<RolGuard rol={Roles.SuperAdmin} />}>
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
              {/* donde se crean los administradores */}
            </Route>

            {/* Rutas accesibles solo para el rol de Admin */}
            <Route element={<RolGuard rol={Roles.Admin} />}>
              <Route path={PrivateRoutes.CARGARARCHIVOS} element={<CargarArchivos />} />
              <Route path={PrivateRoutes.CARGASCANNER} element={<CargaScanner />} />
              <Route path={PrivateRoutes.BUSCARARCHIVOS} element={<BuscarArchivos />} />
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
              <Route path={PrivateRoutes.ADMINISTRARFINCAS} element={<AdministrarFincas />} />
              <Route path={PrivateRoutes.ADMINISTRAREMPRESAS} element={<AdministrarEmpresas />} />
              <Route path={PrivateRoutes.CATALOGOPERSONAS} element={<CatalogoPersonas />} />
            </Route>
            {/* Rutas accesibles solo para el rol de usuario asignado */}
            <Route element={<RolGuard rol={Roles.UsuarioAsignado} />}>
              <Route path={PrivateRoutes.DASHBOARD} element={<Dashboard />} />
             
            </Route>
          </RoutesWithNotFound>
        </BrowserRouter>
      </Provider>
    </Suspense>
  );
}

export default App;

