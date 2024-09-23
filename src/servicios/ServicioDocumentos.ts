import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Documento";

export const CrearDocumento= async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}