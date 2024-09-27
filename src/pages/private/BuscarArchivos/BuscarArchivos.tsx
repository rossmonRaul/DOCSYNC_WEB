import { useState, ChangeEvent, FormEvent, lazy, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import { FaClipboardList ,FaSearch ,FaEyeSlash,FaEye} from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import { ObtenerDocumento } from "../../../servicios/ServicioDocumentos";
import axios from "axios";

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
}

// Componente funcional que representa la página de carga de archivops
function BuscarArchivos() {
  //const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Archivo>();
  const [documentoEditado, setDocumentoEditado] = useState(false);
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({});

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
  const [opcionDepartamento, setOpcionDepartamento] = useState("1"); //
  const [opcionConfidencialidad, setOpcionSConfidencialidad] = useState('false'); //

  
  //const [listaDeRegistros, setListaDeRegistros] = useState([]);


  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);

  useEffect(() => {
  }, []);

  //Informacion general del paquete
  const encabezadoArchivo = [
    {
      id: "Seleccionar",
      name: "Seleccionar",
      cell: (row: Archivo) => (
        <Form.Check
          type="checkbox"
          checked={listaArchivosTablaSeleccionados.some((r) => r.idDocumento === row.idDocumento)}
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
          if (row.nombre.length > 30) {
            return row.nombre;
          }
        }
        return row.nombre;
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
    };

// Llama a ObtenerArchivos solo cuando se hace clic en "Buscar"
console.log('filtro del buscar antes de ejecutar el sp')
console.log(filtro)

 const resultadosObtenidos = await ObtenerDocumento(filtro);

 console.log('resultadosObtenidos:')
 console.log(resultadosObtenidos)

    setListaArchivosTabla(resultadosObtenidos);
    setPendiente(false);

    if (resultadosObtenidos.length === 0) {
        setMensajeRespuesta({ indicador: 1, mensaje: "No se encontraron resultados." });
    } else {
        setMostrarBusqueda(!mostrarBusqueda)
        setMensajeRespuesta({});
    }

};

const areInputsEmpty = () => {
  return (
      autor === '' &&
      asunto === '' &&
      opcionDepartamento === "1" &&
      opcionConfidencialidad === 'false' &&
      contenidoRelevante === '' &&
      numeroExpediente === '' &&
      numeroSolicitud === '' &&
      docPadre === '' &&
      docHijo === '' &&
      titulo === '' &&
      nombre === '' 
  );
};

const handleOpcionDepartamentoChange = (e:any) => {
  setOpcionDepartamento(e.target.value);
};

const handleOpcionConfidenChange = (e:any) => {
  setOpcionSConfidencialidad(e.target.type !== "checkbox" ? e.target.value : e.target.checked + "",);
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
    if (listaArchivosTablaSeleccionados.some((r) => r.idDocumento === row.idDocumento)) {
      setListaArchivosTablaSeleccionados(
        listaArchivosTablaSeleccionados.filter((r) => r.idDocumento !== row.idDocumento)
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
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
                  disabled = {true}
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
      <h1 className="title">Buscar archivos</h1>   
      
    <div className="container-fluid">

        <Row>
            <Col md={12} className="d-flex justify-content-start">
            {(
                <Button
                    className="btn-crear"
                    variant="primary" 
                    type="submit"
                    onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
                >
                    {mostrarBusqueda ? (
                        <>
                            <FaEye className="me-2" size={24} />
                            Filtros de búsqueda
                        </>
                    ) : (
                        <>
                            <FaEyeSlash className="me-2" size={24} />
                            Filtros de búsqueda
                        </>
                    )}
                </Button>

                )}
            </Col>
        </Row>     

        {mostrarBusqueda ? (
            <div>
              
                <Row>                 
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group className='mb-4'>
                            <label htmlFor="autor"><b>Autor</b></label>
                            <Form.Control
                                type="text"
                                value={autor}
                                onChange={(e) => setAutor(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group className='mb-4'>
                            <label htmlFor="nombre"><b>Asunto</b></label>
                            <Form.Control
                                type="text"
                                value={asunto}
                                onChange={(e) => setAsunto(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group className='mb-4'>
                            <label htmlFor="departamento"><b>Departamento</b></label>
                            <Form.Control
                                as="select"
                                value={opcionDepartamento}
                                onChange={handleOpcionDepartamentoChange}
                            >
                                <option value="1">-- Selecciona una opción --</option>
                                <option value="2">Opción 1</option>
                                <option value="3">Opción 2</option>
                                <option value="4">Opción 3</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group className='mb-4'>
                            <label htmlFor="confidencialidad"><b>Es confidencial</b></label>
                            <Form.Check
                              type="switch"
                              name="confidencialidad"
                              checked={
                                opcionConfidencialidad === "true"
                                  ? true
                                  : false
                              }
                              onChange={handleOpcionConfidenChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="ContenidoRelevante"><b>Contenido relevante</b></label>
                            <Form.Control
                                type="text"
                                value={contenidoRelevante}
                                onChange={(e) => setContenidoRelevante(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="NumeroExpediente"><b>No. Expediente</b></label>
                            <Form.Control
                                type="text"
                                value={numeroExpediente}
                                onChange={(e) => setNumeroExpediente(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="NumeroSolicitud"><b>No. Solicitud</b></label>
                            <Form.Control
                                type="text"
                                value={numeroSolicitud}
                                onChange={(e) => setNumeroSolicitud(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="DocHijo"><b>Doc. Hijo</b></label>
                            <Form.Control
                                type="text"
                                value={docHijo}
                                onChange={(e) => setDocHijo(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="DocPadre"><b>Doc. Padre</b></label>
                            <Form.Control
                                type="text"
                                value={docPadre}
                                onChange={(e) => setDocPadre(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="Titulo"><b>TÍtulo</b></label>
                            <Form.Control
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                        <Form.Group>
                            <label htmlFor="Nombre"><b>Nombre de archivo</b></label>
                            <Form.Control
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex flex-column" style={{ padding: '0 30px' }}>
                      <Button 
                          className="btn-crear"
                          variant="primary"
                          onClick={handleBuscarClick}
                          style={{ marginTop: '20px' }}
                          disabled={areInputsEmpty()} >
                          <FaSearch className="me-2" size={24} />
                          Buscar
                      </Button>
                    </Col>
                </Row>
            </div>
        ): null }
        <div ></div>

        
        <div className="position-relative">

        {pendiente ? (
            <div style={{ height: "100vh" }}>Cargando...</div>
            ) : (

                    /*tabla donde se muestran los datos*/
<div style={{ display: "flex", height: "100vh" }}>
        {/* Primera mitad de la pantalla */}
        <div
          style={{ flex: 1, padding: "20px", borderRight: "1px solid #ddd" }}
        >
                {/* 
          {showAlert && (
            <AlertDismissible
              indicador={mensajeRespuesta.indicador}
              mensaje={mensajeRespuesta.mensaje}
              setShow={setShowAlert}
            />
          )}
          */}
          <div>
            <div className="content">
            <div className=" row justify-content-between align-items-center" style={{ marginLeft: 10 }}
        >    
          </div>
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
