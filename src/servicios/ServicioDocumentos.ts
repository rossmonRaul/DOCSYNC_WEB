import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Documento";

export const CrearDocumento= async (data: any) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/CrearDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}