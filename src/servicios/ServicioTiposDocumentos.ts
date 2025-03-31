import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "TipoDocumento";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerTiposDocumentos = async () => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerTiposDocumentos`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarTipoDocumento = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ActualizarTipoDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}
  
export const CrearTipoDocumento = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/CrearTipoDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarTipoDocumento = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/EliminarTipoDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ImportarTiposDocumentos = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ImportarTiposDocumentos`;
    return await ProcesarDatosApi("POST", url, data);
  };