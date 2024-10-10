import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import FileViewer from "react-file-viewer";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { AiOutlineClose } from "react-icons/ai";
import {
  ObtenerArchivoDocumento,
  ObtenerDocumentoConvertidoPDF,
} from "../../servicios/ServicioDocumentos";
import { useSpinner } from "../../context/spinnerContext";

export const VisorArchivos: React.FC<any> = ({
  documento,
  documentoDescarga,
  cerrar,
}) => {
  const [error, setError] = useState("");
  const [fileExtension, setFileExtension] = useState<any>(null);
  const [fileURL, setFileURL] = useState<any>(null);
  const { setShowSpinner } = useSpinner();

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
    const url = URL.createObjectURL(archivoBlob);
    setShowSpinner(false);
    setFileURL(url);
    let extensionArchivo = documentoDescarga.nombre.split(".").pop();
    if (extensionArchivo === "doc" || extensionArchivo === "rtf") {
      extensionArchivo = "pdf";
    }
    setFileExtension(extensionArchivo);
  };

  useEffect(() => {
    if (documentoDescarga) {
      setTimeout(() => {
        obtenerArchivo([documentoDescarga.idDocumento]);
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
    setShowSpinner(true)
    const doc = await ObtenerDocumentoConvertidoPDF(form);
    setShowSpinner(false)
    setFileURL("");
    setFileExtension("");

    setTimeout(() => {
      const url = URL.createObjectURL(doc);
      const extension = "pdf";
      setFileURL(url);
      setFileExtension(extension);
    }, 5); // Un retraso mínimo de 5ms para forzar el refresco
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

  if (tiposSoportados.includes(fileExtension)) {
    return (
      <>
        {fileURL && (
          <div>
            <div className="mb-2 d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {documento?.name || documentoDescarga?.nombre}
              </h4>
              <Button className="btn-cancel" onClick={() => cerrar()}>
                <AiOutlineClose />
              </Button>
            </div>

            {error && <p>No se ha podido mostrar el archivo</p>}

            <div style={{ maxHeight: "100vh", overflow: "auto" }}>
              <FileViewer
                style={{ overflowY: "hidden" }}
                key={documento?.id || documentoDescarga?.idDocumento}
                fileType={fileExtension}
                filePath={fileURL}
                errorComponent={<div>Error al cargar el archivo</div>} // Error personalizado
                onError={() => setError("error")}
              />
            </div>
          </div>
        )}
      </>
    );
  } else {
    return (
      <>
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            {documento?.name || documentoDescarga?.nombre}
          </h4>
          <Button className="btn-cancel" onClick={() => cerrar()}>
            <AiOutlineClose />
          </Button>
        </div>
        {["html", "sql", "txt"].includes(fileExtension) && (
          <p style={{ color: "#9E0000" }}>
            El archivo ha sido descargado ya que posee un formato no soportado.
          </p>
        )}
        {fileURL && (
          <iframe
            src={fileURL}
            width="100%"
            height="600px"
            title="File Preview"
          />
        )}
      </>
    );
  }
};
