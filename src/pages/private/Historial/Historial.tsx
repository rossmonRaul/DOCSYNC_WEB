import { useState, ChangeEvent, FormEvent, lazy, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaClipboardList, FaSearch, FaEyeSlash, FaEye } from "react-icons/fa";
import CustomModal from "../../../components/modal/CustomModal";
import { ObtenerHistorial } from "../../../servicios/ServiceHistorial";
//import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { format } from "date-fns";

interface Historial {
    idHistorial: Number;
    descripcion: string;
    idDocumento: Number;
    nombreDocumento: string;
    idAccion: string;
    estado: string;
    detalleError: string;
    fecha: Date;
    usuario: string;
}

function Historial() {
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [listaHistorialTabla, setListaHistorialTabla] = useState<Historial[]>([]);
    const [historialSeleccionado, setHistorialSeleccionado] = useState<Historial>();
    const identificacionUsuario = sessionStorage.getItem("nombre");

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
    const [fechaFiltroInicial, setFechaFiltroInicial] = useState<Date | null>( null);
    const [fechaFiltroFinal, setFechaFiltroFinal] = useState<Date | null>(null);
    const [usuario, setUsuario] = useState("");
    //

    
    useEffect(() => { }, []);

 //Encabezado tabla
 const encabezadoHistorial = [
    {
      id: "accion",
      name: "Acción",
      selector: (row: Historial) => {
        return row.idAccion;
      },
      head: "Accion",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
        id: "estado",
        name: "Estado",
        selector: (row: Historial) => {
          return row.estado;
        },
        head: "Estado",
        sortable: true,
        style: {
          fontSize: "1.5em",
        },
      },
      {
        id: "descripcion",
        name: "Descripción",
        selector: (row: Historial) => {
          return row.descripcion;
        },
        head: "Descripcion",
        sortable: true,
        style: {
          fontSize: "1.5em",
        },
      },
    {
      id: "Fecha",
      name: "Fecha",
      selector: (row: Historial) => {
        return row.fecha ? format(row.fecha, "dd/MM/yyyy") : "";
      },
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
        id: "Acciones",
        name: "Acciones",
        selector: (row: Historial) => (
          <div style={{ paddingTop: "5px", paddingBottom: "5px" }}>
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
        width: "150px",
      },
  ];

  const handleBuscarClick = async () => {
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
    console.log('filtro del buscar antes de ejecutar el sp')
    console.log(filtro)
    const resultadosObtenidos = await ObtenerHistorial(filtro);
    console.log('resultadosObtenidos:')
    console.log(resultadosObtenidos)

    setListaHistorialTabla(resultadosObtenidos);
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
                <Col md={4}>
                <Form.Group controlId="formAccion">
                    <Form.Label>Acción</Form.Label>
                    <Form.Select
                      name="accion"
                      value={historialSeleccionado?.idAccion}
                      disabled={true}
                    >
                      <option value="">-- Selecciona una opción --</option>
                      <option value="4">Carga</option>
                      <option value="5">Descarga</option>
                    </Form.Select>
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
              </Row>
              <Row>
                <Col md={6}>
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
                <Col md={6}>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group controlId="formDetalleError">
                    <Form.Label>Contenido relevante</Form.Label>
                    <Form.Control
                      type="textArea"
                      name="detalleError"
                      value={historialSeleccionado?.detalleError}
                      disabled={true}
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
                    md={4}
                    className="d-flex flex-column"
                    style={{ padding: "0 10px" }}
                  >
                    <Form.Group className="mb-4">
                      <label htmlFor="autor">
                        <b>Usuario</b>
                      </label>
                      <Form.Control
                        type="text"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
    
                  <Col
                    md={4}
                    className="d-flex flex-column"
                    style={{ padding: "0 10px" }}
                  >
                    <Form.Group className="mb-4">
                      <label htmlFor="accion">
                        <b>Acción</b>
                      </label>
                      <Form.Control
                        as="select"
                        value={opcionAccion}
                        onChange={handleOpcionAccionChange}
                      >
                        <option value="">-- Selecciona una opción --</option>
                        <option value="4">Carga</option>
                        <option value="5">Descarga</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
    
                  <Col
                    md={4}
                    className="d-flex flex-column"
                    style={{ padding: "0 10px" }}
                  >
                    <Form.Group className="mb-4">
                      <label htmlFor="estado">
                        <b>Estado</b>
                      </label>
                      <Form.Control
                        as="select"
                        value={opcionEstado}
                        onChange={handleOpcionEstado}
                      >
                        <option value="">-- Selecciona una opción --</option>
                        <option value="error">Error</option>
                        <option value="exitoso">Exitoso</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row style={{ padding: "0 0 20px 0" }}>             
                  <Col
                    md={4}
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
                    md={4}
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
                  <Col
                    md={4}
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
            <div className="position-relative">
              {pendiente ? (
                <div style={{ height: "100vh" }}>Cargando...</div>
              ) : (
                /*tabla donde se muestran los datos*/
                <div style={{ display: "flex" }}>
                  {/* grid */}
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
                          gridHeading={encabezadoHistorial}
                          gridData={listaHistorialTabla}
                          selectableRows={false}
                          filterColumns={["usuario","accion","estado","descripcion","fecha"]}
                        ></Grid>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      );
}

export default Historial;
