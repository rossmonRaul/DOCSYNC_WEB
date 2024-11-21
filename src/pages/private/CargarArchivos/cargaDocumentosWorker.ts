export const cargarDocumentosWorker = () => {
  const enviarPeticionArchivosLotes = async (
    url: any,
    token: any,
    datosEnvio: any,
    headersData: any = {}
  ) => {
    const respuesta: any = {
      estado: 0,
    };
    try {
      const batchSize = 50; // Número de documentos por solicitud
      const totalBatches = Math.ceil(datosEnvio.length / batchSize);
      let noCargados: any = [];
      for (let i = 0; i < totalBatches; i++) {
        const batch = datosEnvio.slice(i * batchSize, (i + 1) * batchSize);
        const formData = new FormData();
        batch.forEach((a: any, index: any) => {
          // Agrega el archivo al FormData
          formData.append(
            `entityDocumento[${index}].IdDocumento`,
            a.idDocumento
          );
          formData.append(`entityDocumento[${index}].Archivo`, a.archivo);
        });

        const response = await fetch(url, {
          method: "POST",
          headers: {
            ...headersData,
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response || !response.ok) {
          respuesta.estado = -1;
          console.error(response);
          return respuesta;
        } else {
          const data = await response.json();
          if (data.datos?.archivosNoCargados?.length > 0) {
            noCargados = [...noCargados, ...data.datos.archivosNoCargados];
          }
          respuesta.data = data;
        }
      }
      if (noCargados.length > 0) {
        let nombresDocumentosNoCargados = noCargados
          .map((n: any) => n.nombre)
          .join(", ");
        if (nombresDocumentosNoCargados.length > 300) {
          nombresDocumentosNoCargados =
            nombresDocumentosNoCargados.substring(0, 300) + "...etc";
        }
        respuesta.data.mensaje = `Hubieron ${noCargados.length} de ${datosEnvio.length} documento(s) que no se pudieron cargar: ${nombresDocumentosNoCargados}`;
        respuesta.data.datos = {
          archivosNoCargados: noCargados,
        };
      } else {
        if (datosEnvio.length > 1) {
          respuesta.data.mensaje = `${datosEnvio.length} documento(s) registrados correctamente.`;
        }
      }
    } catch (error) {
      respuesta.estado = -1;
      respuesta.error =
        "Ocurrió un error al realizar la petición. Contacte con un administrador.";

      console.error(error);
    }

    return respuesta;
  };

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
    const {
      docs,
      urlCarga,
      urlMetadata,
      urlReversion,
      storedToken,
      urlHistorial,
    } = e.data;
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
        let archivosSubir: any = [];
        //preparar datos para la peticion a mongo, mandar el id del doc junto con el doc
        docsInsertados.forEach((a: any, index: number) => {
          archivosSubir.push({
            idDocumento: a.idDocumento,
            archivo: obtenerArchivoPorNombre(a.nomDocumento),
          });
        });

        const { estado: estadoArchivos, data: dataArchivos } =
          await enviarPeticionArchivosLotes(
            urlCarga,
            storedToken,
            archivosSubir,
            {
              Accept: "application/json",
            }
          );
        console.log(estadoArchivos, dataArchivos);
        if (
          estadoArchivos !== 0 ||
          (dataArchivos && dataArchivos?.indicador === 1)
        ) {
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

          //Guarda en historial de errores (no se hace mediante el rollback para guardar la excepcion)
          const responseHistorial = await procesarArchivosYEnviarHistorial(
            docsInsertados,
            urlHistorial,
            storedToken,
            "Error al cargar archivo.",
            dataArchivos?.mensaje // dataArchivos.detalleExcepcion
          );
          //
          postMessage({
            type: "Error",
            result:
              dataArchivos?.mensaje ||
              "Ha ocurrido un error al contactar con el servicio. Contacte con un administrador.",
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

            //Guarda en historial de errores (no se hace mediante el rollback para guardar la excepcion)
            const responseHistorial = await procesarArchivosYEnviarHistorial(
              dataArchivos.datos.archivosNoCargados,
              urlHistorial,
              storedToken,
              "Error al cargar archivo.",
              dataArchivos.mensaje // dataArchivos.detalleExcepcion
            );

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
    archivos: any,
    url = "",
    storedToken = "",
    mensajeError = "",
    detalleExcepcion = ""
  ) {
    // Mapear los archivos al formato EntityHistorial
    const historialData = archivos.map((archivo: any) => ({
      IdDocumento: archivo.idDocumento,
      NombreDocumento: archivo?.nomDocumento
        ? archivo?.nomDocumento
        : archivo.nombre,
      IdAccion: 4,
      Descripcion: archivo.descripcionError
        ? archivo.descripcionError
        : mensajeError, // Mensaje de error
      DetalleError: detalleExcepcion ? detalleExcepcion : "", // Detalle de la excepción
      Fecha: new Date(),
      Usuario: archivo?.usuarioCreacion ? archivo?.usuarioCreacion : "",
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
