import { useState, ChangeEvent, FormEvent, lazy } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaEdit, FaUpload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import { RiSaveFill } from "react-icons/ri";
import CustomModal from "../../../components/modal/CustomModal";
import useWebWorker from "../../../hooks/useWebWorker";
import { useWorker } from "../../../context/workerContext";
import WorkerStatus from "../../../components/workerStatus/worketStatus";
import { CrearDocumento } from "../../../servicios/ServicioDocumentos";
import axios from "axios";

interface Archivo {
  id: Number;
  autor?: string;
  asunto?: string;
  departamento?: string;
  confidencialidad?: string;
  contenidoRelevante?: string;
  numeroExpediente?: string;
  numeroSolicitud?: string;
  docPadre?: string;
  docHijo?: string;
  titulo?: string;
  archivo: File;
}

const fibonacciWorkerFunction = () => {
  onmessage = (e) => {
    const num = e.data;
    const fib: any = (n: any) => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    postMessage({ result: fib(num) });
  };
};

// sumWorker.ts
const sumWorkerFunction = () => {
  onmessage = (e) => {
    const { start, end } = e.data;
    let sum = 0;
    for (let i = start; i <= end; i++) {
      sum += i;
    }
    postMessage({ result: sum });
  };
};

const cargarDocumentosWorker = () => {
  onmessage = async (e) => {
    const docs = e.data;
    const response = await CrearDocumento(docs);
    postMessage({ result: response.mensaje });
  };
};

// Componente funcional que representa la página de carga de archivops
function CargarArchivos() {
  const [files, setFiles] = useState<File[]>([]);
  const [idArchivoGenerado, setIdArchivoGenerado] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [mensajeRespuesta, setMensajeRespuesta] = useState<any>({});
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Archivo>();
  const [documentoEditado, setDocumentoEditado] = useState(false);
  const [number, setNumber] = useState(2);
  const { startWorker, result, error, loading } = useWorker();

  const [input, setInput] = useState(10);

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
      selector: (row: { archivo: File }) => {
        if (documentoVer) {
          if (row.archivo.name.length > 30) {
            return row.archivo.name.substring(0, 30) + "...";
          }
        }
        return row.archivo.name;
      },
      head: "Nombre",
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
            onClick={() => abrirInformacionArchivo(row, true)}
            size="sm"
            className="bg-secondary me-2"
          >
            <FaEdit />
          </Button>
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

  const handleInputChange = (e: any) => {
    if (documentoSeleccionado) {
      setDocumentoSeleccionado({
        ...documentoSeleccionado,
        [e.target.name]: e.target.value,
      });
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
            (a) => a.archivo?.name === element.name
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
              numeroExpediente: "",
              numeroSolicitud: "",
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
    if (validarDatosCompletosArchivo(row)) {
      seleccionarDocumento(row);
    } else {
      abrirInformacionArchivo(row);
    }
  };

  const guardarInformacioArchivo = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);

    setListaArchivosTabla(
      listaArchivosTabla.map((row) =>
        row.id === documentoSeleccionado?.id
          ? { ...row, ...documentoSeleccionado }
          : row
      )
    );
    setListaArchivosTablaSeleccionados(
      listaArchivosTablaSeleccionados.map((row) =>
        row.id === documentoSeleccionado?.id
          ? { ...row, ...documentoSeleccionado }
          : row
      )
    );

    if (!documentoEditado) {
      if (documentoSeleccionado) {
        if (validarDatosCompletosArchivo(documentoSeleccionado)) {
          seleccionarDocumento(documentoSeleccionado);
        }
      }
    }
  };

  const seleccionarDocumento = (row: Archivo) => {
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

  const cargarArchivos = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    const storedToken = localStorage.getItem("token");
    const metadatosDocsEnviar = listaArchivosTablaSeleccionados.map((a) => ({
      ...a,
      archivo: null,
    }));
    listaArchivosTablaSeleccionados.forEach((a) => {
       // Agrega el archivo al FormData
       formData.append('entityDocumento', a.archivo);
    });
    const urlMongo =
      "https://localhost:44349/api/v1.0/Documento/CrearDocumento";

    console.log(metadatosDocsEnviar);
    let token;
    if (storedToken) {
      token = storedToken;
    }

    try {
      const response = await axios.post(urlMongo, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    }

    //const response = await CrearDocumento(docsEnviar);

    //startWorker(cargarDocumentosWorker, listaArchivosTablaSeleccionados);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
  };

  const handleFibonacci = () => {
    startWorker(fibonacciWorkerFunction, input);
  };

  const handleSum = () => {
    startWorker(sumWorkerFunction, { start: 1, end: input });
  };

  const validarDatosCompletosArchivo = (archivo: Archivo): boolean => {
    //return true;
    const valores = Object.values(archivo);

    for (const valor of valores) {
      if (valor === undefined || valor === "") {
        return false;
      }
    }
    return true;
  };

  const abrirInformacionArchivo = (row: Archivo, editar = false) => {
    setDocumentoSeleccionado(row);
    setShowModal(true);
    setDocumentoEditado(editar);
  };
  const handleChangeNumber = (e: any) => {
    setNumber(e.target.value); // Actualiza el input para el cálculo
  };
  return (
    <>
      <div>
        <h1>Worker Example</h1>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(parseInt(e.target.value))}
          placeholder="Enter a number"
        />
        <button onClick={handleFibonacci} disabled={loading}>
          {loading ? "Calculating..." : "Calculate Fibonacci"}
        </button>
        <button onClick={handleSum} disabled={loading}>
          {loading ? "Calculating..." : "Calculate Sum"}
        </button>
      </div>

      <CustomModal
        showSubmitButton={true}
        show={showModal}
        onHide={handleModal}
        title={"Información del archivo"}
        formId="formCargaArchivos"
      >
        <Form id="formCargaArchivos" onSubmit={guardarInformacioArchivo}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoEstado">
                <Form.Label>Autor</Form.Label>
                <Form.Control
                  type="text"
                  name="autor"
                  value={documentoSeleccionado?.autor}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Asunto</Form.Label>
                <Form.Control
                  type="text"
                  name="asunto"
                  value={documentoSeleccionado?.asunto}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Departamento</Form.Label>
                <Form.Select
                  name="departamento"
                  value={documentoSeleccionado?.departamento}
                  required
                  onChange={handleInputChange}
                >
                  <option value="">-- Selecciona una opción --</option>
                  <option value="opcion1">Opción 1</option>
                  <option value="opcion2">Opción 2</option>
                  <option value="opcion3">Opción 3</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Confidencialidad</Form.Label>
                <Form.Select
                  name="confidencialidad"
                  value={documentoSeleccionado?.confidencialidad}
                  required
                  onChange={handleInputChange}
                >
                  <option value="">-- Selecciona una opción --</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Contenido relevante</Form.Label>
                <Form.Control
                  type="text"
                  name="contenidoRelevante"
                  value={documentoSeleccionado?.contenidoRelevante}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>No. Expediente</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroExpediente"
                  value={documentoSeleccionado?.numeroExpediente}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>No. Solicitud</Form.Label>
                <Form.Control
                  type="text"
                  name="numeroSolicitud"
                  value={documentoSeleccionado?.numeroSolicitud}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Doc. Hijo</Form.Label>
                <Form.Control
                  type="text"
                  name="docHijo"
                  value={documentoSeleccionado?.docHijo}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Doc. Padre</Form.Label>
                <Form.Control
                  type="text"
                  name="docPadre"
                  value={documentoSeleccionado?.docPadre}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Titulo</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={documentoSeleccionado?.titulo}
                  required
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
      <h1 className="title">Cargar archivos</h1>
      <div style={{ display: "flex", height: "80vh" }}>
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

                    <Grid
                      gridHeading={encabezadoArchivo}
                      gridData={listaArchivosTabla}
                      selectableRows={false}
                    ></Grid>
                  </>
                )}
              </Form>
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
