import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaClipboardList, FaSearch, FaEyeSlash, FaEye, FaFileDownload,FaDownload } from "react-icons/fa";
import CustomModal from "../../../components/modal/CustomModal";
import { ObtenerBitacora } from "../../../servicios/ServicioBitacora";
import { useSpinner } from "../../../context/spinnerContext";
import { exportToExcel } from '../../../utilities/exportReportToExcel';
import { format } from "date-fns";
import { ObtenerDocumentosDescarga } from "../../../servicios/ServicioDocumentos";


interface Bitacora {
  idBitacora: Number;
  descripcion: string;
  idAccion: string;
  descripcionAccion: string;
  fecha: Date;
  usuario: string;
}

function Bitacora() {
  const { setShowSpinner } = useSpinner();
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listaBitacoraTabla, setListaBitacoraTabla] = useState<Bitacora[]>([]);
  const [bitacoraSeleccionada, setBitacoraSeleccionada] = useState<Bitacora>();

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  //filtro:
  //const [idAccion, setIdAccion] = useState(null);
  //const [estado, setEstado] = useState("");
  const [fechaFiltroInicial, setFechaFiltroInicial] = useState<Date | null>(null);
  const [fechaFiltroFinal, setFechaFiltroFinal] = useState<Date | null>(null);
  const [usuario, setUsuario] = useState("");
  //
  const [mostrarDiv, setMostrarDiv] = useState(true);


  const toggleDiv = () => {
    setMostrarDiv(prev => !prev); // Alterna el estado
    setMostrarBusqueda(prev => !prev);
  }

  useEffect(() => {
  }, []);

  //Encabezado tabla
  const encabezadoBitacora = [
    {
      id: "accion",
      name: "Acción",
      selector: (row: Bitacora) => row.descripcionAccion,
      head: "Accion",
      sortable: true,
      style: {
        fontSize: "1.5em",      
      },
      width: "10%",
    },  
    {
      id: "descripcion",
      name: "Descripción",
      selector: (row: Bitacora) => 
        row.descripcion?.length > 70
          ? row.descripcion.slice(0, 70) + "..."
          : row.descripcion,
      head: "Descripcion",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      width: "45%",
    }, 
    {
      id: "usuario",
      name: "Usuario",
      selector: (row: Bitacora) => 
        row.usuario?.length > 50
          ? row.usuario.slice(0, 50) + "..."
          : row.usuario,
      head: "Usuario",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      width: "25%",
    },
    {
      id: "Fecha",
      name: "Fecha",
      selector: (row: Bitacora) => row.fecha ? format(row.fecha, "dd/MM/yyyy") : "",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      width: "10%",
    },
    {
      id: "Acciones",
      name: "Acciones",
      selector: (row: Bitacora) => (
        <div style={{ paddingTop: "5px", paddingBottom: "5px", textAlign: "center" }}>
          <Button
            onClick={() => abrirInformacionBitacora(row)}
            size="sm"
            className="bg-secondary me-2"
          >
            <FaClipboardList />
          </Button>
        </div>
      ),
      head: "Seleccionar",
      sortable: false,
      center: 'true',
      width: "10%",
    },
  ];


  const handleBuscarClick = async () => {
    setShowSpinner(true);
    setPendiente(true);
    setListaBitacoraTabla([]);

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
      setShowSpinner(false);
      return;
    }

    const filtro = {
      fechaFiltroInicial: fechaFiltroInicial === null ? null : fechaFiltroInicial,
      fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal,
    };

    // Llama a ObtenerArchivos solo cuando se hace clic en "Buscar"
    const resultadosObtenidos = await ObtenerBitacora(filtro);

    setListaBitacoraTabla(resultadosObtenidos);
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

  const handleInputChange = (e: any) => {
    if (bitacoraSeleccionada) {
      setBitacoraSeleccionada({
        ...bitacoraSeleccionada,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
  };

  const abrirInformacionBitacora = (row: Bitacora) => {
    setBitacoraSeleccionada(row);
    setShowModal(true);
  };


  const generarArchivoExcel = () => {
    setShowSpinner(true);

    if (listaBitacoraTabla.length === 0 || listaBitacoraTabla === null) {
        setShowAlert(true);
        setMensajeRespuesta({
            indicador: 0,
            mensaje: "No hay datos para descargar.",
        });
    } else {
        // datos para Excel
        const listaFormateadaXLSX = listaBitacoraTabla.map(bitacora => ({
            Acción: bitacora.descripcionAccion,
            Descripción: bitacora.descripcion,
            Usuario: bitacora.usuario,
            Fecha: format(bitacora.fecha, "dd/MM/yyyy"),
        }));


        //  filtros seleccionados
        const dynamicHeaders: string[][] = [];
        if (fechaFiltroInicial) {
            dynamicHeaders.push(['Fecha inicial: ' + new Date(fechaFiltroInicial).toLocaleDateString('es-ES')]);
        }
        if (fechaFiltroFinal) {
            dynamicHeaders.push(['Fecha final: ' + new Date(fechaFiltroFinal).toLocaleDateString('es-ES')]);
        }

        // columnas del reporte
        const columnas = [
            { key: 'Acción', header: 'Acción', width: 15 },
            { key: 'Descripción', header: 'Descripción', width: 130 },
            { key: 'Usuario', header: 'Usuario', width: 30 },
            { key: 'Fecha', header: 'Fecha', width: 12 },
        ];

        //  función exportToExcel 
        exportToExcel({
            reportName: `Bitácora`,
            data: listaFormateadaXLSX,
            columns: columnas,
            userName: usuario || null,
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
        title={"Bitácora"}
      >
        <Form>
          <Row>
            <Col md={4}>
              <Form.Group controlId="formFecha">
                <Form.Label>Fecha</Form.Label>
                <DatePicker
                  selected={bitacoraSeleccionada?.fecha ? new Date(bitacoraSeleccionada.fecha) : null}
                  onChange={handleInputChange}
                  dateFormat="dd/MM/yyyy"
                  showTimeSelect
                  className="form-control"
                  disabled={true}
                />
              </Form.Group>
            </Col>       
            <Col md={4}>
              <Form.Group controlId="formEformAccion">
                <Form.Label>Acción</Form.Label>
                <Form.Control
                  type="text"
                  name="accion"
                  value={bitacoraSeleccionada?.descripcionAccion}
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
                  value={bitacoraSeleccionada?.usuario}
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
                  as="textarea"
                  name="descripcion"
                  value={bitacoraSeleccionada?.descripcion}
                  onChange={handleInputChange}
                  rows={5}
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
            <h1 className="title">Bitácora</h1>
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
  
              <div style={{ flex: 1, padding: "20px",  width:"80%" }}>
                {showAlert && (
                  <AlertDismissible
                    indicador={0}
                    mensaje={mensajeRespuesta}
                    setShow={setShowAlert}
                  />
                )}
               
                  {listaBitacoraTabla.length > 0 ? (             
                      <Grid
                        gridHeading={encabezadoBitacora}
                        gridData={listaBitacoraTabla}
                        selectableRows={false}
                        filterColumns={["usuario", "accion","descripcion", "fecha"]}
                        nameButtonOpcion1={"Descargar"}
                        visibleButtonOpcion1={true}
                        botonesAccion={[
                          {
                            condicion:true,
                            accion: generarArchivoExcel,
                            icono: <FaDownload className="me-2" size={24} />,
                            texto: 'Descargar',                            
                          },
                        ]}
                        handleButtonOpcion1={generarArchivoExcel}
                        iconButtonOpcion1={<FaFileDownload className="me-2" size={24} />}
                      />                   
                  ) : (
                    <div
                      className="content row justify-content-center align-items-center"
                      style={{ marginLeft: 10, textAlign: "center", width: "100%" }}
                    >
                      <img src="/SinResultados.png" className="imgSinResultados"/>
                    </div>
                  )}
              </div>
            </div>
          )}
      </div>
    </>
  );
  
}

export default Bitacora;
