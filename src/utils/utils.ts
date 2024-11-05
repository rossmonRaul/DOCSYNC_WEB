export const recortarTexto = (texto: string = "", maxLargo: number = 30) => {
  if (texto?.length > maxLargo) {
    return texto.substring(0, maxLargo) + "...";
  }
  return texto;
};
export const obtenerFechaConHora = () => {
  const fecha = new Date();

  let dia = String(fecha.getDate()).padStart(2, "0");
  let mes = String(fecha.getMonth() + 1).padStart(2, "0"); // Los meses empiezan en 0
  let anio = fecha.getFullYear();

  let horas = fecha.getHours();
  let minutos = String(fecha.getMinutes()).padStart(2, "0");
  let segundos = String(fecha.getSeconds()).padStart(2, "0");
  let periodo = horas >= 12 ? "PM" : "AM";

  horas = horas % 12 || 12; // Convierte la hora al formato de 12 horas y ajusta la medianoche como 12

  return `${mes}/${dia}/${anio} ${horas}:${minutos}:${segundos} ${periodo}`;
};
