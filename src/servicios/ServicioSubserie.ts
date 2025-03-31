import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Subserie";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerSubseries = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerSubSubseries`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarSubserie = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ActualizarSubserie`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearSubserie = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/CrearSubserie`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarSubserie = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/EliminarSubserie`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const ImportarSubseries = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ImportarSubSubseries`;
  return await ProcesarDatosApi("POST", url, data);
};
