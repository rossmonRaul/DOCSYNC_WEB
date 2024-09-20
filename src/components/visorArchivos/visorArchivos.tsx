import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import FileViewer from "react-file-viewer";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { AiOutlineClose } from "react-icons/ai";

export const VisorArchivos: React.FC<any> = ({ documento, cerrar }) => {
  const [error, setError] = useState("");
  const [fileExtension, setFileExtension] = useState<any>("");
  const [fileURL, setFileURL] = useState<any>("");

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

  useEffect(() => {
    if (documento) {
      setFileURL("");
      setFileExtension("");

      setTimeout(() => {
        const url = URL.createObjectURL(documento);
        const extension = documento.name.split(".").pop();
        setFileURL(url);
        setFileExtension(extension);
      }, 5); // Un retraso mínimo de 5ms para forzar el refresco
    }
  }, [documento]);

  if (tiposSoportados.includes(fileExtension)) {
    return (
      <>
        <div>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              Visualización del archivo: {documento.name}
            </h4>
            <Button className="btn-cancel" onClick={() => cerrar()}>
              <AiOutlineClose />
            </Button>
          </div>

          {error && <p>No se ha podido mostrar el archivo</p>}

          <FileViewer
            fileType={fileExtension}
            filePath={fileURL}
            errorComponent={<div>Error al cargar el archivo</div>} // Error personalizado
            onError={() => setError("error")}
          />
        </div>{" "}
      </>
    );
  } else {
    return (
      <>
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Visualización del archivo: {documento.name}</h4>
          <Button className="btn-cancel" onClick={() => cerrar()}>
            <AiOutlineClose />
          </Button>
        </div>
        <p style={{ color: "#9E0000" }}>
          El archivo ha sido descargado ya que posee un formato no soportado.
        </p>
        <iframe
          src={fileURL}
          width="100%"
          height="600px"
          title="File Preview"
        />
      </>
    );
  }
};
