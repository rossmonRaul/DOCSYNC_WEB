import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";

export const ObtenerUsuariosAdministradores = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuariosPorRol2`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerUsuariosSinAsignar = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuariosPorRol4`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerUsuariosAsignados = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuariosPorRol3`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosPorEmpresa = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuariosPorIdEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosAsignadosPorIdentificacion = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuariosAsignadosPorIdentificacion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosPorFinca = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuariosPorRol3`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/GuardarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarUsuarioAdministrador = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/GuardarUsuarioPorSuperUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ValidarUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ValidarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarUsuarioAdministrador = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarUsuarioAdministrador`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ActualizarAsignarUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarDatosUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
} 


export const AsignarFincaParcelaUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarDatosUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}


export const AsignarEmpresaFincaParcelaUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/AsignarEmpresaFincaYParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/CambiarEstadoUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarEstadoUsuarioFincaParcela = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/CambiarEstadoUsuarioFincaParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const EditarFincaParsela = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/AsignarFincaParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const AsignarNuevaFincaParsela = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/AsignarNuevaFincaParcela`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarContrasenaUsuarios = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarContrasenaUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerFincasUbicacionPorIdEmpresa = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerFincasUbicacionPorIdEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuarios = async () => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('POST', url, null);
}

export const ObtenerRoles = async () => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerRoles`;
    return await ProcesarDatosApi('POST', url, null);
}

export const AgregarUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/AgregarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const EliminarUsuario = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/EliminarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerCategoriaMenu = async () => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerCategoriaMenu`;
    return await ProcesarDatosApi('POST', url, null);
}

export const ObtenerOpcionMenu = async () => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerOpcionMenu`;
    return await ProcesarDatosApi('POST', url, null);
}

export const CrearRol = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/CrearRol`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerAccesoMenuPorRol = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerAccesoMenuPorRol`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarRol = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarRol`;
    return await ProcesarDatosApi('POST', url, data);
}
