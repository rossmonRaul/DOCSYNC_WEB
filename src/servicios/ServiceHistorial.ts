import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Historial";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const InsertarRegistroHistorial = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/InsertarRegistroHistorial`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const ObtenerHistorial= async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerHistorial`;
    return await ProcesarDatosApi('POST', url, data);
}