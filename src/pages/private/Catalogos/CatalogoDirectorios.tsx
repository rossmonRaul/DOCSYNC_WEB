import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import CustomModal from "../../../components/modal/CustomModal";

import { Grid } from "../../../components/table/tabla";
import { ObtenerSeries, CrearSerie, EliminarSerie, ActualizarSerie, ImportarSeries } from "../../../servicios/ServicioSerie";
import { ObtenerSubseries, CrearSubserie, EliminarSubserie, ActualizarSubserie, ImportarSubseries } from "../../../servicios/ServicioSubserie";
import { ObtenerExpedientes, CrearExpediente, EliminarExpediente, ActualizarExpediente, ImportarExpedientes } from "../../../servicios/ServicioExpediente";
import { FaBan, FaDownload, FaRedo, FaUpload } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import * as XLSX from "xlsx";
import { RiSaveFill } from "react-icons/ri";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";
import Select from "react-select";
import BootstrapSwitchButton from "bootstrap-switch-button-react";

// Interfaz para la información de directorio
interface Directorios {
  idSerie: string;
  idSubserie: string;
  idExpediente: string;
  nomSerie: string;
  nomSubserie: string;
  nomExpediente: string;
  usuarioCreacion: string;
  usuarioModificacion: string;
  fechaCreacion: string;
  estado: boolean;
}

// Definición de tipos para la respuesta
interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

// Componente principal
function CatalogoPersonas() {
    const { setShowSpinner } = useSpinner();
    
    //   const identificacionUsuario = localStorage.getItem("identificacionUsuario");
    //   const [listaSeries, setListaSeries] = useState<Serie[]>([]);
    //   const [listaSubseries, setListaSubseries] = useState<Subserie[]>([]);
    //   const [listaExpedientes, setListaExpedientes] = useState<Expediente[]>([]);
    //   const [tipoSeleccionado, setTipoSeleccionado] = useState<'serie' | 'subserie' | 'expediente'>('serie');
    //   const [filtroNombre, setFiltroNombre] = useState('');
    //   const [filtroEstado, setFiltroEstado] = useState<boolean | null>(null);
    
    //   const [showModal, setShowModal] = useState(false);
    //   const [nuevaSerie, setNuevaSerie] = useState<Per>({
    //     idPersona: "0",
    //     departamento: "0",
    //     email: "",
    //     identificacion: "",
    //     nombreCompleto: "",
    //     puesto: "0",
    //     telefono: "",
    //     usuarioCreacion: identificacionUsuario ? identificacionUsuario : "",
    //     usuarioModificacion: "",
    //     fechaCreacion:"",
    //     estado: false
    //   });
    //   const [isEditing, setIsEditing] = useState(false);
    //   const [showAlert, setShowAlert] = useState(false);
    //   const [mensajeRespuesta, setMensajeRespuesta] = useState({
    //     indicador: 0,
    //     mensaje: "",
    //   });
    //   const { openConfirm } = useConfirm();
    
    //   const [showModalImportar, setShowModalImportar] = useState(false);
    //   const [listaPersonasImportar, setListaPersonasImportar] = useState<Persona[]>(
    //     []
    //   );
    //   const [showImportButton, setShowImportButton] = useState(false);
    //   const [file, setFile] = useState(null);
    
    // //   useEffect(() => {
    // //     obtenerDeps();
    // //     obtenerPuestos();
    // //     obtenerPersonas();
    // //   }, []);
    
    // //   // Función para obtener todas las personas
    // //   const obtenerPersonas = async () => {
    // //     setShowSpinner(true);
    // //     try {
    // //       const personas = await ObtenerPersonas();
    // //       setListaPersonas(personas);
    // //     } catch (error) {
    // //       console.error("Error al obtener personas:", error);
    // //     } finally {
    // //       setShowSpinner(false);
    // //     }
    // //   };
}
export default CatalogoPersonas;
