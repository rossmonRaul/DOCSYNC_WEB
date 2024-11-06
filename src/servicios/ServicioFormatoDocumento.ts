import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "FormatoDocumento";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerFormatoDocumento = async () => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerFormatoDocumento`;
    return await ProcesarDatosApi('GET', url, '');
}