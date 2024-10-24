import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { Grid } from "../../../components/table/tabla";
import { AlertDismissible } from "../../../components/alert/alert";
import JSZip from "jszip";
import {
  FaClipboardList,
  FaSearch,
  FaEyeSlash,
  FaEye,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import {
  EliminarDocumento,
  ObtenerDocumento,
  ObtenerDocumentosDescarga,
  // ObtenerDocumentosPorContenido,
} from "../../../servicios/ServicioDocumentos";
import { InsertarRegistrosHistorial } from "../../../servicios/ServiceHistorial";
import { format } from "date-fns";
import { LuSearchX } from "react-icons/lu";
import { AiOutlineFileSearch } from "react-icons/ai";
import { recortarTexto } from "../../../utils/utils";
import { useSpinner } from "../../../context/spinnerContext";
import Select from "react-select"
import { BusquedaSolicitudIHTT, ObtenerCriterioBusqueda } from "../../../servicios/ServicioCriterioBusqueda";

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

// Componente funcional que representa la página de carga de archivops
function BuscarArchivos() {
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showObservacionesEliminar, setShowObservacionesEliminar] =
    useState(false);
  const [documentoVer, setDocumentoVer] = useState<Archivo>();
  const [listaArchivosTabla, setListaArchivosTabla] = useState<Archivo[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Archivo>();
  const [documentoEditado, setDocumentoEditado] = useState(false);
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const [criterioBusquedaId, setCriterioBusquedaId] = useState("");
  const [criterioBusquedaText, setCriterioBusquedaText] = useState("");
  const [criteriosBusqueda, setCriteriosBusqueda] = useState<any[]>([]);
  const [paramBusqueda, setParamBusqueda] = useState("");
  const [regExp, setRegExp] = useState<RegExp>(/.*/);

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  const [autor, setAutor] = useState("");
  const [asunto, setAsunto] = useState("");
  const [observacionEliminacion, setObservacionEliminacion] = useState("");
  //const [departamento, setDepartamento] = useState("");
  //const [confidencialidad, setConfidencialidad] = useState("");
  const [contenidoRelevante, setContenidoRelevante] = useState("");
  const [numeroExpediente, setNumeroExpediente] = useState("");
  const [numeroSolicitud, setNumeroSolicitud] = useState("");
  const [docPadre, setDocPadre] = useState("");
  const [docHijo, setDocHijo] = useState("");
  const [titulo, setTitulo] = useState("");
  const { setShowSpinner } = useSpinner();
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

  useEffect(() => {
    obtenerCriteriosBusqueda();
  }, []);

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
    setListaArchivosTablaSeleccionados([]);
    // Convertir fechas vacías a null
    const fechaInicio = fechaFiltroInicial === null ? null : fechaFiltroInicial;
    const fechaFin = fechaFiltroFinal === null ? null : fechaFiltroFinal;

    // Validar que se hayan ingresado las fechas
    if(!fechaInicio || !fechaFin){
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Debe ingresar las fechas de búsqueda",
      });
      setPendiente(false);
      return;
    }

    // Validar que la fecha final no sea menor que la fecha inicial
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "La fecha final no puede ser menor que la fecha inicial.",
      });
      setPendiente(false);
      return;
    }

    // Validar que se haya elegido un criterio de búsqueda
    if(criterioBusquedaText === ''){
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Debe seleccionar un criterio de búsqueda"
      });
      setPendiente(false);
      return;
    }

    // Validar que se haya ingresado un parámetro de búsqueda
    if(paramBusqueda.trim() === ''){
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Debe ingresar un parámetro de búsqueda"
      });
      setPendiente(false);
      return;
    }

    // Validar cual método de API llamar
    if(criterioBusquedaText.trim().toLowerCase() === 'solicitud'){

      const filtro = {
        numSolicitud: paramBusqueda,
        fechaFiltroInicial:
          fechaFiltroInicial === null ? null : fechaFiltroInicial,
        fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal
      };    

      const resultadosObtenidos = await ObtenerDocumento(filtro);
    
      setListaArchivosTabla(resultadosObtenidos);
      setPendiente(false);
      setContenido("");

      if (resultadosObtenidos.length === 0) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 2,
          mensaje: "No hay registros con los parámetros indicados",
        });
      } else {
        setMostrarBusqueda(!mostrarBusqueda);
      }
    }
    else{
      const filtro = {
        fechaInicio: fechaInicio,
        fechaFinal: fechaFin,
        nombreApoderado: criterioBusquedaText.toLowerCase().trim() === 'apoderado' ? paramBusqueda : null,
        nombreSolicitante: criterioBusquedaText.toLowerCase().trim() === 'solicitante' ? paramBusqueda : null,
        rtnSolicitante: criterioBusquedaText.toLowerCase().trim() === 'id/rtn' ? paramBusqueda : null,
        numeroExpediente: criterioBusquedaText.toLowerCase().trim() === 'expediente' ? paramBusqueda : undefined,
        codigoCertificado: criterioBusquedaText.toLowerCase().trim() === 'certificado' ? paramBusqueda : null,
        codigoPermiso: criterioBusquedaText.toLowerCase().trim() === 'permiso' ? paramBusqueda : null,
        placa: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null,
        //placaIngresa: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null, // Validar
        //preforma: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null,
        codigoGea: criterioBusquedaText.toLowerCase().trim() === 'gea' ? paramBusqueda : null,
        // regional: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null
        // solicitudAnterior: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null
      }

      var response = await BusquedaSolicitudIHTT(filtro);

      if(response.indicador){
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Ocurrió un error al buscar solicitudes"
        });
        setPendiente(false);
      }

      if(response.length === 0){
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 2,
          mensaje: "No hay registros con los parámetros indicados"
        });
        setPendiente(false);
      }
      else{
        setMostrarBusqueda(!mostrarBusqueda);

        var solics = "";

        response.forEach((element: any) => {
          solics += solics === "" ? element.codigoSolicitud : "," + element.codigoSolicitud;
        });

        const filtroDocs = {
          numSolicitud: solics,
          fechaFiltroInicial:
            fechaFiltroInicial === null ? null : fechaFiltroInicial,
          fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal
        };    
  
        const resultadosObtenidos = await ObtenerDocumento(filtroDocs);

        if(resultadosObtenidos.length === 0){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "No hay registros con los parámetros indicados"
          });
          setPendiente(false);
        }
        else{        
          setListaArchivosTabla(resultadosObtenidos);
          setPendiente(false);
          setContenido("");
        }
      }
    } 
  };

  // const handleBuscarPorContenidoClick = async () => {
  //   setPendiente(true);

  //   if (contenido !== "") {
  //     // Llama a ObtenerArchivos solo cuando se hace clic en "Buscar"
  //     //console.log('filtro del buscar antes de ejecutar el sp')
  //     //console.log(filtro)
  //     const resultadosObtenidos = await ObtenerDocumentosPorContenido({
  //       archivosBuscar: listaArchivosTabla.map((a) => a.idDocumento + ""),
  //       contenido,
  //     });

  //     if (resultadosObtenidos.indicador === 0) {
  //       const coincidencias = resultadosObtenidos.datos;
  //       const archivosContenido = listaArchivosTabla.filter((a) =>
  //         coincidencias.some((s: any) => s.idDocumento === a.idDocumento + "")
  //       );
  //       console.log(coincidencias);
  //       setListaArchivosTabla(archivosContenido);
  //       setPendiente(false);
  //       setListaArchivosTablaSeleccionados([]);
  //       //setContenido("");

  //       if (archivosContenido.length === 0) {
  //         setShowAlert(true);
  //         setMensajeRespuesta({
  //           indicador: 2,
  //           mensaje: "No se encontraron resultados.",
  //         });
  //       }
  //     }
  //   }
  // };

  const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };
  //handleEliminarArchivos
  const handleEliminarArchivos = async (e: any) => {
    e.preventDefault();

    setShowSpinner(true);
    const response = await EliminarDocumento({
      observaciones: observacionEliminacion,
      docs: listaArchivosTablaSeleccionados,
      usuario: identificacionUsuario,
    });
    setShowSpinner(false);
    setShowAlert(true);
    console.log(response);
    if (response) {
      setMensajeRespuesta({
        indicador: response.indicador,
        mensaje: response.mensaje,
      });
      setObservacionEliminacion("");
      setShowObservacionesEliminar(false);
      handleBuscarClick();
    } else {
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ha ocurrido un error inesperado al eliminar.",
      });
    }

    console.log("hola");
  };

  const handleDescargarArchivos = async () => {
    const historialData = []; //hisorial
    let descripcionError = "";
    let detalleError = "";
    let estado = "Exitoso";

    const idDocumentosDescargar = listaArchivosTablaSeleccionados.map(
      (a) => a.idDocumento
    );
    setShowSpinner(true);
    try {
      const response = await ObtenerDocumentosDescarga(idDocumentosDescargar);
      setShowSpinner(false);
      if (response.indicador === 1) {
        setMensajeRespuesta({
          indicador: response.indicador,
          mensaje: response.mensaje,
        });

        descripcionError = "Error al descargar archivo";
        detalleError = response.mensaje;
        estado = "Error";
      } else {
        if (response.datos.length > 0) {
          try {
            const archivos = response.datos;
            if (archivos.length > 1) {
              descargarArchivosZip(archivos);
            } else {
              const archivo = archivos[0];
              const byteArray = base64ToUint8Array(archivo.bytesArchivo);
              console.log(archivo);
              const blob = new Blob([byteArray], { type: archivo.formato });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", archivo.nombre);
              document.body.appendChild(link);
              link.click();
              link.parentNode?.removeChild(link);
              window.URL.revokeObjectURL(url);
            }
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 0,
              mensaje: "Documentos descargados correctamente.",
            });
          } catch (error) {
            descripcionError = "Error al descargar archivo";
            if (error instanceof Error) {
              detalleError = error.message; // Usamos el mensaje del error
            }
            estado = "Error";

            console.error("Error al descargar los archivos:", error);
          }
        } else {
          descripcionError = "Error al descargar archivo";
          detalleError = "No se ha encontrado el archivo a descargar.";
          estado = "Error";

          setShowAlert(true);
          setMensajeRespuesta({
            indicador: response.indicador,
            mensaje: "No se ha encontrado el archivo a descargar.",
          });
        }
      }
    } catch (error) {
      descripcionError = "Error al descargar archivo";
      if (error instanceof Error) {
        detalleError =
          "No se ha podido establecer conexión con el servidor de descarga.";
      }
      estado = "Error";
      console.error("Error al descargar los archivos:", error);
      setShowAlert(true);

      setMensajeRespuesta({
        indicador: 1,
        mensaje:
          "Error. No se ha podido establecer conexión con el servidor de descarga.",
      });
    }
    // Registrar en historial exito o error
    for (const archivo of listaArchivosTablaSeleccionados) {
      historialData.push({
        IdDocumento: archivo.idDocumento,
        NombreDocumento: archivo.nomDocumento,
        IdAccion: 5,
        Descripcion:
          descripcionError !== ""
            ? descripcionError
            : "El documento se descargó correctamente.",
        DetalleError: detalleError,
        Fecha: new Date(),
        Usuario: archivo.usuarioCreacion,
        Estado: estado,
      });
    }

    try {
      await InsertarRegistrosHistorial(historialData);
    } catch (error) {
      console.log(error);
    }
  };

  const descargarArchivosZip = (archivos: any) => {
    setShowSpinner(true);
    const zip = new JSZip();

    archivos.forEach((archivo: any) => {
      const byteArray = base64ToUint8Array(archivo.bytesArchivo);
      zip.file(archivo.nombre, byteArray, { binary: true });
    });

    zip
      .generateAsync({ type: "blob" })
      .then((content: any) => {
        const url = window.URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "documentos.zip"); // Nombre del archivo ZIP
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch((error: any) => {
        throw error;
      });
    setShowSpinner(false);
  };

  // const countEmptyFields = () => {
  //   let count = 0;
  //   // Cuenta los campos que no están vacíos
  //   if (autor !== "") count++;
  //   if (asunto !== "") count++;
  //   if (opcionDepartamento !== "") count++;
  //   if (contenidoRelevante !== "") count++;
  //   if (numeroExpediente !== "") count++;
  //   if (numeroSolicitud !== "") count++;
  //   if (docPadre !== "") count++;
  //   if (docHijo !== "") count++;
  //   if (titulo !== "") count++;
  //   if (nombre !== "") count++;
  //   if (fechaFiltroInicial !== null && fechaFiltroFinal !== null) count++;
  //   else if (
  //     (fechaFiltroInicial !== null && fechaFiltroFinal == null) ||
  //     (fechaFiltroFinal !== null && fechaFiltroInicial == null)
  //   )
  //     count = 0;

  //   return count;
  // };

  const areInputsEmpty = () => {
    //return countEmptyFields() < 3; // Valida si hay menos de 3 campos llenos
    return false;
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
    console.log(archivo);
  };

  // const handleInputChange = (e: any) => {
  //   if (documentoSeleccionado) {
  //     setDocumentoSeleccionado({
  //       ...documentoSeleccionado,
  //       [e.target.name]: e.target.value,
  //     });
  //   }
  // };

  const handleFilaSeleccionada = (row: Archivo) => {
    seleccionarDocumento(row);
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

  const handleModalEliminar = () => {
    setShowObservacionesEliminar(!showObservacionesEliminar);
  };
  const abrirInformacionArchivo = (row: Archivo, editar = false) => {
    setDocumentoSeleccionado(row);
    setShowModal(true);
    setDocumentoEditado(editar);
  };
  const [mostrarDiv, setMostrarDiv] = useState(true);

  const toggleDiv = () => {
    setMostrarDiv((prev) => !prev); // Alterna el estado
    setMostrarBusqueda((prev) => !prev);
  };

  const obtenerCriteriosBusqueda = async () =>{
    const response = await ObtenerCriterioBusqueda(true);
    
    if(!response){
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error al obtener los criterios de búsqueda"
      });
    }
    else{
      setCriteriosBusqueda(response);
    }
  }

  const handleCriterioBusqueda = (criterio: any) => {
    const criterioText = criteriosBusqueda.filter((x: any) => x.idCriterioBusqueda === criterio)[0].criterioBusqueda;
    const regularExp = criteriosBusqueda.filter((x: any) => x.idCriterioBusqueda === criterio)[0].expresionRegular;

    setParamBusqueda("");
    setCriterioBusquedaText(criterioText);
    setCriterioBusquedaId(criterio);
    setRegExp(new RegExp(regularExp));
  }

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

      <CustomModal
        showSubmitButton={true}
        show={showObservacionesEliminar}
        onHide={handleModalEliminar}
        title={"Eliminar documentos seleccionados"}
        formId="formObservacionEliminacion"
        submitButtonLabel={"Confirmar"}
      >
        <Form id="formObservacionEliminacion" onSubmit={handleEliminarArchivos}>
          <Row>
            <Col md={12}>
              <Form.Group controlId="formObservacion">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  type="text"
                  name="observacionEliminacion"
                  value={observacionEliminacion}
                  required={true}
                  onChange={(e: any) => {
                    setObservacionEliminacion(e.target.value);
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiOutlineFileSearch size={34} style={{ marginTop: "10px" }} />
              <h1 className="title">Buscar archivos</h1>
            </div>
          </Col>
          <Col md={2} className="d-flex justify-content-start">
            {
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
            }
            {/* <button onClick={toggleDiv}>
                {mostrarDiv ? 'Ocultar' : 'Mostrar'} Div
              </button> */}
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
                className={`contenedorFiltro ${mostrarDiv ? "mostrar" : ""}`}
              >
                <div
                  className="d-flex flex-column"
                  style={{ padding: "0 10px" }}
                >
                  <h4 className="h4Estilo">Filtro de búsqueda</h4>
                </div>
                <div
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
                      placeholderText="Fecha inicial"
                    />
                  </Form.Group>
                </div>

                <div
                  className="d-flex flex-column"
                  style={{ padding: "0 10px" }}
                >
                  <br />
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
                      placeholderText="Fecha final"
                    />
                  </Form.Group>
                </div>

                <div
                  className="d-flex flex-column"
                  style={{ padding: "0 10px" }}
                >
                  <br />
                  <label htmlFor="FechaFiltroFinal">
                    <b>Criterio de búsqueda</b>
                  </label>
                  <Form.Group>
                  <Select
                      onChange={(e: any) => handleCriterioBusqueda(e.value)}
                      className="GrupoFiltro"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'
                        }),
                      }}
                      placeholder="Seleccione"
                      options={criteriosBusqueda.map((x: any) => ({
                        value: x.idCriterioBusqueda,
                        label: x.criterioBusqueda                        
                      }))}      
                      value={
                        criterioBusquedaText !== '' ?
                          ({ 
                            value: criterioBusquedaId,
                            label: criterioBusquedaText
                          })
                        : null
                      }
                    /> 
                  </Form.Group>
                </div>

                <div
                  className="d-flex flex-column"
                  style={{ padding: "0 10px" }}
                >
                  <br />
                  <label htmlFor="FechaFiltroFinal">
                    <b>Parámetro de búsqueda</b>
                  </label>
                  <Form.Group>
                  <Form.Control
                      className="GrupoFiltro"
                      type="text"
                      value={paramBusqueda}
                      placeholder="Parámetro de búsqueda"
                      onChange={(e) => {
                        const value = e.target.value;
                    
                        // Si el valor cumple con la expresión regular, actualiza el estado
                        if (regExp.test(value) || value === '') {
                          setParamBusqueda(value);
                        }
                      }}
                    />
                  </Form.Group>
                </div>

                
                <div
                  className="d-flex flex-column mt-auto p-3"
                  style={{ padding: "3px 10px", alignSelf: "flex-end" }}
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
                </div>
              </div>
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
                        botonesAccion={[
                          {
                            condicion:
                              listaArchivosTablaSeleccionados.length > 0,
                            accion: handleDescargarArchivos,
                            icono: <FaDownload className="me-2" size={24} />,
                            texto: "Descargar seleccionados",
                          },
                          {
                            condicion:
                              listaArchivosTablaSeleccionados.length > 0,
                            accion: () => setShowObservacionesEliminar(true),
                            icono: <FaTrash className="me-2" size={24} />,
                            texto: "Eliminar seleccionados",
                          },
                        ]}
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

export default BuscarArchivos;
