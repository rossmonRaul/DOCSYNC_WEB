import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Puesto";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerPuestos = async () => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerPuestos`;
    return await ProcesarDatosApi('GET', url, null);
}

export const AgregarPuesto = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/AgregarPuesto`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ActualizarPuesto = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ActualizarPuesto`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const EliminarPuesto = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/EliminarPuesto`;
    return await ProcesarDatosApi('PUT', url, data);
}