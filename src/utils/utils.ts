import iconoBmp from "../assets/img/iconoBmp.png";
import iconoPDF from "../assets/img/iconoPdf.png";
import iconoCSV from "../assets/img/iconoCsv.png";
import iconoDot from "../assets/img/iconoDot.png";
import iconoGif from "../assets/img/iconoGif.png";
import iconoHtml from "../assets/img/iconoHtml.png";
import iconoImagen from "../assets/img/iconoImagen.png";
import iconoOdp from "../assets/img/iconoOdp.png";
import iconoOds from "../assets/img/iconoOds.png";
import iconoOdt from "../assets/img/iconoOdt.png";
import iconoPPT from "../assets/img/iconoPpt.png";
import iconoRtf from "../assets/img/iconoRtf.png";
import iconoSQL from "../assets/img/iconoSql.png";
import iconoTiff from "../assets/img/iconoTiff.png";
import iconoTxt from "../assets/img/iconoTxt.png";
import iconoWebp from "../assets/img/iconoWebp.png";
import iconoWord from "../assets/img/iconoWord.png";
import iconoXls from "../assets/img/iconoXls.png";
import iconoNoDisponible from "../assets/img/VistaNoDisponible.png";

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

const iconMap: { [key: string]: string } = {
  pdf: iconoPDF,
  bmp: iconoBmp,
  csv: iconoCSV,
  doc: iconoWord,
  docx: iconoWord,
  dot: iconoDot,
  gif: iconoGif,
  html: iconoHtml,
  jpg: iconoImagen,
  jpeg: iconoImagen,
  png: iconoImagen,
  svg: iconoImagen,
  odp: iconoOdp,
  ods: iconoOds,
  odt: iconoOdt,
  ppt: iconoPPT,
  pptx: iconoPPT,
  rtf: iconoRtf,
  sql: iconoSQL,
  tiff: iconoTiff,
  txt: iconoTxt,
  webp: iconoWebp,
  xls: iconoXls,
  xlsx: iconoXls,
};

const memoizedIcons: { [key: string]: string } = {};

export const getDocIcon = (extension: string) => {
  const lowerCaseExt = extension.toLowerCase();
  if (memoizedIcons[lowerCaseExt]) {
    return memoizedIcons[lowerCaseExt];
  }
  const icon = iconMap[lowerCaseExt] || iconoNoDisponible;
  memoizedIcons[lowerCaseExt] = icon;
  return icon;
};
