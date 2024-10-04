import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Documento";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL_CARGA = import.meta.env.VITE_API_BASE_URL_CARGA;
const API_BASE_URL_DESCARGA = import.meta.env.VITE_API_BASE_URL_DESCARGA;

export const ObtenerDocumentosPorContenido= async (data: any) => {
    const url = `${API_BASE_URL_DESCARGA}/${controlador}/ObtenerDocumentosPorContenido`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerDocumento= async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}