import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaEdit, FaUpload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import { useWorker } from "../../../context/workerContext";
import { cargarDocumentosWorker } from "./cargaDocumentosWorker";

interface Archivo {
  id: Number;
  autor: string;
  asunto: string;
  departamento: string;
  confidencialidad: string;
  contenidoRelevante: string;
  numeroExpediente: string;
  numeroSolicitud: string;
  docPadre: string;
  docHijo: string;
  titulo: string;
  nombre: string;
  archivo: File;
  tamanioArchivo: number;
  usuarioCreacion: string;
}

// Componente funcional que representa la página de carga de archivos
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
  const { startWorker, setTaskTitle } = useWorker();
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const API_BASE_URL_BD = import.meta.env.VITE_API_BASE_URL;
  const FILE_MAX_SIZE_MB = import.meta.env.VITE_FILE_MAX_SIZE_MB;
  const FILE_MAX_SIZE = FILE_MAX_SIZE_MB * (1024 * 1024);
  const API_BASE_URL_CARGA = import.meta.env.VITE_API_BASE_URL_CARGA;
  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);

  useEffect(() => {
    setTaskTitle("Carga de archivos");
  }, []);

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
        [e.target.name]:
          e.target.type !== "checkbox" ? e.target.value : e.target.checked + "",
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
          //validar tamanio del archivo antes de ingresar a la tabla
          if (element.size > FILE_MAX_SIZE) {
            setMensajeRespuesta({
              indicador: 3,
              mensaje: `Se han omitido los archivos que exceden los ${FILE_MAX_SIZE_MB}MB.`,
            });
            setShowAlert(true);
          } else {
            if (!existe) {
              const file: Archivo = {
                id: consecutivo++,
                archivo: element,
                tamanioArchivo: element.size,
                autor: "",
                asunto: "",
                confidencialidad: "false",
                contenidoRelevante: "",
                departamento: "",
                docHijo: "",
                nombre: element.name,
                docPadre: "",
                numeroExpediente: "",
                numeroSolicitud: "",
                titulo: "",
                usuarioCreacion: identificacionUsuario!!,
              };
              archivosAux.push(file);
              consecutivo = consecutivo++;
            } else {
              setMensajeRespuesta({
                indicador: 3,
                mensaje:
                  "Se han omitido los archivos duplicados o con el mismo nombre.",
              });
              setShowAlert(true);
            }
          }
        });
        setListaArchivosTabla([...listaArchivosTabla, ...archivosAux]);
        setIdArchivoGenerado(consecutivo);
        setFiles([]);
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
    listaArchivosTablaSeleccionados.forEach((a, index) => {
      // Agrega el archivo al FormData
      formData.append(`entityDocumento[${index}].IdDocumento`, "1");
      formData.append(`entityDocumento[${index}].Archivo`, a.archivo);
    });
    const storedToken = localStorage.getItem("token");
    const urlCarga = `${API_BASE_URL_CARGA}/Documento/CrearDocumento`;

    const urlMetadata = `${API_BASE_URL_BD}/Documento/CrearDocumento`;
    const urlReversion = `${API_BASE_URL_BD}/Documento/ReversarDocumento`;

    startWorker(cargarDocumentosWorker, {
      docs: listaArchivosTablaSeleccionados,
      urlMetadata,
      urlCarga,
      urlReversion,
      storedToken,
    });
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
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
  return (
    <>
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
                <Form.Label>Es confidencial</Form.Label>
                <Form.Check
                  type="switch"
                  name="confidencialidad"
                  checked={
                    documentoSeleccionado?.confidencialidad === "true"
                      ? true
                      : false
                  }
                  onChange={handleInputChange}
                />
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
                <Form.Label>Título</Form.Label>
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
              mensaje={mensajeRespuesta}
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
