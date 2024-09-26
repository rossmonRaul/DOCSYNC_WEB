export const cargarDocumentosWorker = () => {
    onmessage = async (e) => {
      const { docs, urlCarga, urlMetadata, storedToken } = e.data;
      const metadatosDocsEnviar = docs.map((a: any) => ({
        ...a,
        archivo: null,
      }));
  
      const formData = new FormData();
  
      let respuestaServidor = 0;
      // primero carga de metadatos
  
      try {
        const responseCargaMetadatos = await fetch(urlMetadata, {
          method: "POST",
          headers: {
            "Content-type": "application/json;charset=UTF-8",
            Accept: "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify(metadatosDocsEnviar),
        });
  
        if (!responseCargaMetadatos.ok) {
          respuestaServidor = -1;
        }
        const dataMetadatos = await responseCargaMetadatos.json();
  
        if (dataMetadatos.indicador === 1) {
          respuestaServidor = -1;
        }
  
        //si pudo insertar las metadata bien entonces ingresa los archivos como tal
        if (respuestaServidor === 0) {
          const obtenerArchivoPorNombre = (nombre: any) => {
            return docs.find((item: any) => item.nombre === nombre).archivo;
          };
          const docsInsertados = dataMetadatos.datos.archivosCargados;
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
  
          const responseCargaArchivos = await fetch(urlCarga, {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: formData,
          });
          if (!responseCargaArchivos.ok) {
            //realizar rollback en BD metadata
  
          }
          const dataArchivos = await responseCargaArchivos.json();
          //si hay error entonces hace rollback pero solo los que no pudieron subirse.
          if (responseCargaArchivos.ok && dataArchivos.indicador === 1) {
            console.log(dataArchivos);
            postMessage({ type: "Error", result: dataArchivos.mensaje });
          } else {
            postMessage({ type: "Success", result: dataArchivos.mensaje });
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