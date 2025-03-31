import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Serie";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerSeries = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerSeries`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarSerie = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ActualizarSerie`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearSerie = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/CrearSerie`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarSerie = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/EliminarSerie`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const ImportarSeries = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ImportarSeries`;
  return await ProcesarDatosApi("POST", url, data);
};
