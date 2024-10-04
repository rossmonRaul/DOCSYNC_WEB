import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Persona";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerPersonas = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerPersonas`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarPersona = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ActualizarPersona`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearPersona = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/CrearPersona`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarPersona = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/EliminarPersona`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const ImportarPersonas = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ImportarPersonas`;
  return await ProcesarDatosApi("POST", url, data);
};
