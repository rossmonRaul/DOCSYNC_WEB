import { useState, ChangeEvent, FormEvent, lazy, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Placeholder, Row, Tooltip } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaClipboardList, FaSearch, FaEyeSlash, FaEye, FaFileDownload } from "react-icons/fa";
import { LuSearchX } from "react-icons/lu";
import Select, { SingleValue } from "react-select"
import CustomModal from "../../../components/modal/CustomModal";
import { ObtenerHistorial } from "../../../servicios/ServiceHistorial";
import { ObtenerUsuarios } from "../../../servicios/ServicioUsuario";
import { useSpinner } from "../../../context/spinnerContext";
import { exportToExcel } from '../../../utilities/exportReportToExcel';


//import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { format } from "date-fns";

interface UsuarioOption {
  value: string;
  label: string;
}

interface Historial {
  idHistorial: Number;
  descripcion: string;
  idDocumento: Number;
  nombreDocumento: string;
  idAccion: string;
  descripcionAccion: string;
  estado: string;
  detalleError: string;
  fecha: Date;
  usuario: string;
}

function Historial() {
  const { setShowSpinner } = useSpinner();
  const [listaUsuarios, setUsuarios] = useState<any[]>([]);

  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listaHistorialTabla, setListaHistorialTabla] = useState<Historial[]>([]);
  const [historialSeleccionado, setHistorialSeleccionado] = useState<Historial>();

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  //filtro:
  //const [idAccion, setIdAccion] = useState(null);
  const [opcionAccion, setOpcionAccion] = useState(""); //
  //const [estado, setEstado] = useState("");
  const [opcionEstado, setOpcionEstado] = useState("");
  const [fechaFiltroInicial, setFechaFiltroInicial] = useState<Date | null>(null);
  const [fechaFiltroFinal, setFechaFiltroFinal] = useState<Date | null>(null);
  const [usuario, setUsuario] = useState("");
  //
  const [mostrarDiv, setMostrarDiv] = useState(true);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<SingleValue<UsuarioOption>>(null);


  const toggleDiv = () => {
    setMostrarDiv(prev => !prev); // Alterna el estado
    setMostrarBusqueda(prev => !prev);
  }

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setShowSpinner(true);
    await obtenerUsuarios();
    setShowSpinner(false);
  }

  const obtenerUsuarios = async () => {
    try {
      const response = await ObtenerUsuarios();
      setUsuarios(response.filter((x: any) => x.estado === true));
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  //Encabezado tabla
  const encabezadoHistorial = [
    {
      id: "documento",
      name: "Documento",
      selector: (row: Historial) => row.nombreDocumento,
      head: "Documento",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      grow: 2,
    },
    {
      id: "accion",
      name: "Acción",
      selector: (row: Historial) => row.descripcionAccion,
      head: "Accion",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      grow: 1,
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: Historial) => row.estado,
      head: "Estado",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      grow: 1,
    },
    /*{
      id: "descripcion",
      name: "Descripción",
      selector: (row: Historial) => row.descripcion,
      head: "Descripcion",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      grow: 3, 
    }, */
    {
      id: "usuario",
      name: "Usuario",
      selector: (row: Historial) => row.usuario,
      head: "Usuario",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      grow: 1,
    },
    {
      id: "Fecha",
      name: "Fecha",
      selector: (row: Historial) => row.fecha ? format(row.fecha, "dd/MM/yyyy") : "",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      grow: 1,
    },
    {
      id: "Acciones",
      name: "Acciones",
      selector: (row: Historial) => (
        <div style={{ paddingTop: "5px", paddingBottom: "5px", textAlign: "center" }}>
          <Button
            onClick={() => abrirInformacionHistorial(row)}
            size="sm"
            className="bg-secondary me-2"
          >
            <FaClipboardList />
          </Button>
        </div>
      ),
      head: "Seleccionar",
      sortable: false,
      grow: 1,
      center: 'true'
    },
  ];


  const handleBuscarClick = async () => {
    setShowSpinner(true);
    setPendiente(true);
    setListaHistorialTabla([]);

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
      usuario: usuario === '' ? null : usuario,
      idAccion: opcionAccion === '' ? null : opcionAccion,
      nombreDocumento: null,
      estado: opcionEstado === '' ? null : opcionEstado,
      fechaFiltroInicial:
        fechaFiltroInicial === null ? null : fechaFiltroInicial,
      fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal,
    };

    // Llama a ObtenerArchivos solo cuando se hace clic en "Buscar"
    const resultadosObtenidos = await ObtenerHistorial(filtro);

    setListaHistorialTabla(resultadosObtenidos);
    setPendiente(false);

    if (resultadosObtenidos.length === 0) {
      setShowSpinner(false);
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "No se encontraron resultados.",
      });
    } else {
      setShowSpinner(false);
      toggleDiv();
      setMostrarBusqueda(!mostrarBusqueda);
    }
  };

  const countEmptyFields = () => {
    let count = 0;
    // Cuenta los campos que no están vacíos
    if (usuario !== "") count++;
    if (opcionAccion !== "") count++;
    if (opcionEstado !== "") count++;
    // if (estado !== "") count++;
    if (fechaFiltroInicial !== null && fechaFiltroFinal !== null) count++;
    else if (
      (fechaFiltroInicial !== null && fechaFiltroFinal == null) ||
      (fechaFiltroFinal !== null && fechaFiltroInicial == null)
    )
      count = 0;

    return count;
  };

  const areInputsEmpty = () => {
    return countEmptyFields() < 1; // Valida si hay menos de 2 campos llenos
  };

  const handleOpcionAccionChange = (e: any) => {
    setOpcionAccion(e.target.value);
  };

  const handleOpcionUsuarioChange = (selectedOption: any) => {
    selectedOption?setUsuario(selectedOption.value):setUsuarioSeleccionado(selectedOption);
    setUsuarioSeleccionado(selectedOption);
  };


  const handleOpcionEstado = (e: any) => {
    setOpcionEstado(e.target.value);
  };

  const handleInputChange = (e: any) => {
    if (historialSeleccionado) {
      setHistorialSeleccionado({
        ...historialSeleccionado,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
  };

  const abrirInformacionHistorial = (row: Historial) => {
    setHistorialSeleccionado(row);
    setShowModal(true);
  };


  const generarArchivoExcel = () => {
    setShowSpinner(true);

    if (listaHistorialTabla.length === 0 || listaHistorialTabla === null) {
        setShowAlert(true);
        setMensajeRespuesta({
            indicador: 0,
            mensaje: "No hay datos para descargar.",
        });
    } else {
        // datos para Excel
        const listaFormateadaXLSX = listaHistorialTabla.map(historial => ({
            Documento: historial.nombreDocumento,
            Acción: historial.descripcionAccion,
            Estado: historial.estado,
            Descripción: historial.descripcion,
            Error: historial.detalleError,
            Usuario: historial.usuario,
            Fecha: format(historial.fecha, "dd/MM/yyyy"),
        }));

        //  acción
        let cargaDescargar = 'Carga y Descarga';
        if (opcionAccion == '4') {
            cargaDescargar = 'Carga';
        } else if (opcionAccion == '5') {
            cargaDescargar = 'Descarga';
        }

        //  filtros seleccionados
        const dynamicHeaders: string[][] = [];
        if (usuario) {
            dynamicHeaders.push(["Usuario: " + usuario]);
        }
        if (opcionAccion) {
            dynamicHeaders.push(["Acción: " + cargaDescargar]);
        }
        if (opcionEstado) {
            dynamicHeaders.push(["Estado: " + opcionEstado]);
        }
        if (fechaFiltroInicial) {
            dynamicHeaders.push(['Fecha inicial: ' + new Date(fechaFiltroInicial).toLocaleDateString('es-ES')]);
        }
        if (fechaFiltroFinal) {
            dynamicHeaders.push(['Fecha final: ' + new Date(fechaFiltroFinal).toLocaleDateString('es-ES')]);
        }

        // columnas del reporte
        const columnas = [
            { key: 'Documento', header: 'Documento', width: 35 },
            { key: 'Acción', header: 'Acción', width: 10 },
            { key: 'Estado', header: 'Estado', width: 10 },
            { key: 'Descripción', header: 'Descripción', width: 45 },
            { key: 'Error', header: 'Error', width: 55 },
            { key: 'Usuario', header: 'Usuario', width: 20 },
            { key: 'Fecha', header: 'Fecha', width: 12 },
        ];

        //  función exportToExcel 
        exportToExcel({
            reportName: `Historial de ${cargaDescargar}`,
            data: listaFormateadaXLSX,
            columns: columnas,
            userName: usuario || 'Desconocido',
            dynamicHeaders, 
        });
    }

    setShowSpinner(false);
};




  return (
    <>
      <CustomModal
        showSubmitButton={false}
        show={showModal}
        onHide={handleModal}
        title={"Historial"}
      >
        <Form>
          <Row>
            <Col md={8}>
              <Form.Group controlId="formEformDocumento">
                <Form.Label>Nombre Documento</Form.Label>
                <Form.Control
                  type="text"
                  name="documento"
                  value={historialSeleccionado?.nombreDocumento}
                  disabled={true}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formFecha">
                <Form.Label>Fecha</Form.Label>
                <DatePicker
                  selected={historialSeleccionado?.fecha ? new Date(historialSeleccionado.fecha) : null}
                  onChange={handleInputChange}
                  dateFormat="dd/MM/yyyy"
                  showTimeSelect
                  className="form-control"
                  disabled={true}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{ marginTop: "3%" }}>
            <Col md={4}>
              <Form.Group controlId="formEformAccion">
                <Form.Label>Acción</Form.Label>
                <Form.Control
                  type="text"
                  name="accion"
                  value={historialSeleccionado?.descripcionAccion}
                  disabled={true}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formEstado">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  type="text"
                  name="estado"
                  value={historialSeleccionado?.estado}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formUsuario">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  name="usuario"
                  value={historialSeleccionado?.usuario}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{ marginTop: "3%" }}>
            <Col md={12}>
              <Form.Group controlId="formDescripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={historialSeleccionado?.descripcion}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{ marginTop: "3%" }}>
            <Col md={12}>
              <Form.Group controlId="formDetalleError">
                <Form.Label>Detalle de error</Form.Label>
                <Form.Control
                  as="textarea"
                  name="detalleError"
                  value={historialSeleccionado?.detalleError}
                  disabled={true}
                  rows={3}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
  
      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <h1 className="title">Historial</h1>
          </Col>
          <Col md={2} className="d-flex justify-content-start">
            <Button
              className="btn-crear"
              variant="primary"
              type="submit"
              onClick={toggleDiv}
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
          </Col>
        </Row>
      </div>
  
      <hr />
  
      <div className="container-fluid">
          {pendiente ? (
            <div>Cargando...</div>
          ) : (
            <div style={{ display: "flex"}}>
              <div className={`contenedorFiltro ${mostrarDiv ? "mostrar" : ""}`}>
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
                  <h4 className="h4Estilo">Filtro de búsqueda</h4>
                </div>
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
                  <Form.Group className="mb-4">
                    <label htmlFor="usuario">
                      <b>Usuario</b>
                    </label>
                    <Select
                      id="usuario"
                      className="GrupoFiltro"
                      value={usuarioSeleccionado}
                      onChange={handleOpcionUsuarioChange}
                      options={listaUsuarios.map((usuario: any) => ({
                        value: usuario.nombreCompleto,
                        label: usuario.nombreCompleto,
                      }))}
                      placeholder="Seleccione"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: "16px",
                        }),
                      }}
                    />
                  </Form.Group>
                </div>
  
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
                  <Form.Group className="mb-4">
                    <label htmlFor="accion">
                      <b>Acción</b>
                    </label>
                    <Form.Control
                      className="GrupoFiltro"
                      as="select"
                      value={opcionAccion}
                      onChange={handleOpcionAccionChange}
                    >
                      <option value="">Seleccione</option>
                      <option value="4">Carga</option>
                      <option value="5">Descarga</option>
                    </Form.Control>
                  </Form.Group>
                </div>
  
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
                  <Form.Group className="mb-4">
                    <label htmlFor="estado">
                      <b>Estado</b>
                    </label>
                    <Form.Control
                      className="GrupoFiltro"
                      as="select"
                      value={opcionEstado}
                      onChange={handleOpcionEstado}
                    >
                      <option value="">Seleccione</option>
                      <option value="Error">Error</option>
                      <option value="Exitoso">Exitoso</option>
                    </Form.Control>
                  </Form.Group>
                </div>
  
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
                  <label htmlFor="FechaFiltroInicial">
                    <b>Fecha inicial</b>
                  </label>
                  <Form.Group>
                    <DatePicker
                      selected={fechaFiltroInicial}
                      onChange={(date) => setFechaFiltroInicial(date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control GrupoFiltro"
                      locale={es}
                    />
                  </Form.Group>
                </div>
  
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
                  <label htmlFor="FechaFiltroFinal">
                    <b>Fecha final</b>
                  </label>
                  <Form.Group>
                    <DatePicker
                      selected={fechaFiltroFinal}
                      onChange={(date) => setFechaFiltroFinal(date)}
                      dateFormat="dd/MM/yyyy"
                      className="form-control GrupoFiltro"
                      locale={es}
                    />
                  </Form.Group>
                </div>
  
                <div className="d-flex flex-column" style={{ padding: "0 10px" }}>
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
                </div>
              </div>
  
              <div style={{ flex: 1, padding: "20px" }}>
                {showAlert && (
                  <AlertDismissible
                    indicador={0}
                    mensaje={mensajeRespuesta}
                    setShow={setShowAlert}
                  />
                )}
               
                  {listaHistorialTabla.length > 0 ? (             
                      <Grid
                        gridHeading={encabezadoHistorial}
                        gridData={listaHistorialTabla}
                        selectableRows={false}
                        filterColumns={["usuario", "accion", "estado", "descripcion", "fecha"]}
                        nameButtonOpcion1={"Descargar"}
                        visibleButtonOpcion1={true}
                        handleButtonOpcion1={generarArchivoExcel}
                        iconButtonOpcion1={<FaFileDownload className="me-2" size={24} />}
                      />                   
                  ) : (
                    <div
                      className="content row justify-content-center align-items-center"
                      style={{ marginLeft: 10, textAlign: "center", width: "100%" }}
                    >
                      <p>Sin resultados que mostrar</p>
                      <br />
                      <LuSearchX className="me-2" size={50} />
                    </div>
                  )}
              </div>
            </div>
          )}
      </div>
    </>
  );
  
}

export default Historial;
