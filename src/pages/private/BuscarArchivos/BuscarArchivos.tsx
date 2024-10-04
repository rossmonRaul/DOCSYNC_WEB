import { useState, ChangeEvent, FormEvent, lazy, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaClipboardList, FaSearch, FaEyeSlash, FaEye } from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import {
  ObtenerDocumento,
  ObtenerDocumentosPorContenido,
} from "../../../servicios/ServicioDocumentos";
import axios from "axios";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { format } from "date-fns";

interface Archivo {
  idDocumento: Number;
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
  usuarioCreacion: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

// Componente funcional que representa la página de carga de archivops
function BuscarArchivos() {
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Archivo>();
  const [documentoEditado, setDocumentoEditado] = useState(false);
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  const [autor, setAutor] = useState("");
  const [asunto, setAsunto] = useState("");
  //const [departamento, setDepartamento] = useState("");
  //const [confidencialidad, setConfidencialidad] = useState("");
  const [contenidoRelevante, setContenidoRelevante] = useState("");
  const [numeroExpediente, setNumeroExpediente] = useState("");
  const [numeroSolicitud, setNumeroSolicitud] = useState("");
  const [docPadre, setDocPadre] = useState("");
  const [docHijo, setDocHijo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [nombre, setNombre] = useState("");
  const [opcionDepartamento, setOpcionDepartamento] = useState(""); //
  const [opcionConfidencialidad, setOpcionSConfidencialidad] =
    useState("false"); //
  const [fechaFiltroInicial, setFechaFiltroInicial] = useState<Date | null>(
    null
  );
  const [fechaFiltroFinal, setFechaFiltroFinal] = useState<Date | null>(null);
  const [contenido, setContenido] = useState("");

  //const [listaDeRegistros, setListaDeRegistros] = useState([]);

  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);

  useEffect(() => {}, []);

  //Informacion general del paquete
  const encabezadoArchivo = [
    {
      id: "Seleccionar",
      name: "Seleccionar",
      cell: (row: Archivo) => (
        <Form.Check
          type="checkbox"
          checked={listaArchivosTablaSeleccionados.some(
            (r) => r.idDocumento === row.idDocumento
          )}
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
        return row.nombre;
      },
      head: "Nombre",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "FechaCarga",
      name: "Fecha de Carga",
      selector: (row: Archivo) => {
        const fecha = row.fechaModificacion
          ? row.fechaModificacion
          : row.fechaCreacion;
        return fecha ? format(fecha, "dd/MM/yyyy") : "";
      },
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
            <FaClipboardList />
          </Button>
          <Button
            onClick={() => handleVerArchivo(row)}
            size="sm"
            className="bg-secondary me-2"
          >
            <FaEye />
          </Button>
        </div>
      ),
      head: "Seleccionar",
      sortable: false,
      width: "150px",
    },
  ];

  const handleBuscarClick = async () => {
    setPendiente(true);
    setListaArchivosTabla([]);

    // Convertir fechas vacías a null
    const fechaInicio = fechaFiltroInicial === null ? null : fechaFiltroInicial;
    const fechaFin = fechaFiltroFinal === null ? null : fechaFiltroFinal;

    // Validar que la fecha final no sea menor que la fecha inicial
    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "La fecha final no puede ser menor que la fecha inicial.",
      });
      setPendiente(false);
      return;
    }

    const filtro = {
      autor: autor,
      asunto: asunto,
      contenidoRelevante: contenidoRelevante,
      numeroExpediente: numeroExpediente,
      numeroSolicitud: numeroSolicitud,
      docPadre: docPadre,
      docHijo: docHijo,
      titulo: titulo,
      nombre: nombre,
      departamento: opcionDepartamento,
      confidencialidad: opcionConfidencialidad,
      fechaFiltroInicial:
        fechaFiltroInicial === null ? null : fechaFiltroInicial,
      fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal,
    };

    // Llama a ObtenerArchivos solo cuando se hace clic en "Buscar"
    //console.log('filtro del buscar antes de ejecutar el sp')
    //console.log(filtro)
    const resultadosObtenidos = await ObtenerDocumento(filtro);
    //console.log('resultadosObtenidos:')
    //console.log(resultadosObtenidos)

    setListaArchivosTabla(resultadosObtenidos);
    setPendiente(false);

    if (resultadosObtenidos.length === 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "No se encontraron resultados.",
      });
    } else {
      setMostrarBusqueda(!mostrarBusqueda);
    }
  };

  const handleBuscarPorContenidoClick = async () => {
    setPendiente(true);

    if (contenido !== "") {
      // Llama a ObtenerArchivos solo cuando se hace clic en "Buscar"
      //console.log('filtro del buscar antes de ejecutar el sp')
      //console.log(filtro)
      const resultadosObtenidos = await ObtenerDocumentosPorContenido({
        archivosBuscar: listaArchivosTabla.map((a) => a.idDocumento + ""),
        contenido,
      });

      if (resultadosObtenidos.indicador === 0) {
        const coincidencias = resultadosObtenidos.datos;
        const archivosContenido = listaArchivosTabla.filter((a) =>
          coincidencias.some((s: any) => s.idDocumento === a.idDocumento + "")
        );
        console.log(coincidencias);
        setListaArchivosTabla(archivosContenido);
        setPendiente(false);
        setContenido("")

        if (archivosContenido.length === 0) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "No se encontraron resultados.",
          });
        }
      }
    }
  };

  const countEmptyFields = () => {
    let count = 0;
    // Cuenta los campos que no están vacíos
    if (autor !== "") count++;
    if (asunto !== "") count++;
    if (opcionDepartamento !== "") count++;
    if (contenidoRelevante !== "") count++;
    if (numeroExpediente !== "") count++;
    if (numeroSolicitud !== "") count++;
    if (docPadre !== "") count++;
    if (docHijo !== "") count++;
    if (titulo !== "") count++;
    if (nombre !== "") count++;
    if (fechaFiltroInicial !== null && fechaFiltroFinal !== null) count++;
    else if (
      (fechaFiltroInicial !== null && fechaFiltroFinal == null) ||
      (fechaFiltroFinal !== null && fechaFiltroInicial == null)
    )
      count = 0;

    return count;
  };

  const areInputsEmpty = () => {
    return countEmptyFields() < 3; // Valida si hay menos de 3 campos llenos
  };

  const handleOpcionDepartamentoChange = (e: any) => {
    setOpcionDepartamento(e.target.value);
  };

  const handleOpcionConfidenChange = (e: any) => {
    setOpcionSConfidencialidad(
      e.target.type !== "switch" ? e.target.value : e.target.checked + ""
    );
  };

  //////////////////////////////

  const handleVisor = () => {
    setDocumentoVer(undefined);
  };

  const handleVerArchivo = (archivo: Archivo) => {
    setDocumentoVer(archivo);
  };

  const handleInputChange = (e: any) => {
    if (documentoSeleccionado) {
      setDocumentoSeleccionado({
        ...documentoSeleccionado,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFilaSeleccionada = (row: Archivo) => {
    if (validarDatosCompletosArchivo(row)) {
      seleccionarDocumento(row);
    } else {
      abrirInformacionArchivo(row);
    }
  };

  /*const guardarInformacioArchivo = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
 
    setListaArchivosTabla(
      listaArchivosTabla.map((row) =>
        row.idDocumento === documentoSeleccionado?.idDocumento
          ? { ...row, ...documentoSeleccionado }
          : row
      )
    );
    setListaArchivosTablaSeleccionados(
      listaArchivosTablaSeleccionados.map((row) =>
        row.idDocumento === documentoSeleccionado?.idDocumento
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
  };*/

  const seleccionarDocumento = (row: Archivo) => {
    if (
      listaArchivosTablaSeleccionados.some(
        (r) => r.idDocumento === row.idDocumento
      )
    ) {
      setListaArchivosTablaSeleccionados(
        listaArchivosTablaSeleccionados.filter(
          (r) => r.idDocumento !== row.idDocumento
        )
      );
    } else {
      setListaArchivosTablaSeleccionados([
        ...listaArchivosTablaSeleccionados,
        row,
      ]);
    }
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
        showSubmitButton={false}
        show={showModal}
        onHide={handleModal}
        title={"Información del archivo"}
        formId="formCargaArchivos"
      >
        <Form id="formCargaArchivos">
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoEstado">
                <Form.Label>Autor</Form.Label>
                <Form.Control
                  type="text"
                  name="autor"
                  value={documentoSeleccionado?.autor}
                  onChange={handleInputChange}
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
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
                <div className="w-100">
                  <BootstrapSwitchButton
                    checked={
                      documentoSeleccionado?.confidencialidad === "True"
                        ? true
                        : false
                    }
                    onlabel="Sí"
                    onstyle="danger"
                    offlabel="No"
                    offstyle="success"
                    style="w-100 mx-3;"
                    disabled={true}
                  />
                </div>
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <h1 className="title">Buscar archivos</h1>
          </Col>
          <Col md={2} className="d-flex justify-content-start">
            {
              <Button
                className="btn-crear"
                variant="primary"
                type="submit"
                onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
              >
                {mostrarBusqueda ? (
                  <>
                    <FaEyeSlash className="me-2" size={24} color="#9E0000" />
                    Filtros de búsqueda
                  </>
                ) : (
                  <>
                    <FaEye className="me-2" size={24} />
                    Filtros de búsqueda
                  </>
                )}
              </Button>
            }
          </Col>
        </Row>
      </div>
      <hr></hr>
      <div className="container-fluid">
        {mostrarBusqueda ? (
          <div style={{ padding: "0 60px" }}>
            <Row>
              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group className="mb-4">
                  <label htmlFor="autor">
                    <b>Autor</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group className="mb-4">
                  <label htmlFor="nombre">
                    <b>Asunto</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group className="mb-4">
                  <label htmlFor="departamento">
                    <b>Departamento</b>
                  </label>
                  <Form.Control
                    as="select"
                    value={opcionDepartamento}
                    onChange={handleOpcionDepartamentoChange}
                  >
                    <option value="">-- Selecciona una opción --</option>
                    <option value="opcion1">Opción 1</option>
                    <option value="opcion2">Opción 2</option>
                    <option value="opcion3">Opción 3</option>
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group className="mb-4">
                  <label htmlFor="confidencialidad">
                    <b>Es confidencial</b>
                  </label>

                  <BootstrapSwitchButton
                    checked={opcionConfidencialidad === "true"}
                    onlabel="Sí"
                    onstyle="danger"
                    offlabel="No"
                    offstyle="success"
                    style="w-100 mx-3;" // Ajusta este valor según el tamaño deseado
                    onChange={(checked: boolean) =>
                      handleOpcionConfidenChange({
                        target: {
                          type: "switch",
                          name: "confidencialidad",
                          checked,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row style={{ padding: "0 0 20px 0" }}>
              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="ContenidoRelevante">
                    <b>Contenido relevante</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={contenidoRelevante}
                    onChange={(e) => setContenidoRelevante(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="NumeroExpediente">
                    <b>No. Expediente</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={numeroExpediente}
                    onChange={(e) => setNumeroExpediente(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="NumeroSolicitud">
                    <b>No. Solicitud</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={numeroSolicitud}
                    onChange={(e) => setNumeroSolicitud(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="DocHijo">
                    <b>Doc. Hijo</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={docHijo}
                    onChange={(e) => setDocHijo(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row style={{ padding: "0 0 20px 0" }}>
              <Col
                md={3}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="DocPadre">
                    <b>Doc. Padre</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={docPadre}
                    onChange={(e) => setDocPadre(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col
                md={5}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="Titulo">
                    <b>TÍtulo</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col
                md={2}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <label htmlFor="FechaFiltroInicial">
                  <b>Fecha inicial</b>
                </label>
                <Form.Group>
                  <DatePicker
                    showIcon
                    selected={fechaFiltroInicial}
                    onChange={(date) => setFechaFiltroInicial(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    locale={es}
                  />
                </Form.Group>
              </Col>

              <Col
                md={2}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <label htmlFor="FechaFiltroFinal">
                  <b>Fecha final</b>
                </label>
                <Form.Group>
                  <DatePicker
                    showIcon
                    selected={fechaFiltroFinal}
                    onChange={(date) => setFechaFiltroFinal(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    locale={es}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col
                md={6}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="Nombre">
                    <b>Nombre de archivo</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col
                md={6}
                className="d-flex flex-column"
                style={{ padding: "3px 10px" }}
              >
                <Button
                  className="btn-save"
                  variant="primary"
                  onClick={handleBuscarClick}
                  style={{ marginTop: "20px" }}
                  disabled={areInputsEmpty()}
                >
                  <FaSearch className="me-2" size={24} />
                  Buscar
                </Button>
              </Col>
            </Row>
          </div>
        ) : null}
        {listaArchivosTabla.length > 0 && (
          <div className="container-fluid mt-4" style={{ marginLeft: 30 }}>
            <Row>
              <Col
                md={6}
                className="d-flex flex-column"
                style={{ padding: "0 10px" }}
              >
                <Form.Group>
                  <label htmlFor="Contenido">
                    <b>Buscar por contenido</b>
                  </label>
                  <Form.Control
                    type="text"
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Button
                  className="btn-save"
                  variant="primary"
                  onClick={handleBuscarPorContenidoClick}
                  style={{ marginTop: "20px" }}
                >
                  <FaSearch className="me-2" size={24} />
                  Buscar
                </Button>
              </Col>
            </Row>
          </div>
        )}
        <div className="position-relative">
          {pendiente ? (
            <div style={{ height: "100vh" }}>Cargando...</div>
          ) : (
            /*tabla donde se muestran los datos*/
            <div style={{ display: "flex" }}>
              {/* Primera mitad de la pantalla */}
              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  borderRight: "1px solid #ddd",
                }}
              >
                {showAlert && (
                  <AlertDismissible
                    indicador={0}
                    mensaje={mensajeRespuesta}
                    setShow={setShowAlert}
                  />
                )}

                <div>
                  <div className="content">
                    <div
                      className=" row justify-content-between align-items-center"
                      style={{ marginLeft: 10 }}
                    ></div>

                    <Grid
                      gridHeading={encabezadoArchivo}
                      gridData={listaArchivosTabla}
                      selectableRows={false}
                      filterColumns={["nombre"]}
                    ></Grid>
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
          )}
        </div>
      </div>
    </>
  );
}

export default BuscarArchivos;
