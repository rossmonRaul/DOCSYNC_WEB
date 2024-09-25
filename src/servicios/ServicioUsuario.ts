import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Usuario";

export const ObtenerUsuariosAdministradores = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuariosPorRol2`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerUsuariosSinAsignar = async () => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuariosPorRol4`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ObtenerUsuariosAsignados = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuariosPorRol3`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosPorEmpresa = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuariosPorIdEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosAsignadosPorIdentificacion = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuariosAsignadosPorIdentificacion`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuariosPorFinca = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuariosPorRol3`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/GuardarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const InsertarUsuarioAdministrador = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/GuardarUsuarioPorSuperUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ValidarUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ValidarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarUsuarioAdministrador = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarUsuarioAdministrador`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ActualizarAsignarUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarDatosUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
} 

export const CambiarEstadoUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/CambiarEstadoUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CambiarContrasenaUsuarios = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarContrasenaUsuario`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ObtenerFincasUbicacionPorIdEmpresa = async (data: any) => {
    //const url = `${controlador}/ObtenerUsuarios`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerFincasUbicacionPorIdEmpresa`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerUsuarios = async () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerUsuarios`;
    return await ProcesarDatosApi('POST', url, null);
}

export const ObtenerRoles = async () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerRoles`;
    return await ProcesarDatosApi('POST', url, null);
}

export const AgregarUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/AgregarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const EliminarUsuario = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/EliminarUsuario`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerCategoriaMenu = async () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerCategoriaMenu`;
    return await ProcesarDatosApi('POST', url, null);
}

export const ObtenerOpcionMenu = async () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerOpcionMenu`;
    return await ProcesarDatosApi('POST', url, null);
}

export const CrearRol = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/CrearRol`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerAccesoMenuPorRol = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerAccesoMenuPorRol`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarRol = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarRol`;
    return await ProcesarDatosApi('POST', url, data);
}
