export const ProcesarDatosApi = async (
  method: string,
  url: string,
  data: any,
  esArchivo: Boolean = false,
  esFormulario = false
) => {
  const storedToken = localStorage.getItem("token");

  let token;
  if (storedToken) {
    token = storedToken;
  }
  let headers: Record<string, string> = {
    "Content-type": "application/json;charset=UTF-8",
    Accept: "application/json",
  };

  if (esFormulario) {
    headers = {
      Accept: "application/json",
    };
  }
  // Agregar token al encabezado de autorización si está presente
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const myInit: RequestInit = {
    method: method,
    headers: headers,
    mode: "cors",
    cache: "default",
  };

  if (method !== "GET" && data !== undefined) {
    myInit.body = esFormulario ? data : JSON.stringify(data);
  }

  const myRequest = new Request(url, myInit);
  try {
    const response = await fetch(myRequest);
    if (response.ok) {
      if (esArchivo) {
        return await response.blob();
      }
      return await response.json();
    } else {
      return { indicador: 1, mensaje: "Ocurrió un error en el proceso!" };
    }
  } catch (error) {
    console.log(error);
  }
};
