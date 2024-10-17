import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaCheckSquare, FaEdit, FaUpload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import { useWorker } from "../../../context/workerContext";
import { cargarDocumentosWorker } from "./cargaDocumentosWorker";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { FaCheckCircle } from "react-icons/fa";
import { recortarTexto } from "../../../utils/utils";
import { ObtenerTiposDocumentos } from "../../../servicios/ServicioTiposDocumentos";
import { useSpinner } from "../../../context/spinnerContext";
import { useSelector } from "react-redux";
import { AppStore } from "../../../redux/Store";
import { ExtraerContenido } from "../../../servicios/ServicioDocumentos";

interface TipoDocumento {
  idTipoDocumento: string;
  descripcion: string;
}

interface Archivo {
  id: Number;
  nomDocumento: string;
  nombreGuardar: string;
  numSolicitud: string;
  observacion: string;
  tipoDocumento: TipoDocumento;
  archivo: File;
  tamanioArchivo: number;
  usuarioCreacion: string;
  fechaCreacion: string;
}

// Componente funcional que representa la página de carga de archivos
function CargarArchivos() {
  const [files, setFiles] = useState<File[]>([]);
  const [idArchivoGenerado, setIdArchivoGenerado] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [showModalObservaciones, setShowModalObservaciones] = useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [mensajeRespuesta, setMensajeRespuesta] = useState<any>({});
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Archivo>();
  const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] =
    useState<TipoDocumento>({ idTipoDocumento: "", descripcion: "" });
  const [tipoDocumento, setTipoDocumento] = useState<any>();
  const [documentoEditado, setDocumentoEditado] = useState(false);
  const { startWorker, setTaskTitle, loading } = useWorker();
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const API_BASE_URL_BD = import.meta.env.VITE_API_BASE_URL;
  const FILE_MAX_SIZE_MB = import.meta.env.VITE_FILE_MAX_SIZE_MB;
  const FILE_MAX_SIZE = FILE_MAX_SIZE_MB * (1024 * 1024);
  const API_BASE_URL_CARGA = import.meta.env.VITE_API_BASE_URL_CARGA;
  const userState = useSelector((store: AppStore) => store.user);

  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);
  const { setShowSpinner } = useSpinner();

  const cargarTiposDocumentos = async () => {
    setShowSpinner(true);
    const response = await ObtenerTiposDocumentos();
    setShowSpinner(false);
    if (response) {
      setTipoDocumento(response);
    } else {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error al cargar el catálogo de tipo de documento",
      });
    }
  };
  useEffect(() => {
    setTaskTitle("Carga de archivos");
    cargarTiposDocumentos();
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
      selector: (row: Archivo) => {
        if (documentoVer) {
          return recortarTexto(row.nomDocumento);
        }
        return recortarTexto(row.nomDocumento, 100);
      },
      head: "Nombre",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      width: documentoVer ? "250px" : "400px",
    },
    {
      id: "tipo",
      name: "Tipo",
      selector: (row: Archivo) => {
        return (
          <Form.Select
            name="tipoDocumento"
            value={row.tipoDocumento?.idTipoDocumento}
            onChange={(e) => handleTipoChange(e, row.id)}
          >
            {tipoDocumento &&
              tipoDocumento?.map((t: any, index: any) => (
                <option key={index} value={t.idTipoDocumento}>
                  {t.descripcion}
                </option>
              ))}
          </Form.Select>
        );
      },
      head: "Tipo",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      width: documentoVer ? "100px" : "400px",
    },
    {
      id: "numeroSolicitud",
      name: "No. Solicitud",
      selector: (row: Archivo) => {
        return (
          <Form.Control
            type="text"
            name="autor"
            value={row?.numSolicitud}
            onChange={(e) => handleNoSolicitudChange(e, row.id)}
          />
        );
      },
      sorteable: false,
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

  const handleTipoChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    rowId: any
  ) => {
    const selectedValue = e.target.value;
    const selectedText = e.target.options[e.target.selectedIndex].text;
    setListaArchivosTabla((prevData) =>
      prevData.map((row) =>
        row.id === rowId
          ? {
              ...row,
              tipoDocumento: {
                idTipoDocumento: selectedValue,
                descripcion: selectedText,
              },
            }
          : row
      )
    );
  };

  const handleNoSolicitudChange = (e: any, rowId: any) => {
    const selectedValue = e.target.value;

    setListaArchivosTabla((prevData) =>
      prevData.map((row) =>
        row.id === rowId ? { ...row, numSolicitud: selectedValue } : row
      )
    );
  };

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
          e.target.type !== "switch" ? e.target.value : e.target.checked + "",
      });
    }
  };

  // Maneja el cambio de archivos
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
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
                observacion: "",
                numSolicitud: "123",
                tamanioArchivo: element.size,
                tipoDocumento: tipoDocumentoSeleccionado,
                nombreGuardar:
                  tipoDocumentoSeleccionado.descripcion +
                  "-" +
                  element.name +
                  "-" +
                  new Date().toISOString(),
                nomDocumento: element.name,
                usuarioCreacion: identificacionUsuario!!,
                fechaCreacion: new Date().toISOString(),
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
        //extraer el num de solicitud
        const formData = new FormData();
        archivosAux.forEach((a: Archivo, index: number) => {
          formData.append(`entity[${index}].Id`, a.id + "");
          formData.append(`entity[${index}].NomDocumento`, a.nomDocumento);
          formData.append(`entity[${index}].Archivo`, a.archivo);
          formData.append(
            `entity[${index}].IdTipoDoc`,
            a.tipoDocumento.idTipoDocumento
          );
          formData.append(
            `entity[${index}].DescripcionDoc`,
            a.tipoDocumento.descripcion
          );
          formData.append(`entity[${index}].FechaCreacion`, a.fechaCreacion);
          formData.append(
            `entity[${index}].UsuarioCreacion`,
            a.usuarioCreacion
          );
        });
        setShowSpinner(true);
        const response = await ExtraerContenido(formData);
        setShowSpinner(false);
        if (response) {
          const docsConNumeroSolicitud = response?.datos;
          const obtenerNumSolicitud = (nombre: any) => {
            return docsConNumeroSolicitud?.find(
              (item: any) => item.nomDocumento === nombre
            )?.numSolicitud;
          };
          archivosAux.forEach((a) => {
            a.numSolicitud = obtenerNumSolicitud(a.nomDocumento);
          });
          setListaArchivosTabla([...listaArchivosTabla, ...archivosAux]);
          setIdArchivoGenerado(consecutivo);
          setFiles([]);
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje:
              "Error. Ha ocurrido un error al extraer número de solicitud.",
          });
        }
      }
    }
  };

  const handleFilaSeleccionada = (row: Archivo) => {
    if (validarDatosCompletosArchivo(row)) {
      seleccionarDocumento(row);
    } else {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Complete los campos del documento correctamente.",
      });
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

  const cargarArchivos = async (event: FormEvent, masivo: boolean = false) => {
    event.preventDefault();
    const formData = new FormData();
    if (masivo) {

      listaArchivosTablaSeleccionados.forEach((a, index) => {
        a.observacion = observacion;
        // Agrega el archivo al FormData
        formData.append(`entityDocumento[${index}].IdDocumento`, "1");
        formData.append(`entityDocumento[${index}].Archivo`, a.archivo);
      });
    } else {
      listaArchivosTablaSeleccionados.forEach((a, index) => {
        // Agrega el archivo al FormData
        formData.append(`entityDocumento[${index}].IdDocumento`, "1");
        formData.append(`entityDocumento[${index}].Archivo`, a.archivo);
      });
    }
    const storedToken = localStorage.getItem("token");
    const urlCarga = `${API_BASE_URL_CARGA}/Documento/CrearDocumento`;

    const urlMetadata = `${API_BASE_URL_BD}/Documento/CrearDocumento`;
    const urlReversion = `${API_BASE_URL_BD}/Documento/ReversarDocumento`;
    const urlHistorial = `${API_BASE_URL_BD}/Historial/InsertarRegistrosHistorial`;

    startWorker(cargarDocumentosWorker, {
      docs: listaArchivosTablaSeleccionados,
      urlMetadata,
      urlCarga,
      urlReversion,
      storedToken,
      urlHistorial,
    });

    const archivosNoCargados = listaArchivosTabla.filter(
      (a) => !listaArchivosTablaSeleccionados.some((s) => s.id === a.id)
    );

    setListaArchivosTabla(archivosNoCargados);
    setListaArchivosTablaSeleccionados([]);
    setShowModalObservaciones(false);
    setObservacion("");
  };

  const prepararCarga = async (event: FormEvent) => {
    event.preventDefault();
    if (listaArchivosTablaSeleccionados.length > 1) {
      setShowModalObservaciones(true);
    } else {
      cargarArchivos(event, false);
    }
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
  };

  const validarDatosCompletosArchivo = (archivo: Archivo): boolean => {
    //return true;
    const valores = Object.entries(archivo);
    for (const [key, valor] of valores) {
      if (key !== "observacion" && (valor === undefined || valor === "")) {
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
        show={showModalObservaciones}
        onHide={() => setShowModalObservaciones(false)}
        title={"Guardar documentos seleccionados"}
        formId="formObservacionGuardar"
        submitButtonLabel={"Confirmar"}
      >
        <Form
          id="formObservacionGuardar"
          onSubmit={(e) => cargarArchivos(e, true)}
        >
          <Row>
            <Col md={12}>
              <Form.Group controlId="formObservacion">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  type="text"
                  name="observacionEliminacion"
                  value={observacion}
                  required={true}
                  onChange={(e: any) => {
                    setObservacion(e.target.value);
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
      <h1 className="title">Cargar archivos</h1>
      <div style={{ display: "flex", maxHeight: "100vh", overflow: "auto" }}>
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
              <Form>
                <Form.Group style={{ marginBottom: "20px" }}>
                  <Form.Label>Tipo de documento</Form.Label>
                  <Form.Select
                    name="tipoDocumento"
                    value={tipoDocumentoSeleccionado?.idTipoDocumento}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const selectedText =
                        e.target.options[e.target.selectedIndex].text;
                      setTipoDocumentoSeleccionado({
                        idTipoDocumento: selectedValue,
                        descripcion: selectedText,
                      });
                    }}
                  >
                    <option value="">-- Selecciona una opción --</option>
                    {tipoDocumento &&
                      tipoDocumento?.map((t: any, index: any) => (
                        <option key={index} value={t.idTipoDocumento}>
                          {t.descripcion}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
                {tipoDocumentoSeleccionado?.idTipoDocumento !== "" && (
                  <Form.Group>
                    <Form.Label>
                      Selecciona un archivo (peso máximo {FILE_MAX_SIZE_MB} MB)
                    </Form.Label>
                    <Form.Control
                      multiple
                      accept=".pdf,.doc,.html,.dot,.dotx,.htm,.odt,.ods,.odp,.sql,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.csv,.jpg,.jpeg,.png,.bmp,.gif,.tiff,.webp"
                      type="file"
                      onChange={handleFileChange}
                    />
                  </Form.Group>
                )}
                {listaArchivosTabla.length > 0 && (
                  <>
                    <div className="mb-6 mt-4 d-flex justify-content-end align-items-right">
                      {listaArchivosTabla.length !==
                        listaArchivosTablaSeleccionados.length && (
                        <Button
                          className="btn-save me-4  ms-auto"
                          variant="primary"
                          onClick={() => {
                            setListaArchivosTablaSeleccionados(
                              listaArchivosTabla
                            );
                          }}
                          style={{ marginTop: "20px" }}
                        >
                          <FaCheckSquare className="me-2" size={24} />
                          Seleccionar todos
                        </Button>
                      )}
                      {listaArchivosTabla.length ===
                        listaArchivosTablaSeleccionados.length && (
                        <Button
                          className="btn-cancel me-4  ms-auto"
                          variant="primary"
                          onClick={() => {
                            setListaArchivosTablaSeleccionados([]);
                          }}
                          style={{ marginTop: "20px" }}
                        >
                          <FaCheckSquare className="me-2" size={24} />
                          Deseleccionar todos
                        </Button>
                      )}
                      <h4 className="mt-4">
                        Archivos seleccionados:{" "}
                        {listaArchivosTablaSeleccionados.length}
                      </h4>
                    </div>
                    <div style={{ marginTop: "20px" }}>
                      <Grid
                        filterColumns={"nomDocumento"}
                        botonesAccion={[
                          {
                            condicion:
                              listaArchivosTablaSeleccionados.length > 0 &&
                              !loading,
                            accion: prepararCarga,
                            icono: <FaUpload className="me-2" size={20} />,
                            texto: "Guardar",
                          },
                        ]}
                        gridHeading={encabezadoArchivo}
                        gridData={listaArchivosTabla}
                        selectableRows={false}
                      ></Grid>
                    </div>
                  </>
                )}
              </Form>
            </div>
          </div>
        </div>
        {documentoVer?.archivo && (
          <div style={{ flex: 1, padding: "20px", overflowY: "hidden" }}>
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
