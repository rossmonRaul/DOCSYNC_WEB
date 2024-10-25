import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "JerarquiaDocumento";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerJerarquiasDoc = async () => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerJerarquiasDoc`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarJerarquiaDoc = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ActualizarJerarquiaDoc`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const CrearJerarquiaDoc = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/CrearJerarquiaDoc`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarJerarquiaDoc = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/EliminarJerarquiaDoc`;
    return await ProcesarDatosApi('PUT', url, data);
}

export const ImportarJerarquiasDoc = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ImportarJerarquiasDoc`;
    return await ProcesarDatosApi("POST", url, data);
  };