import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Documento";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const CrearDocumento= async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/CrearDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}