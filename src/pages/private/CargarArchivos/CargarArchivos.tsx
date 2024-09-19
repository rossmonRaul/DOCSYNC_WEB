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
  autor?: string;
  asunto?: string;
  departamento?: string;
  confidencialidad?: string;
  contenidoRelevante?: string;
  noExpediente?: string;
  noSolicitud?: string;
  docPadre?: string;
  docHijo?: string;
  titulo?: string;
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
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "Autor",
      name: "Autor",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "autor", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          type="text"
        />
      ),
      head: "Autor",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "Asunto",
      name: "Asunto",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "autor", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          type="text"
        />
      ),
      head: "Asunto",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "Departamento",
      name: "Departamento",
      cell: (row: Archivo) => (
        <Form.Select
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "Nombre",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "Confidencialidad",
      name: "Confidencialidad",
      cell: (row: Archivo) => (
        <Form.Check
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "Confidencialidad",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "ContenidoRelevante",
      name: "Cont. Relevante",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "Cont. Relevante",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "NoExpediente",
      name: "No. Expediente",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "No. Expediente",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "NoExpediente",
      name: "No. Solicitud",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "No. Solicitud",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "DocPadre",
      name: "Doc. Padre",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "Doc. Padre",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "DocHijo",
      name: "DocHijo",
      cell: (row: Archivo) => (
        <Form.Control
          onChange={(e) => handleInputChange(row.id, "asunto", e.target.value)}
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
        />
      ),
      head: "DocHijo",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "Acciones",
      name: "Acciones",
      selector: (row: Archivo) => (
        <div style={{ paddingTop: "5px", paddingBottom: "5px" }}>
          <Button
            onClick={() => handleVerArchivo(row)}
            size="sm"
            className="bg-secondary me-2"
          >
            <FaEye />
          </Button>
          <Button
            size="sm"
            onClick={() => handleDeleteArchivoTabla(row.id)}
            className="bg-secondary me-2"
          >
            <FaTrash />
          </Button>
        </div>
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

  const handleInputChange = (
    rowId: Number,
    columnName: string,
    value: string
  ) => {
    setListaArchivosTabla(
      listaArchivosTabla.map((row) =>
        row.id === rowId ? { ...row, [columnName]: value } : row
      )
    );
    setListaArchivosTablaSeleccionados(
      listaArchivosTablaSeleccionados.map((row) =>
        row.id === rowId ? { ...row, [columnName]: value } : row
      )
    );
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
              autor: "",
              asunto: "",
              confidencialidad: "",
              contenidoRelevante: "",
              departamento: "",
              docHijo: "",
              docPadre: "",
              noExpediente: "",
              noSolicitud: "",
              titulo: "",
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
      <div className="content">
        {/* Primera mitad de la pantalla */}
        <div className="row">
          {showAlert && (
            <AlertDismissible
              indicador={mensajeRespuesta.indicador}
              mensaje={mensajeRespuesta.mensaje}
              setShow={setShowAlert}
            />
          )}
          <div className={`col-${documentoVer ? "6" : "12"}`}>
            <Form onSubmit={cargarArchivos}>
              <Form.Group>
                <Form.Label>Selecciona un archivo</Form.Label>
                <Form.Control
                  multiple
                  type="file"
                  onChange={handleFileChange}
                />
              </Form.Group>
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
                    <h4 className="mt-4 ms-auto">
                      Archivos seleccionados:{" "}
                      {listaArchivosTablaSeleccionados.length}
                    </h4>
                  </div>
                  <div>
                    <Grid
                      gridHeading={encabezadoArchivo}
                      gridData={listaArchivosTabla}
                      selectableRows={false}
                    ></Grid>
                  </div>
                </>
              )}
            </Form>
          </div>

          {documentoVer?.archivo && (
            <div className="col-6">
              <VisorArchivos
                key={documentoVer}
                documento={documentoVer.archivo}
                cerrar={handleVisor}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CargarArchivos;
