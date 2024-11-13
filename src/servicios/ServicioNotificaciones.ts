import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Notificacion";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerNotificaciones = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerNotificaciones`;
    return await ProcesarDatosApi('POST', url, data);
}

export const CrearNotificacion = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/CrearNotificacion`;
    return await ProcesarDatosApi('POST', url, data);
}
  
export const EliminarNotificacion = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/EliminarNotificacion`;
    return await ProcesarDatosApi('POST', url, data);
}
 