import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "JerarquiaDocumento";

export const ObtenerJerarquiasDoc = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerJerarquiasDoc`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarJerarquiaDoc = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarJerarquiaDoc`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const CrearJerarquiaDoc = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearJerarquiaDoc`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarJerarquiaDoc = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/EliminarJerarquiaDoc`;
    return await ProcesarDatosApi('PUT', url, data);
}