import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "CriterioBusqueda";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerCriterioBusqueda = async (data: boolean) => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerCriterioBusqueda`;
    return await ProcesarDatosApi('GET', url, data);
}

export const ObtenerTipoValidacion = async () => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerTipoValidacion`;
    return await ProcesarDatosApi('GET', url, null);
}


export const AgregarCriterioBusqueda = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/AgregarCriterioBusqueda`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarCriterioBusqueda = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ActualizarCriterioBusqueda`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const EliminarCriterioBusqueda = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/EliminarCriterioBusqueda`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const CargaMasivaCriterioBusqueda = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/CargaMasivaCriterioBusqueda`;
    return await ProcesarDatosApi('POST', url, data);
}

export const BusquedaSolicitudIHTT = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/BusquedaSolicitudIHTT`;
    return await ProcesarDatosApi('POST', url, data);
}