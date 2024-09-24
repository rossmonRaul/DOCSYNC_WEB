import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Estado";

export const ObtenerEstados = async () => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ObtenerEstados`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarEstado = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/ActualizarEstado`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const CrearEstado = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/CrearEstado`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarEstado = async (data: any) => {
    const url = `https://localhost:44342/api/v1.0/${controlador}/EliminarEstado`;
    return await ProcesarDatosApi('PUT', url, data);
}