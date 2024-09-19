import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Persona";

export const ObtenerPersonas = async () => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ObtenerPersonas`;
    return await ProcesarDatosApi('GET', url, '');
}

export const ActualizarPersona = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/ActualizarPersona`;
    return await ProcesarDatosApi('PUT', url, data);
}
  
export const CrearPersona = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/CrearPersona`;
    return await ProcesarDatosApi('POST', url, data);
}
 
export const EliminarPersona = async (data: any) => {
    const url = `http://localhost:5271/api/v1.0/${controlador}/EliminarPersona`;
    return await ProcesarDatosApi('PUT', url, data);
}