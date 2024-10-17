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
        console.error(response);
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
    const { docs, urlCarga, urlMetadata, urlReversion, storedToken, urlHistorial} = e.data;
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

      if (!dataMetadatos || dataMetadatos.indicador === 1) {
        respuestaServidor = -1;
      }

      //si pudo insertar las metadata bien entonces ingresa los archivos como tal
      if (respuestaServidor === 0) {
        const obtenerArchivoPorNombre = (nombre: any) => {
          return docs.find((item: any) => item.nomDocumento === nombre).archivo;
        };

        const docsInsertados = dataMetadatos.datos.archivosCargados;
        console.log(docsInsertados)
        //preparar datos para la peticion a mongo, mandar el id del doc junto con el doc
        docsInsertados.forEach((a: any, index: number) => {
          // Agrega el archivo al FormData
          formData.append(
            `entityDocumento[${index}].IdDocumento`,
            a.idDocumento
          );
          formData.append(
            `entityDocumento[${index}].Archivo`,
            obtenerArchivoPorNombre(a.nomDocumento)
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
          console.log(docsInsertados);

          //Guarda en historial de errores (no se hace mediante el rollback para guardar la excepcion)
           const responseHistorial = await procesarArchivosYEnviarHistorial(
            docsInsertados,
            urlHistorial,
            storedToken,
            "Error al carga archivo.",
            "No se ha podido establecer conexión con el servidor de carga."// dataArchivos.detalleExcepcion
          );
          console.log(responseHistorial.mensaje);
           //

          postMessage({
            type: "Error",
            result:
              "Error. No se ha podido establecer conexión con el servidor.",
          });
        } else {
          //si hay error en algunos archivos entonces hace rollback pero solo los que no pudieron subirse.
          if (
            estadoArchivos === 0 &&
            dataArchivos.datos &&
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
          result:
            "Ocurrió un error en el servidor. Contacte con un administrador.",
        });
      }
    } catch (error) {
      postMessage({
        type: "Error",
        result:
          "Ocurrió un error al realizar la petición. Contacte con un administrador.",
      });
      console.error(error);
    }
  };


  // Función para mapear los archivos y hacer la petición
  async function procesarArchivosYEnviarHistorial(
    archivos:any,
    url="",
    storedToken="",
    mensajeError = "",
    detalleExcepcion = ""
  ) {
    // Mapear los archivos al formato EntityHistorial
    const historialData = archivos.map((archivo:any) => ({
      IdDocumento: archivo.idDocumento,
      NombreDocumento: archivo.nomDocumento,
      IdAccion: 4, 
      Descripcion: archivo.descripcionError ? archivo.descripcionError : mensajeError, // Mensaje de error
      DetalleError: detalleExcepcion ? detalleExcepcion : '', // Detalle de la excepción
      Fecha: new Date(), 
      Usuario: archivo.usuarioCreacion, 
      Estado: "Error", 
    }));

    // Enviar la petición con los datos mapeados
    const response = await enviarPeticion(url, storedToken, historialData, {
      "Content-type": "application/json;charset=UTF-8",
      Accept: "application/json",
    });

    return response;
  }


};
