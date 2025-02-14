import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Trabajos";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ValidarTrabajosProceso = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ValidarTrabajosProceso`;
    return await ProcesarDatosApi('POST', url, data);
}

export const LimpiarTrabajos = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/LimpiarTrabajos`;
    return await ProcesarDatosApi('POST', url, data);
}