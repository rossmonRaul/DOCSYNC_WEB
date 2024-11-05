import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { AlertDismissible } from "../../../components/alert/alert";
import JSZip from "jszip";
import {
  FaClipboardList,
  FaSearch,
  FaEyeSlash,
  FaEye,
  FaDownload,
  FaTrash,
  FaEnvelope,
} from "react-icons/fa";
import { VisorArchivos } from "../../../components/visorArchivos/visorArchivos";
import CustomModal from "../../../components/modal/CustomModal";
import {
  EliminarDocumento,
  EnviarArchivoPorCorreo,
  ObtenerCantDocumentos,
  ObtenerDocumento,
  ObtenerDocumentosDescarga,
  // ObtenerDocumentosPorContenido,
} from "../../../servicios/ServicioDocumentos";
import { InsertarRegistrosHistorial } from "../../../servicios/ServiceHistorial";
import { format } from "date-fns";
import { AiOutlineFileSearch } from "react-icons/ai";
import { recortarTexto } from "../../../utils/utils";
import { useSpinner } from "../../../context/spinnerContext";
import Select from "react-select";
import {
  BusquedaSolicitudIHTT,
  ObtenerCriterioBusqueda,
} from "../../../servicios/ServicioCriterioBusqueda";
import { InsertarRegistroBitacora } from "../../../servicios/ServicioBitacora";
import { GridPags } from "../../../components/table/tablaPags";
import { RiAddLine, RiMailSendFill } from "react-icons/ri";
import { Grid } from "../../../components/table/tabla";
import { useConfirm } from "../../../context/confirmContext";

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
  const [tipoValidacion, setTipoValidacion] = useState("");
  const [tamPag, setTamPag] = useState(0);
  const [numPag, setNumPag] = useState(0);
  const [cantRegs, setCantRegs] = useState(0);
  const [filtros, setFiltros] = useState<any>({});
  const [nomArchivo, setNomArchivo] = useState("");
  const [correo, setCorreo] = useState("");
  const [listaCorreos, setListaCorreos] = useState<any>([]);
  const [showModalCorreo, setShowModalCorreo] = useState(false);
  const [emailDest, setEmailDest] = useState("");
  const { openConfirm } = useConfirm();
  const [idDocEnviar, setIdDocEnviar] = useState("");
  const [nombreBuscar, setNombreBuscar] = useState("");
  const [archivoEnviar, setArchivoEnviar] = useState("");
  const [esEnvioMasivo, setEsEnvioMasivo] = useState(false);
  const nombreArchivoMasivo = "Documentos.zip";

  const [mostrarBusqueda, setMostrarBusqueda] = useState(true);
  const [pendiente, setPendiente] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  const [observacionEliminacion, setObservacionEliminacion] = useState("");
  const { setShowSpinner } = useSpinner();
  const [fechaFiltroInicial, setFechaFiltroInicial] = useState<Date | null>(
    null
  );
  const [fechaFiltroFinal, setFechaFiltroFinal] = useState<Date | null>(null);
  const [contenido, setContenido] = useState("");
  const [primerCarga, setPrimerCarga] = useState(true);
  const [listaArchivosTablaSeleccionados, setListaArchivosTablaSeleccionados] =
    useState<Archivo[]>([]);

  useEffect(() => {
    obtenerCriteriosBusqueda();
  }, []);

  useEffect(() => {
    if (!primerCarga) {
      handleBuscarClick();
    } else {
      setPrimerCarga(false);
    }
  }, [nombreBuscar]);

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
      width: "12%",
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
      width: "35%",
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
      width: "10%",
    },
    {
      id: "No.Solicitud",
      name: "No.Solicitud",
      selector: (row: Archivo) => {
        return row.numSolicitud;
      },
      head: "No. Solicitud",
      sortable: true,
      style: {
        fontSize: "1.5em",
      },
      omit: documentoVer != null,
      width: "15%",
    },
    {
      id: "FechaCarga",
      name: "Fecha carga",
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
      width: "14%",
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
          <Button
            onClick={() => handleModalCorreo(row)}
            size="sm"
            className="bg-secondary me-2"
          >
            <FaEnvelope />
          </Button>
        </div>
      ),
      head: "Seleccionar",
      sortable: false,
      width: "14%",
    },
  ];

  const onBuscarDocNombre = async (e: any) => {
    e.preventDefault();
    setNombreBuscar(e.target.value);
  };

  const handleBuscarClick = async () => {
    console.log(nombreBuscar);
    setPendiente(true);
    setListaArchivosTabla([]);
    setListaArchivosTablaSeleccionados([]);

    // Convertir fechas vacías a null
    const fechaInicio = fechaFiltroInicial === null ? null : fechaFiltroInicial;
    const fechaFin = fechaFiltroFinal === null ? null : fechaFiltroFinal;

    if (fechaInicio && fechaFin) {
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
    }

    // Validar que se haya ingresado un parámetro búsqueda si eligió un criterio
    if (paramBusqueda.trim() === "" && criterioBusquedaText !== "") {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Debe ingresar un parámetro de búsqueda válido",
      });
      setPendiente(false);
      return;
    }

    if (paramBusqueda.trim() !== "") {
      // Validar que el parámetro de búsqueda cumpla con la expresión regular del tipo de validación
      if (!regExp.test(paramBusqueda)) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje:
            'El parámetro ingresado no cumple con el tipo de validación: "' +
            tipoValidacion +
            '"',
        });
        setPendiente(false);
        return;
      }
    }

    // Validar cual método de API llamar
    setShowSpinner(true);
    if (criterioBusquedaText.trim().toLowerCase() === "solicitud") {
      setShowAlert(false);

      const filtro = {
        nomDocumento: nombreBuscar,
        numSolicitud: paramBusqueda,
        fechaFiltroInicial:
          fechaFiltroInicial === null ? null : fechaFiltroInicial,
        fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal,
        tamannoPagina: tamPag === 0 ? 10 : tamPag,
        numeroPagina: numPag === 0 ? 1 : numPag,
        usuarioBusqueda: identificacionUsuario,
      };

      setFiltros(filtro);

      const cantRegistros = await ObtenerCantDocumentos(filtro);

      if (cantRegistros > 0) {
        setCantRegs(cantRegistros);

        const resultadosObtenidos = await ObtenerDocumento(filtro);

        setListaArchivosTabla(resultadosObtenidos);
        setPendiente(false);
        setContenido("");

        setMostrarBusqueda(!mostrarBusqueda);
      } else {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 2,
          mensaje: "No hay registros con los parámetros indicados",
        });
        setPendiente(false);
      }
    } else {
      setShowAlert(false);

      const filtro = {
        fechaInicio: fechaInicio,
        fechaFinal: fechaFin,
        nombreApoderado:
          criterioBusquedaText.toLowerCase().trim() === "apoderado"
            ? paramBusqueda
            : null,
        nombreSolicitante:
          criterioBusquedaText.toLowerCase().trim() === "solicitante"
            ? paramBusqueda
            : null,
        rtnSolicitante:
          criterioBusquedaText.toLowerCase().trim() === "id/rtn"
            ? paramBusqueda
            : null,
        numeroExpediente:
          criterioBusquedaText.toLowerCase().trim() === "expediente"
            ? paramBusqueda
            : undefined,
        codigoCertificado:
          criterioBusquedaText.toLowerCase().trim() === "certificado"
            ? paramBusqueda
            : null,
        codigoPermiso:
          criterioBusquedaText.toLowerCase().trim() === "permiso"
            ? paramBusqueda
            : null,
        placa:
          criterioBusquedaText.toLowerCase().trim() === "placa"
            ? paramBusqueda
            : null,
        //placaIngresa: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null, // Validar
        //preforma: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null,
        codigoGea:
          criterioBusquedaText.toLowerCase().trim() === "gea"
            ? paramBusqueda
            : null,
        // regional: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null
        // solicitudAnterior: criterioBusquedaText.toLowerCase().trim() === 'placa' ? paramBusqueda : null
        usuarioBusqueda: identificacionUsuario,
      };

      var response = await BusquedaSolicitudIHTT(filtro);

      if (response.indicador) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Ocurrió un error al buscar solicitudes",
        });
        setPendiente(false);
      }

      if (response.length === 0) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 2,
          mensaje: "No hay registros con los parámetros indicados",
        });
        setPendiente(false);
      } else {
        var solics = "";

        response.forEach((element: any) => {
          solics +=
            solics === ""
              ? element.codigoSolicitud
              : "," + element.codigoSolicitud;
        });

        const filtroDocs = {
          nomDocumento: nombreBuscar,
          numSolicitud: solics,
          fechaFiltroInicial:
            fechaFiltroInicial === null ? null : fechaFiltroInicial,
          fechaFiltroFinal: fechaFiltroFinal === null ? null : fechaFiltroFinal,
          tamannoPagina: tamPag === 0 ? 10 : tamPag,
          numeroPagina: numPag === 0 ? 1 : numPag,
          usuarioBusqueda: identificacionUsuario,
        };

        setFiltros(filtroDocs);

        const cantRegistros = await ObtenerCantDocumentos(filtroDocs);

        if (cantRegistros > 0) {
          setCantRegs(cantRegistros);

          const resultadosObtenidos = await ObtenerDocumento(filtroDocs);

          setListaArchivosTabla(resultadosObtenidos);
          setPendiente(false);
          setContenido("");

          setMostrarBusqueda(!mostrarBusqueda);
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 2,
            mensaje: "No hay registros con los parámetros indicados",
          });
          setPendiente(false);
        }
      }
    }
    setShowSpinner(false);
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
            var idS = "";

            if (archivos.length > 1) {
              descargarArchivosZip(archivos);

              // Se toman ids de los documentos para guardar en bitácora
              archivos.forEach((element: any) => {
                idS +=
                  idS === "" ? element.idDocumento : ", " + element.idDocumento;
              });
            } else {
              const archivo = archivos[0];
              const byteArray = base64ToUint8Array(archivo.bytesArchivo);
              const blob = new Blob([byteArray], { type: archivo.formato });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", archivo.nombre);
              document.body.appendChild(link);
              link.click();
              link.parentNode?.removeChild(link);
              window.URL.revokeObjectURL(url);

              // Se toma id del documento para guardar en bitácora
              idS = archivo.idDocumento;
            }
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 0,
              mensaje: "Documentos descargados correctamente.",
            });

            // Se agrega registro en bitácora de la descarga realizada
            InsertarRegistroBitacora({
              idAccion: 5,
              descripcion: "Se descargan los documentos con id: " + idS,
              fecha: new Date().toISOString(),
              usuario: identificacionUsuario,
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
          detalleError = "No se ha encontrado el archivo a descargar";
          estado = "Error";

          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: detalleError,
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
        link.setAttribute("download", nombreArchivoMasivo);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch((error: any) => {
        throw error;
      });
    setShowSpinner(false);
  };

  const crearZipCorreo = async (archivos: any[]): Promise<Blob> => {
    const zip = new JSZip();

    archivos.forEach((archivo: any) => {
      const byteArray = base64ToUint8Array(archivo.bytesArchivo);
      zip.file(archivo.nombre, byteArray, { binary: true });
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      return content;
    } catch (error) {
      throw error;
    }
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

  //////////////////////////////

  const handleVisor = () => {
    setDocumentoVer(undefined);
  };

  const handleVerArchivo = (archivo: Archivo) => {
    setDocumentoVer(archivo);

    InsertarRegistroBitacora({
      idAccion: 7,
      descripcion: "Se visualiza el documento " + archivo.idDocumento,
      fecha: new Date().toISOString(),
      usuario: identificacionUsuario,
    });
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

  const obtenerCriteriosBusqueda = async () => {
    const response = await ObtenerCriterioBusqueda(true);

    if (!response) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error al obtener los criterios de búsqueda",
      });
    } else {
      setCriteriosBusqueda(response);
    }
  };

  const handleCriterioBusqueda = (criterio: any) => {
    const crit = criteriosBusqueda.filter(
      (x: any) => x.idCriterioBusqueda === criterio
    )[0];

    const criterioText = crit.criterioBusqueda;
    const regularExp = crit.expresionRegular;
    const tipoV = crit.validacion;

    setParamBusqueda("");
    setCriterioBusquedaText(criterioText);
    setCriterioBusquedaId(criterio);
    setTipoValidacion(tipoV);
    setRegExp(new RegExp(regularExp));
  };

  // Paginación
  const fetchData = async (pag: any, tamPagina: any) => {
    const obtenerDocs = pag !== numPag || tamPagina !== tamPag;

    if (obtenerDocs && listaArchivosTabla.length > 0) {
      setTamPag(tamPagina);
      setNumPag(pag);

      filtros.numeroPagina = pag;
      filtros.tamannoPagina = tamPagina;

      const response = await ObtenerDocumento(filtros);

      setListaArchivosTabla(response);
    }

    return {
      data: listaArchivosTabla,
      total: cantRegs,
    };
  };

  // Envío por correo
  const handleModalCorreo = (archivo?: any, envioMasivo?: any) => {
    setShowModalCorreo(!showModalCorreo);
    setCorreo("");
    setListaCorreos([]);
    setEmailDest("");
    if (!envioMasivo) {
      setIdDocEnviar(archivo?.idDocumento ?? "");
      setArchivoEnviar(archivo?.nomDocumento ?? "");
      setNomArchivo(archivo?.nomDocumento ?? "");
    } else {
      const idDocumentosDescargar = listaArchivosTablaSeleccionados.map(
        (a) => a.idDocumento
      );
      var docs = "";

      idDocumentosDescargar.forEach((x: any) => {
        docs += docs === "" ? x : "," + x;
      });

      setIdDocEnviar(docs);
      setArchivoEnviar(nombreArchivoMasivo);
      setNomArchivo(nombreArchivoMasivo);
    }
    setEsEnvioMasivo(envioMasivo);
  };

  const handleEnviaPorCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAlert(false);
    try {
      if (listaCorreos.length < 1) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 2,
          mensaje:
            "Debe agregar al menos un destinatario para enviar el archivo por correo electrónico",
        });
      } else {
        if (esEnvioMasivo) {
          const idDocs = [] as any;

          idDocEnviar.split(",").forEach((x: any) => {
            idDocs.push(x);
          });

          setShowSpinner(true);
          const responseArchivos = await ObtenerDocumentosDescarga(idDocs);
          setShowSpinner(false);

          if (!responseArchivos) {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: "Ocurrió un error conectar con el servicio de descarga",
            });
          } else if (responseArchivos.indicador === 1) {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje:
                "Ocurrió un error al obtener los archivos para enviar por correo",
            });
          } else if (responseArchivos.datos.length < 1) {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: "No encontraron los archivos seleccionados",
            });
          } else {
            const archivos = responseArchivos.datos;
            const archivoZIP = await crearZipCorreo(archivos);
            var idS = "";

            // Se toman ids de los documentos para guardar en bitácora
            archivos.forEach((element: any) => {
              idS +=
                idS === "" ? element.idDocumento : ", " + element.idDocumento;
            });

            setIdDocEnviar(idS);

            var correosDest = "";

            listaCorreos.forEach((x: any) => {
              correosDest += correosDest === "" ? x : "," + x;
            });

            const formData = new FormData();
            formData.append("Archivo", archivoZIP, nombreArchivoMasivo);
            formData.append("Correos", correosDest);
            formData.append("IdDocumento", idDocEnviar);
            formData.append("NombreArchivo", archivoEnviar);
            formData.append("Fecha", new Date().toISOString());
            formData.append("Usuario", identificacionUsuario ?? "");

            setShowSpinner(true);
            const response = await EnviarArchivoPorCorreo(formData);
            setShowSpinner(false);

            if (response.indicador === 1) {
              setShowAlert(true);
              setMensajeRespuesta({
                indicador: response.indicador,
                mensaje: response.mensaje,
              });
            } else {
              setShowAlert(true);
              setMensajeRespuesta({
                indicador: 0,
                mensaje:
                  "Archivo enviado correctamente a los correos indicados",
              });
              handleModalCorreo();
            }
          }
        } else {
          const idDocs = [];
          idDocs.push(idDocEnviar);

          setShowSpinner(true);
          const responseArchivo = await ObtenerDocumentosDescarga(idDocs);
          setShowSpinner(false);

          if (!responseArchivo) {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: "No se pudo obtener el archivo para enviar por correo",
            });
          } else if (responseArchivo.datos.length > 0) {
            if (responseArchivo.indicador === 1) {
              setMensajeRespuesta({
                indicador: responseArchivo.indicador,
                mensaje:
                  "Ocurrió un error al momento de obtener el archivo para enviar por correo",
              });
            } else {
              const archivos = responseArchivo.datos;
              const archivo = archivos[0];
              const byteArray = base64ToUint8Array(archivo.bytesArchivo);
              const archivoSend = new Blob([byteArray], {
                type: archivo.formato,
              });

              var correosDest = "";

              listaCorreos.forEach((x: any) => {
                correosDest += correosDest === "" ? x : "," + x;
              });

              const formData = new FormData();
              formData.append("Archivo", archivoSend, archivoEnviar ?? "");
              formData.append("Correos", correosDest);
              formData.append("IdDocumento", idDocEnviar.toString());
              formData.append("NombreArchivo", archivoEnviar ?? "");
              formData.append("Fecha", new Date().toISOString());
              formData.append("Usuario", identificacionUsuario ?? "");

              setShowSpinner(true);
              const response = await EnviarArchivoPorCorreo(formData);
              setShowSpinner(false);

              if (response.indicador === 1) {
                setShowAlert(true);
                setMensajeRespuesta({
                  indicador: response.indicador,
                  mensaje: response.mensaje,
                });
              } else {
                setShowAlert(true);
                setMensajeRespuesta({
                  indicador: 0,
                  mensaje:
                    "Archivo enviado correctamente a los correos indicados",
                });
                handleModalCorreo();
              }
            }
          } else {
            setShowAlert(true);
            setMensajeRespuesta({
              indicador: 1,
              mensaje: "No se encontró el archivo a enviar",
            });
          }
        }
      }
    } catch (error) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Ocurrió un error al enviar el archivo por correo electrónico",
      });
      console.error("Error:", error);
    }
  };

  const agregarCorreo = () => {
    setShowAlert(false);
    if (correo.trim() !== "") {
      if (
        listaCorreos.filter(
          (x: any) => x.toLowerCase() === correo.trim().toLowerCase()
        ).length > 0
      ) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Este correo ya está en la lista de destinatarios",
        });
      } else if (
        new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$").test(
          correo
        )
      ) {
        setListaCorreos((prev: any) => [...prev, correo.trim()]);

        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Correo agregado a lista de destinatarios",
        });

        setCorreo("");
      } else {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje:
            "El correo electrónico no cumple con el formato, favor validar",
        });
      }
    } else {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "Debe ingresar un correo electrónico válido",
      });
    }
  };

  const eliminarCorreo = (row: any) => {
    openConfirm(
      "¿Está seguro que desea eliminar al destinatario de la lista?",
      () => {
        setListaCorreos(listaCorreos.filter((x: any) => x !== row));

        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Destinatario eliminado",
        });
      }
    );
  };

  const encabezadoTablaModal = [
    {
      id: "categoria",
      name: "Correo electrónico",
      selector: (row: any) => row,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "acciones",
      name: "Acción",
      cell: (row: any) => (
        <>
          <Button
            size="sm"
            onClick={() => eliminarCorreo(row)}
            className="bg-secondary"
          >
            <FaTrash />
          </Button>
        </>
      ),
      width: "120px",
    },
  ];

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
                          fontSize: "16px",
                          padding: "2%",
                          outline: "none",
                          marginTop: "1%",
                        }),
                      }}
                      placeholder="Seleccione"
                      options={criteriosBusqueda.map((x: any) => ({
                        value: x.idCriterioBusqueda,
                        label: x.criterioBusqueda,
                      }))}
                      value={
                        criterioBusquedaText !== ""
                          ? {
                              value: criterioBusquedaId,
                              label: criterioBusquedaText,
                            }
                          : null
                      }
                      noOptionsMessage={() => "Opción no encontrada"}
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

                        setParamBusqueda(value);
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
                  {/* {listaArchivosTabla.length > 0 ? ( */}
                  {cantRegs > 0 ? (
                    <div className="content">
                      <GridPags
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
                          {
                            condicion:
                              listaArchivosTablaSeleccionados.length > 1,
                            accion: () => handleModalCorreo(null, true),
                            icono: (
                              <RiMailSendFill className="me-2" size={24} />
                            ),
                            texto: "Enviar archivos por correo",
                          },
                        ]}
                        gridHeading={encabezadoArchivo}
                        gridData={listaArchivosTabla}
                        selectableRows={false}
                        onSearch={onBuscarDocNombre}
                        filterColumns={["nombre"]}
                        fetchData={fetchData}
                        totalRows={cantRegs}
                      ></GridPags>
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
                      <img
                        src="/SinResultados.png"
                        style={{ width: "75%", height: "75%" }}
                      />
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

      {/* Modal para enviar archivo por correo */}
      <CustomModal
        show={showModalCorreo}
        onHide={handleModalCorreo}
        title={"Enviar archivo por correo electrónico"}
        showSubmitButton={true}
        submitButtonLabel={"Enviar"}
        formId="formEnviaCorreo"
        isEmailSend={true}
      >
        <Form id="formEnviaCorreo" onSubmit={handleEnviaPorCorreo}>
          <Row>
            <Col md={10}>
              <Form.Label>
                Nombre del archivo: <b>{nomArchivo}</b>
              </Form.Label>
              <br />
              <br />
              <Form.Label>Correo electrónico del destinatario</Form.Label>
              <Form.Control
                type="text"
                name="usuario"
                value={correo}
                placeholder="Correo electrónico del destinatario"
                onChange={(e: any) => setCorreo(e.target.value)}
                maxLength={50}
              />
            </Col>
            <Col md={2}>
              <br />
              <br />
              <br />
              <Button
                type="button"
                className="mt-3 mb-0 btn-save"
                style={{
                  display: "flex",
                  alignItems: "center",
                  alignContent: "center",
                }}
                onClick={() => agregarCorreo()}
              >
                <RiAddLine className="me-2" size={24} />
                Agregar
              </Button>
            </Col>
            <Col md={12} style={{ marginTop: "3%" }}>
              <Form.Label>Lista de destinatarios</Form.Label>
              <Grid
                gridHeading={encabezadoTablaModal}
                gridData={listaCorreos}
                selectableRows={false}
              ></Grid>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </>
  );
}

export default BuscarArchivos;
