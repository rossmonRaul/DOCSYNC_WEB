import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
// @ts-ignore
import FileViewer from "react-file-viewer";
import { AiOutlineClose } from "react-icons/ai";
import {
  ObtenerArchivoDocumento,
  ObtenerDocumentoConvertidoPDF,
} from "../../servicios/ServicioDocumentos";
import { useSpinner } from "../../context/spinnerContext";
import { AlertDismissible } from "../alert/alert";

export const VisorArchivos: React.FC<any> = ({
  documento,
  documentoDescarga,
  cerrar,
}) => {
  const [error, setError] = useState("");
  const [fileExtension, setFileExtension] = useState<any>(null);
  const [fileURL, setFileURL] = useState<any>(null);
  const { setShowSpinner,showSpinner } = useSpinner();
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState<any>({});

  const tiposSoportados = [
    "docx",
    "png",
    "jpeg",
    "jpg",
    "pdf",
    "mp3",
    "mp4",
    "webm",
    "gif",
    "bmp",
  ].join(",");

  const obtenerArchivo = async (ids: any) => {
    setShowSpinner(true);
    const archivoBlob = await ObtenerArchivoDocumento(ids);

    setShowSpinner(false);
    if (archivoBlob) {
      const url = URL.createObjectURL(archivoBlob);
      setFileURL(url);
      let extensionArchivo = documentoDescarga.nomDocumento.split(".").pop();
      if (extensionArchivo === "doc" || extensionArchivo === "rtf") {
        extensionArchivo = "pdf";
      }
      setFileExtension(extensionArchivo);
    } else {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ha ocurrido un error al cargar el documento.",
      });
    }
  };

  useEffect(() => {
    if (documentoDescarga) {
      setTimeout(() => {
        obtenerArchivo([documentoDescarga.idDocumento + ""]);
      }, 5);
    }
    return () => {
      if (fileURL) {
        URL.revokeObjectURL(fileURL); // Revoca el Object URL creado
        setFileURL(null); // Limpia el estado del URL
      }
    };
  }, [documentoDescarga]);

  const obtenerDocConvertidoPDF = async () => {
    const form = new FormData();
    form.append("archivo", documento);
    setShowSpinner(true);
    const doc = await ObtenerDocumentoConvertidoPDF(form);
    setShowSpinner(false);
    if (doc) {
      setFileURL("");
      setFileExtension("");

      setTimeout(() => {
        const url = URL.createObjectURL(doc);
        const extension = "pdf";
        setFileURL(url);
        setFileExtension(extension);
      }, 5); // Un retraso mínimo de 5ms para forzar el refresco
    } else {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ha ocurrido un error al cargar el documento.",
      });
    }
  };

  useEffect(() => {
    if (documento) {
      if (documento.type === "application/msword") {
        obtenerDocConvertidoPDF();
      } else {
        setFileURL("");
        setFileExtension("");

        setTimeout(() => {
          const url = URL.createObjectURL(documento);
          const extension = documento.name.split(".").pop();
          setFileURL(url);
          setFileExtension(extension);
        }, 5); // Un retraso mínimo de 5ms para forzar el refresco
      }
    }
    // Función de limpieza para liberar la memoria cuando el componente se desmonta
    return () => {
      if (fileURL) {
        URL.revokeObjectURL(fileURL); // Revoca el Object URL creado
        setFileURL(null); // Limpia el estado del URL
      }
    };
  }, [documento]);
  return (
    <>
      {showAlert && (
        <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
      )}
      <div style={{ width: "100%", height: "100%", padding: "1%" }}>
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            {documento?.name || documentoDescarga?.nomDocumento}
          </h4>
          <Button className="btn-cancel" onClick={() => cerrar()}>
            <AiOutlineClose />
          </Button>
        </div>
        {error && <p>No se ha podido mostrar el archivo</p>}
        {tiposSoportados.includes(fileExtension) && fileURL && (
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              width: "100%",
              height: "100%",
            }}
          >
            <FileViewer
              key={documento?.id || documentoDescarga?.idDocumento}
              fileType={fileExtension}
              filePath={fileURL}
              errorComponent={<div>Error al cargar el archivo</div>} // Error personalizado
              onError={() => setError("error")}
            />
          </div>
        )}
        {!tiposSoportados.includes(fileExtension) && !showSpinner &&
          !["html","txt","sql"].includes(fileExtension) && (
            <>
              <p style={{ color: "#9E0000" }}>
                El archivo ha sido descargado ya que posee un formato no
                soportado.
              </p>
            </>
          )}
        {!tiposSoportados.includes(fileExtension) && (
          <>
            <iframe
              src={fileURL}
              width="100%"
              height="600px"
              title="File Preview"
            />
          </>
        )}
      </div>
    </>
  );
};
