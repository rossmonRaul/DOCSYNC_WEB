import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "TipoDocumento";

export const ObtenerTiposDocumentos = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerTiposDocumentos`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarTipoDocumento = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarTipoDocumento`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const CrearTipoDocumento = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearTipoDocumento`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarTipoDocumento = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/EliminarTipoDocumento`;
    return await ProcesarDatosApi('PUT', url, data);
}