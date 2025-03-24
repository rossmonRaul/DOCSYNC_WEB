import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { es } from "date-fns/locale/es";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import {
  FaClipboardList,
  FaEyeSlash,
  FaEye,
} from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import {
  ObtenerDocumento,
  ObtenerDocumentosDescarga,
} from "../../../servicios/ServicioDocumentos";
import { format } from "date-fns";
import { LuSearchX } from "react-icons/lu";
import { AiOutlineFileSearch } from "react-icons/ai";
import { recortarTexto } from "../../../utils/utils";
import { useSpinner } from "../../../context/spinnerContext";

interface Archivo {
  idDocumento: Number;
  nomDocumento: string;
  nombreGuardar: string;
  numSolicitud: string;
  idTipoDocumento: Number;
  descripcionTipo: string;
  archivo: File;
  tamanioArchivo: number;
  usuarioCreacion: string;
  fechaModificacion: string;
  fechaCreacion: string;
}

// Componente funcional que representa la página de consulta de archivos para una solicitud
function BuscarArchivosSolicitud() {
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Archivo>();

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  useEffect(() => {}, []);

  //Informacion general del paquete
  const encabezadoArchivo = [
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: Archivo) => {
        return row.nomDocumento;
      },
      head: "Nombre",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
    },
    {
      id: "tipo",
      name: "Tipo",
      selector: (row: Archivo) => {
        return row.descripcionTipo;
      },
      head: "Tipo",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      omit: documentoVer != null,
    },
    {
      id: "No.Solicitud",
      name: "No.Solicitud",
      selector: (row: Archivo) => {
        return row.numSolicitud;
      },
      head: "No.Solicitud",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      omit: documentoVer != null,
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
   // setListaArchivosTablaSeleccionados([]);

    const filtro = {
      numSolicitud: 123,
    };
    
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

  const handleVisor = () => {
    setDocumentoVer(undefined);
  };

  const handleVerArchivo = (archivo: Archivo) => {
    setDocumentoVer(archivo);
    console.log(archivo);
  };


  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <CustomModal
        showSubmitButton={false}
        show={showModal}
        onHide={handleModal}
        title={recortarTexto(documentoSeleccionado?.nomDocumento, 50)}
        formId="formCargaArchivos"
      >
        <Form id="formCargaArchivos"></Form>
      </CustomModal>


      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiOutlineFileSearch size={34} style={{ marginTop: "10px" }} />
              <h1 className="title">Número Solicitud: {'123'}</h1>
            </div>
          </Col>
        </Row>
      </div>
      <hr></hr>
      <div className="container-fluid">
        <div className="position-relative">
          {pendiente ? (
            <div style={{ height: "100vh" }}>Cargando...</div>
          ) : (
            /*tabla donde se muestran los datos*/
            <div style={{ display: "flex" }}>         
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
                  {listaArchivosTabla.length > 0 ? (
                    <div className="content">
                      <Grid
                        gridHeading={encabezadoArchivo}
                        gridData={listaArchivosTabla}
                        selectableRows={false}
                        filterColumns={["nombre"]}
                      ></Grid>
                    </div>
                  ) : (
                    <div
                      className="content row justify-content-center align-items-center"
                      style={{
                        marginLeft: 10,
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      <p>Sin resultados que mostrar</p>
                      <br />
                      <LuSearchX className="me-2" size={50} />
                    </div>
                  )}
                </div>
              </div>
              {documentoVer && (
                <div style={{ flex: 1, padding: "20px" }}>
                  <VisorArchivos
                    key={documentoVer}
                    documentoDescarga={documentoVer}
                    cerrar={handleVisor}
                  />
                </div>
              )}
            </div>
            /* fin contenedor */
          )}
        </div>
      </div>
    </>
  );
}

export default BuscarArchivosSolicitud;
