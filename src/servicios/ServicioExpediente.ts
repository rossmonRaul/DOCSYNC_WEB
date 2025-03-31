import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Expediente";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerExpedientes = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerSubExpedientes`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarExpediente = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ActualizarExpediente`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearExpediente = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/CrearExpediente`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarExpediente = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/EliminarExpediente`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const ImportarExpedientes = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ImportarSubExpedientes`;
  return await ProcesarDatosApi("POST", url, data);
};
