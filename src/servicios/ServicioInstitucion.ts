import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Institucion";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ObtenerInstitucion = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerInstitucion`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarInstitucion = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ActualizarInstitucion`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearInstitucion = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/CrearInstitucion`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarInstitucion = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/EliminarInstitucion`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const ImportarInstitucion = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ImportarInstitucion`;
  return await ProcesarDatosApi("POST", url, data);
};
