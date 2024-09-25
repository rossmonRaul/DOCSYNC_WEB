import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Estado";

export const ObtenerEstados = async () => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ObtenerEstados`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarEstado = async (data: any) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/ActualizarEstado`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearEstado = async (data: any) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/CrearEstado`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarEstado = async (data: any) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/${controlador}/EliminarEstado`;
  return await ProcesarDatosApi("PUT", url, data);
};
