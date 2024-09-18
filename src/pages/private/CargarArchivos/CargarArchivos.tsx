import { useState, ChangeEvent, FormEvent } from "react";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Topbar from "../../../components/topbar/Topbar";
import "../../../css/general.css";
import { Button, Form } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaUpload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";

interface Archivo {
  id: Number;
  archivo: File;
}

// Componente funcional que representa la página de carga de archivops
function CargarArchivos() {
  const [files, setFiles] = useState<File[]>([]);
  const [idArchivoGenerado, setIdArchivoGenerado] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [mensajeRespuesta, setMensajeRespuesta] = useState<any>({});
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [fileExtension, setFileExtension] = useState<any>("");
  const [fileURL, setFileURL] = useState<any>("");

  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);

  //Informacion general del paquete
  const encabezadoArchivo = [
    {
      id: "Seleccionar",
      name: "Seleccionar",
      cell: (row: Archivo) => (
        <Form.Check
          type="checkbox"
          checked={listaArchivosTablaSeleccionados.some((r) => r.id === row.id)}
          onChange={() => handleFilaSeleccionada(row)}
        />
      ),
      head: "Seleccionar",
      sortable: false,
      width: "150px",
      center: "true",
    },
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: { archivo: File }) => row.archivo.name,
      head: "Nombre",
      sortable: true,
    },
    {
      id: "Acciones",
      name: "Acciones",
      selector: (row: Archivo) => (
        <>
          <Button
            onClick={() => handleVerArchivo(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <FaEye />
          </Button>
          <Button
            size="sm"
            onClick={() => handleDeleteArchivoTabla(row.id)}
            className="bg-secondary"
          >
            <FaTrash />
          </Button>
        </>
      ),
      head: "Seleccionar",
      sortable: false,
      width: "150px",
    },
  ];

  const handleVisor = () => {
    setDocumentoVer(undefined);
  };

  const handleVerArchivo = (archivo: Archivo) => {
    const url = URL.createObjectURL(archivo.archivo);
    const extension = archivo.archivo.name.split(".").pop();
    setFileURL(url);
    setFileExtension(extension);
    setDocumentoVer(archivo);
  };

  const handleDeleteArchivoTabla = (id: Number) => {
    const datosFiltrados = listaArchivosTabla.filter((r) => r.id !== id);
    const datosFiltradosSeleccionados = listaArchivosTablaSeleccionados.filter(
      (r) => r.id !== id
    );
    setListaArchivosTablaSeleccionados(datosFiltradosSeleccionados);
    setListaArchivosTabla(datosFiltrados);
    if (documentoVer?.id === id) {
      setDocumentoVer(undefined);
    }
  };

  // Maneja el cambio de archivos
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files); // Convierte FileList a un array
      setFiles(selectedFiles); // Actualiza el estado con el array de archivos

      let consecutivo = idArchivoGenerado;
      let archivosAux: Archivo[] = [];
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((element) => {
          const existe = listaArchivosTabla.some(
            (a) => a.archivo.name === element.name
          );
          if (!existe) {
            const file: Archivo = {
              id: consecutivo++,
              archivo: element,
            };
            archivosAux.push(file);
            consecutivo = consecutivo++;
          } else {
            setMensajeRespuesta({
              indicador: 3,
              mensaje: "El archivo ya está seleccionado",
            });
            setShowAlert(true);
          }
        });
        setListaArchivosTabla([...listaArchivosTabla, ...archivosAux]);
        setIdArchivoGenerado(consecutivo);
      }
    }
  };

  const handleFilaSeleccionada = (row: Archivo) => {
    if (listaArchivosTablaSeleccionados.some((r) => r.id === row.id)) {
      setListaArchivosTablaSeleccionados(
        listaArchivosTablaSeleccionados.filter((r) => r.id !== row.id)
      );
    } else {
      setListaArchivosTablaSeleccionados([
        ...listaArchivosTablaSeleccionados,
        row,
      ]);
    }
  };

  const cargarArchivos = (event: FormEvent) => {
    event.preventDefault();
    console.log(listaArchivosTablaSeleccionados);
  };

  return (
    <>
      <BordeSuperior />
      <Topbar />
      <h1 className="title">Cargar archivos</h1>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Primera mitad de la pantalla */}
        <div
          style={{ flex: 1, padding: "20px", borderRight: "1px solid #ddd" }}
        >
          {showAlert && (
            <AlertDismissible
              indicador={mensajeRespuesta.indicador}
              mensaje={mensajeRespuesta.mensaje}
              setShow={setShowAlert}
            />
          )}
          <div>
            <div className="content">
              <Form onSubmit={cargarArchivos}>
                <Form.Group>
                  <Form.Label>Selecciona un archivo</Form.Label>
                  <Form.Control
                    multiple
                    type="file"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Form>
              {listaArchivosTabla.length > 0 && (
                <>
                  <div className="mb-6 mt-4 d-flex justify-content-between align-items-center">
                    {listaArchivosTablaSeleccionados.length > 0 && (
                      <Button
                        type="submit"
                        className="mt-3 mb-0 btn-save"
                        variant="primary"
                      >
                        <FaUpload className="me-2" size={20} />
                        Guardar
                      </Button>
                    )}
                    <h4 className="mt-4 ">
                      Archivos seleccionados:{" "}
                      {listaArchivosTablaSeleccionados.length}
                    </h4>
                  </div>

                  <Grid
                    gridHeading={encabezadoArchivo}
                    gridData={listaArchivosTabla}
                    selectableRows={false}
                  ></Grid>
                </>
              )}
            </div>
          </div>
        </div>
        {documentoVer?.archivo && (
          <div style={{ flex: 1, padding: "20px" }}>
            <VisorArchivos
              key={documentoVer}
              documento={documentoVer.archivo}
              cerrar={handleVisor}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default CargarArchivos;
