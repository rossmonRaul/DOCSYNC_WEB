import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Bitacora";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const InsertarRegistroBitacora = async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/InsertarRegistroBitacora`;
    return await ProcesarDatosApi('POST', url, data);
}

export const ObtenerBitacora= async (data: any) => {
    const url = `${API_BASE_URL}/${controlador}/ObtenerBitacora`;
    return await ProcesarDatosApi('POST', url, data);
}
 
