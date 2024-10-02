import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Departamento";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerDepartamentos = async () => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerDepartamentos`;
    return await ProcesarDatosApi('GET', url, null);
}

export const AgregarDepartamento = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/AgregarDepartamento`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarDepartamento = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ActualizarDepartamento`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const EliminarDepartamento = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/EliminarDepartamento`;
    return await ProcesarDatosApi('PUT', url, data);
}