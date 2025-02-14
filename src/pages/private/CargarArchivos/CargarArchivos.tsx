import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaCheckSquare, FaUpload } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import { useWorker } from "../../../context/workerContext";
import { cargarDocumentosWorker } from "./cargaDocumentosWorker";
import { recortarTexto } from "../../../utils/utils";
import { ObtenerTiposDocumentos } from "../../../servicios/ServicioTiposDocumentos";
import { useSpinner } from "../../../context/spinnerContext";
import { ExtraerContenido } from "../../../servicios/ServicioDocumentos";
import { useNavigate } from "react-router-dom";
import { UserKey, resetUser } from "../../../redux/state/User";
import { clearSessionStorage } from "../../../utilities";
import { useDispatch } from "react-redux";
import { useAccept } from "../../../context/acceptContext";
import { PublicRoutes } from "../../../models/routes";
import { Test } from "../../../servicios/ServicioUsuario";

interface TipoDocumento {
  idTipoDocumento: string;
  descripcion: string;
  esImagen: boolean;
  fraseBusqInicio: string;
  fraseBusqFin: string;
  formatoDocumento: string;
  criterioBusqueda: string;
  contieneNumSoli: Boolean;
  contieneNumSoliNombre: Boolean;
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
  const [observacion, setObservacion] = useState("");
  const [showModalObservaciones, setShowModalObservaciones] = useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [mensajeRespuesta, setMensajeRespuesta] = useState<any>({});
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] =
    useState<TipoDocumento>({
      idTipoDocumento: "",
      descripcion: "",
      esImagen: false,
      fraseBusqInicio: "",
      fraseBusqFin: "",
      formatoDocumento: "",
      contieneNumSoli: true,
      contieneNumSoliNombre: false,
      criterioBusqueda: "",
    });
  const [tipoDocumento, setTipoDocumento] = useState<any>();
  const { startWorker, setTaskTitle, loading, error, result } = useWorker();
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const API_BASE_URL_BD = import.meta.env.VITE_API_BASE_URL;
  const FILE_MAX_SIZE_MB = import.meta.env.VITE_FILE_MAX_SIZE_MB;
  const FILE_MAX_SIZE = FILE_MAX_SIZE_MB * (1024 * 1024);
  const API_BASE_URL_CARGA = import.meta.env.VITE_API_BASE_URL_CARGA;
  const navigate = useNavigate(); // Hook de react-router-dom para la navegación
  const dispatch = useDispatch(); // Hook de react-redux para despachar acciones
  const { openAccept } = useAccept();

  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);
  const { setShowSpinner } = useSpinner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar conexión al server de carga
  useEffect(() => {
    const validarConexion = async () => {
      try {        
        if(loading){
          const response = await Test();
          if(!response){ // El servidor no está levantado en el puerto correspondiente
            openAccept("Ha ocurrido un error al contactar con el servidor de carga, favor vuelva a iniciar sesión", () => {
              clearSessionStorage(UserKey);
              dispatch(resetUser());
              navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
            });
          }
        }
      } catch (error) {
        // Cerrar la sesión
        openAccept("Ha ocurrido un error al contactar con el servidor de carga, favor vuelva a iniciar sesión", () => {
          clearSessionStorage(UserKey);
          dispatch(resetUser());
          navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
        });
      }
    };

    validarConexion();
    
    const intervalId = setInterval(validarConexion, 15000); 

    return () => clearInterval(intervalId);
  }, [loading]);

  const cargarTiposDocumentos = async () => {
    setShowSpinner(true);
    const response = await ObtenerTiposDocumentos();
    setShowSpinner(false);
    if (response) {
      setTipoDocumento(response.filter((x: any) => x.estado));
    } else {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error al cargar el catálogo de tipo de documento",
      });
    }
  };

  useEffect(() => {
    setTaskTitle("Carga de documentos, por favor no cerrar sesión hasta que finalice la carga");
    cargarTiposDocumentos();
  }, []);

  const limpiezaAsync = async () => {
    await sleep(1000);
    if (result && !error && !loading) {
      limpiarEnviados();
    }
  };

  useEffect(() => {
    limpiezaAsync();
  }, [loading]);

  //Informacion general del paquete
  const encabezadoArchivo = [
    {
      id: "Seleccione",
      name: "Seleccione",
      cell: (row: Archivo) => (
        <Form.Check
          type="checkbox"
          checked={listaArchivosTablaSeleccionados.some((r) => r.id === row.id)}
          onChange={() => handleFilaSeleccionada(row)}
        />
      ),
      head: "Seleccione",
      sortable: false,
      width: "140px",
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
      width: documentoVer ? "250px" : "420px",
    },
    {
      id: "peso",
      name: "Peso",
      selector: ({ archivo }: Archivo) => {
        const sizeInKB = archivo.size / 1024;
        return parseFloat(sizeInKB.toFixed(2)) + " KB";
      },
      head: "Nombre",
      sortable: true,
      width: "120px",
      style: {
        fontSize: "1.5em",
      },
      omit: documentoVer != null,
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
      width: documentoVer ? "100px" : "360px",
      omit: documentoVer != null,
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
      omit: documentoVer != null,
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

  const limpiarEnviados = () => {
    const archivosNoCargados = listaArchivosTabla.filter(
      (a) => !listaArchivosTablaSeleccionados.some((s) => s.id === a.id)
    );

    setListaArchivosTabla(archivosNoCargados);
    setListaArchivosTablaSeleccionados([]);
    setObservacion("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTipoChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    rowId: any
  ) => {
    const selectedValue = e.target.value;
    const tipoSeleccionado = tipoDocumento?.filter(
      (t: TipoDocumento) =>
        t.idTipoDocumento.toString() === selectedValue.toString()
    )[0];

    const selectedText = e.target.options[e.target.selectedIndex].text;
    setListaArchivosTabla((prevData) =>
      prevData.map((row) =>
        row.id === rowId
          ? {
              ...row,
              tipoDocumento: {
                idTipoDocumento: selectedValue,
                descripcion: selectedText,
                fraseBusqInicio: tipoSeleccionado?.fraseBusqInicio,
                fraseBusqFin: tipoSeleccionado?.fraseBusqFin,
                esImagen: tipoSeleccionado?.esImagen,
                criterioBusqueda: tipoSeleccionado.criterioBusqueda,
                formatoDocumento: tipoSeleccionado.formatoDocumento,
                contieneNumSoli: tipoSeleccionado.contieneNumSoli,
                contieneNumSoliNombre: tipoSeleccionado.contieneNumSoliNombre,
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
              mensaje: `Se han omitido los documentos que exceden los ${FILE_MAX_SIZE_MB}MB.`,
            });
            setShowAlert(true);
          } else {
            if (!existe) {
              const file: Archivo = {
                id: consecutivo++,
                archivo: element,
                observacion: "",
                numSolicitud: element.name,
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
                  "Se han omitido los documentos duplicados o con el mismo nombre.",
              });
              setShowAlert(true);
            }
          }
        });
        if (
          tipoDocumentoSeleccionado.formatoDocumento !== "Imagen" &&
          !tipoDocumentoSeleccionado.contieneNumSoliNombre
        ) {
          setShowSpinner(true);
          const batchSize = 50; // Número de documentos por solicitud
          const totalBatches = Math.ceil(archivosAux.length / batchSize);

          let responses: any = []; // Arreglo para guardar las respuestas

          for (let i = 0; i < totalBatches; i++) {
            const batch = archivosAux.slice(i * batchSize, (i + 1) * batchSize);
            const formData = new FormData();

            batch.forEach((a, index) => {
              formData.append(`entity[${index}].Id`, a.id + "");
              formData.append(`entity[${index}].NomDocumento`, a.nomDocumento);
              formData.append(`entity[${index}].Archivo`, a.archivo);

              formData.append(
                `entity[${index}].IdTipoDoc`,
                a.tipoDocumento.idTipoDocumento
              );
              formData.append(
                `entity[${index}].fraseBusqInicio`,
                a.tipoDocumento.fraseBusqInicio
              );
              formData.append(
                `entity[${index}].fraseBusqFin`,
                a.tipoDocumento.fraseBusqFin
              );
              formData.append(
                `entity[${index}].formatoDocumento`,
                a.tipoDocumento.formatoDocumento
              );
              formData.append(
                `entity[${index}].criterioBusqueda`,
                a.tipoDocumento.criterioBusqueda
              );
              formData.append(
                `entity[${index}].contieneNumSoli`,
                a.tipoDocumento.contieneNumSoli === true ? "1" : "0"
              );
            });

            try {
              const response = await ExtraerContenido(formData);
              if (!response) {
                setShowAlert(true);
                setShowSpinner(false);
                setMensajeRespuesta({
                  indicador: 1,
                  mensaje:
                    "Error. Ha ocurrido un error al extraer número de solicitud.",
                });
                return;
              }

              const result = await response.datos;
              responses = [...responses, ...result];
            } catch (error: any) {
              console.error(`Error en el lote ${i + 1}:`, error);
              responses.push({ error: true, message: error.message });
            }
          }
          if (responses.length > 0) {
            const obtenerNumSolicitud = (nombre: any) => {
              return responses?.find(
                (item: any) => item.nomDocumento === nombre
              )?.numSolicitud;
            };
            archivosAux.forEach((a) => {
              a.numSolicitud = obtenerNumSolicitud(a.nomDocumento);
            });
            setListaArchivosTabla([...listaArchivosTabla, ...archivosAux]);
            setIdArchivoGenerado(consecutivo);
            setFiles([]);
          }
          setShowSpinner(false);
        } else {
          setListaArchivosTabla([...listaArchivosTabla, ...archivosAux]);
          setIdArchivoGenerado(consecutivo);
          setFiles([]);
        }
        if(tipoDocumentoSeleccionado.contieneNumSoliNombre && !tipoDocumentoSeleccionado.esImagen){
          archivosAux.forEach((a) => {
            const nombreArchivo = a.nomDocumento;
            const ultimoPunto = nombreArchivo.lastIndexOf('.');
            const nombreSinExtension = ultimoPunto !== -1 ? nombreArchivo.substring(0, ultimoPunto) : nombreArchivo;
            a.numSolicitud = nombreSinExtension;
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

  const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

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

    setShowModalObservaciones(false);
    /*await sleep(1000);

    if (!loading && !error) {
      limpiarEnviados();
    }
      */
  };

  const prepararCarga = async (event: FormEvent) => {
    event.preventDefault();
    if (listaArchivosTablaSeleccionados.length > 1) {
      setShowModalObservaciones(true);
    } else {
      cargarArchivos(event, false);
    }
  };

  const validarDatosCompletosArchivo = (archivo: Archivo): boolean => {
    //return true;
    const valores = Object.entries(archivo);
    for (const [key, valor] of valores) {
      if (
        key !== "observacion" &&
        (valor === undefined ||
          valor === null ||
          valor.toString().trim() === "")
      ) {
        return false;
      }
    }
    return true;
  };

  const validarContienenNumSoli = () => {
    for (const a of listaArchivosTabla) {
      if (!validarDatosCompletosArchivo(a)) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: `No se ha colocado un número de solicitud para el archivo: ${a.archivo.name}`,
        });
        return false;
      }
    }
    return true;
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
      <h1 className="title">Cargar documentos</h1>
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
                <Row>
                  <Col>
                    <Form.Group style={{ marginBottom: "20px" }}>
                      <Form.Label>Tipo de documento</Form.Label>
                      <Form.Select
                        name="tipoDocumento"
                        value={tipoDocumentoSeleccionado?.idTipoDocumento}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          const tipoSeleccionado = tipoDocumento?.filter(
                            (t: TipoDocumento) =>
                              t.idTipoDocumento.toString() ===
                              selectedValue.toString()
                          )[0];
                          const selectedText =
                            e.target.options[e.target.selectedIndex].text;
                          setTipoDocumentoSeleccionado({
                            idTipoDocumento: selectedValue,
                            descripcion: selectedText,
                            fraseBusqInicio: tipoSeleccionado?.fraseBusqInicio,
                            fraseBusqFin: tipoSeleccionado?.fraseBusqFin,
                            esImagen: tipoSeleccionado?.imagen,
                            formatoDocumento: tipoSeleccionado.formatoDocumento,
                            criterioBusqueda: tipoSeleccionado.criterioBusqueda,
                            contieneNumSoli: tipoSeleccionado.contieneNumSoli,
                            contieneNumSoliNombre:
                              tipoSeleccionado.contieneNumSoliNombre,
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
                  </Col>
                  <Col>
                    {tipoDocumentoSeleccionado?.idTipoDocumento !== "" && (
                      <Form.Group>
                        <Form.Label>
                          Selecciona un documento (peso máximo{" "}
                          {FILE_MAX_SIZE_MB} MB)
                        </Form.Label>
                        <Form.Control
                          multiple
                          ref={fileInputRef}
                          accept=".pdf,.doc,.html,.dot,.dotx,.htm,.odt,.ods,.odp,.sql,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.csv,.jpg,.jpeg,.png,.bmp,.gif,.tiff,.webp"
                          type="file"
                          onChange={handleFileChange}
                        />
                      </Form.Group>
                    )}
                  </Col>
                </Row>

                {listaArchivosTabla.length > 0 && (
                  <>
                    <div className="mb-6 mt-4 d-flex justify-content-end align-items-right">
                      <h4 className="mt-4">
                        Documentos seleccionados:{" "}
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
                          {
                            condicion:
                              listaArchivosTabla.length !==
                              listaArchivosTablaSeleccionados.length,
                            accion: () => {
                              if (validarContienenNumSoli()) {
                                setListaArchivosTablaSeleccionados(
                                  listaArchivosTabla
                                );
                              }
                            },
                            icono: <FaCheckSquare className="me-2" size={24} />,
                            texto: "Seleccionar todos",
                          },
                          {
                            condicion:
                              listaArchivosTabla.length ===
                              listaArchivosTablaSeleccionados.length,
                            accion: () => {
                              setListaArchivosTablaSeleccionados([]);
                            },
                            icono: <FaCheckSquare className="me-2" size={24} />,
                            texto: "Deseleccionar todos",
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
          <div style={{ flex: 1, padding: "1%", overflowY: "hidden" }}>
            <VisorArchivos
              key={documentoVer}
              documento={documentoVer.archivo}
              cerrar={handleVisor}
              esCarga={true}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default CargarArchivos;
