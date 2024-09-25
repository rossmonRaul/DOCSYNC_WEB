import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "TipoDocumento";

export const ObtenerTiposDocumentos = async () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerTiposDocumentos`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarTipoDocumento = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarTipoDocumento`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const CrearTipoDocumento = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/CrearTipoDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarTipoDocumento = async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/EliminarTipoDocumento`;
    return await ProcesarDatosApi('PUT', url, data);
}