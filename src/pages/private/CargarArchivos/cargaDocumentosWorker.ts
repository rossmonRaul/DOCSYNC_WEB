export const cargarDocumentosWorker = () => {
  const enviarPeticion = async (
    url: any,
    token: any,
    datosEnvio: any,
    headersData: any = {}
  ) => {
    const respuesta: any = {
      estado: 0,
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...headersData,
          Authorization: `Bearer ${token}`,
        },
        body: headersData["Content-type"]
          ? JSON.stringify(datosEnvio)
          : datosEnvio,
      });

      if (!response.ok) {
        respuesta.estado = -1;
      } else {
        respuesta.data = await response.json();
      }
    } catch (error) {
      respuesta.estado = -1;
      respuesta.error =
        "Ocurrió un error al realizar la petición. Contacte con un administrador.";

      console.error(error);
    }

    return respuesta;
  };

  onmessage = async (e) => {
    const { docs, urlCarga, urlMetadata, urlReversion, storedToken } = e.data;
    const metadatosDocsEnviar = docs.map((a: any) => ({
      ...a,
      archivo: null,
    }));

    const formData = new FormData();

    let respuestaServidor = 0;
    // primero carga de metadatos

    try {
      const { estado: estadoMetadatos, data: dataMetadatos } =
        await enviarPeticion(urlMetadata, storedToken, metadatosDocsEnviar, {
          "Content-type": "application/json;charset=UTF-8",
          Accept: "application/json",
        });

      if (estadoMetadatos !== 0) {
        respuestaServidor = -1;
      }

      if (dataMetadatos.indicador === 1) {
        respuestaServidor = -1;
      }

      //si pudo insertar las metadata bien entonces ingresa los archivos como tal
      if (respuestaServidor === 0) {
        const obtenerArchivoPorNombre = (nombre: any) => {
          return docs.find((item: any) => item.nombre === nombre).archivo;
        };
        const docsInsertados = dataMetadatos.datos.archivosCargados;
        //preparar datos para la peticion a mongo, mandar el id del doc junto con el doc
        docsInsertados.forEach((a: any, index: number) => {
          // Agrega el archivo al FormData
          formData.append(
            `entityDocumento[${index}].IdDocumento`,
            a.idDocumento
          );
          formData.append(
            `entityDocumento[${index}].Archivo`,
            obtenerArchivoPorNombre(a.nombre)
          );
        });

        const { estado: estadoArchivos, data: dataArchivos } =
          await enviarPeticion(urlCarga, storedToken, formData, {
            Accept: "application/json",
          });

        if (estadoArchivos !== 0) {
          //realizar rollback en BD metadata si el servicio de mongo no esta disponible

          const responseRollback = await enviarPeticion(
            urlReversion,
            storedToken,
            docsInsertados,
            {
              "Content-type": "application/json;charset=UTF-8",
              Accept: "application/json",
            }
          );
          console.log(responseRollback);

          postMessage({
            type: "Error",
            message:
              "Error. No se ha podido establecer conexión con el servidor.",
          });
        } else {
          //si hay error en algunos archivos entonces hace rollback pero solo los que no pudieron subirse.
          if (
            estadoArchivos === 0 &&
            dataArchivos.indicador === 0 &&
            dataArchivos.datos.archivosNoCargados &&
            dataArchivos.datos.archivosNoCargados.length > 0
          ) {
            const responseRollback = await enviarPeticion(
              urlReversion,
              storedToken,
              dataArchivos.datos.archivosNoCargados,
              {
                "Content-type": "application/json;charset=UTF-8",
                Accept: "application/json",
              }
            );
            console.log(responseRollback);
            postMessage({ type: "Error", result: dataArchivos.mensaje });
          } else {
            postMessage({ type: "Success", result: dataArchivos.mensaje });
          }
        }
      } else {
        postMessage({
          type: "Error",
          message:
            "Ocurrió un error en el servidor. Contacte con un administrador.",
        });
      }
    } catch (error) {
      postMessage({
        type: "Error",
        message:
          "Ocurrió un error al realizar la petición. Contacte con un administrador.",
      });
      console.error(error);
    }
  };
};
