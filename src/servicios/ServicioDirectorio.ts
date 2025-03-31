import { ProcesarDatosApi } from "./ApiFetch";
const controlador = "Serie";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 //optener 
export const ObtenerSerie = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerSerie`;
  return await ProcesarDatosApi("GET", url, "");
};
export const ObtenerSubserie = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerSubserie`;
  return await ProcesarDatosApi("GET", url, "");
};
export const ObtenerExpediente = async () => {
  const url = `${API_BASE_URL}/${controlador}/ObtenerExpediente`;
  return await ProcesarDatosApi("GET", url, "");
};

export const ActualizarDirectorio = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/ActualizarDirectorio`;
  return await ProcesarDatosApi("PUT", url, data);
};

export const CrearDirectorio = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/CrearDirectorio`;
  return await ProcesarDatosApi("POST", url, data);
};

export const EliminarDirectorio = async (data: any) => {
  const url = `${API_BASE_URL}/${controlador}/EliminarDirectorio`;
  return await ProcesarDatosApi("PUT", url, data);
};

// export const ImportarSeries = async (data: any) => {
//   const url = `${API_BASE_URL}/${controlador}/ImportarSeries`;
//   return await ProcesarDatosApi("POST", url, data);
// };
