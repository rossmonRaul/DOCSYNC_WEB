export const recortarTexto = (texto: string, maxLargo: number = 30) => {
  if (texto?.length > maxLargo) {
    return texto.substring(0, maxLargo) + "...";
  }
  return texto;
};
