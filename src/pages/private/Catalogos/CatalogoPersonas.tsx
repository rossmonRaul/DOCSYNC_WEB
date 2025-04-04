import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import CustomModal from "../../../components/modal/CustomModal";
import { Grid } from "../../../components/table/tabla";
import { ObtenerPersonas, CrearPersona, EliminarPersona, ActualizarPersona, ImportarPersonas } from "../../../servicios/ServicioPersonas";
import { ObtenerInstitucion } from "../../../servicios/ServicioInstitucion";
import { FaBan, FaDownload, FaRedo, FaUpload, FaInfoCircle, FaGg, FaClipboardList } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import * as XLSX from "xlsx";
import { RiSaveFill } from "react-icons/ri";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";
import { ObtenerDepartamentos } from "../../../servicios/ServicioDepartamento";
import { ObtenerPuestos } from "../../../servicios/ServicioPuesto";
import Select from "react-select";
import BootstrapSwitchButton from "bootstrap-switch-button-react";

// Interfaz para la información de la persona
interface Persona {
  idPersona: string;
  idInstitucion?: string;
  departamento: string;
  email: string;
  identificacion: string;
  nombreCompleto: string;
  nomInstitucion: string;
  puesto: string;
  telefono: string;
  usuarioCreacion: string;
  usuarioModificacion: string;
  fechaCreacion: string;
  estado: boolean;
}
interface Departamento {
  idDepartamento: string;
  nombre: string;
  idInstitucion: string;
  estado: boolean;
}

interface Puesto {
  idPuesto: string;
  nombre: string;
  idInstitucion: string;
  estado: boolean;
}

interface Institucion {
  idInstitucion: string;
  nombre: string;
  estado: boolean;
  value?: string;
  label?: string;
}

// Definición de tipos para la respuesta
interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

// Componente principal
function CatalogoPersonas() {
  const { setShowSpinner } = useSpinner();
  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const [listaPersonas, setListaPersonas] = useState<Persona[]>([]);
  const [listaPuestos, setListaPuestos] = useState<Puesto[]>([]);
  const [listaDepartamentos, setListaDepartamentos] = useState<Departamento[]>([]);
  const [listaInstituciones, setListaInstituciones] = useState<Institucion[]>([]);
  const [departamentosFiltrados, setDepartamentosFiltrados] = useState<any[]>([]);
  const [puestosFiltrados, setPuestosFiltrados] = useState<any[]>([]);
  const [idDep, setIdDep] = useState("");
  const [depText, setDepText] = useState("");
  const [idPuesto, setIdPuesto] = useState("");
  const [puestoText, setPuestText] = useState("");
  const [idInstitucion, setIdInstitucion] = useState("");
  const [institucionText, setInstitucionText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [personaDetalle, setPersonaDetalle] = useState<Persona | null>(null);
  const [nuevaPersona, setNuevaPersona] = useState<Persona>({
    idPersona: "0",
    departamento: "0",
    email: "",
    identificacion: "",
    nombreCompleto: "",
    puesto: "0",
    nomInstitucion: "",
    telefono: "",
    usuarioCreacion: identificacionUsuario ? identificacionUsuario : "",
    usuarioModificacion: "",
    fechaCreacion: "",
    estado: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });
  const { openConfirm } = useConfirm();

  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaPersonasImportar, setListaPersonasImportar] = useState<Persona[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setShowSpinner(true);
      try {
        await Promise.all([
          obtenerInstituciones(),
          obtenerDeps(),
          obtenerPuestos()
        ]);
        await obtenerPersonas();
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setShowSpinner(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Función para obtener instituciones
  const obtenerInstituciones = async () => {
    setShowSpinner(true);
    try {
      const instituciones = await ObtenerInstitucion();
      // Formatear datos para react-select
      const institucionesFormateadas = instituciones
        .filter((x: any) => x.estado)
        .map((inst: any) => ({
          ...inst,
          value: inst.idInstitucion, // necesario para react-select
          label: inst.nombre         // necesario para react-select
        }));
      setListaInstituciones(institucionesFormateadas);
    } catch (error) {
      console.error("Error al obtener instituciones:", error);
    } finally {
      setShowSpinner(false);
    }
  };
  // Función para obtener todas las personas
  const obtenerPersonas = async () => {
    setShowSpinner(true);
    try {
      const personas = await ObtenerPersonas();
      console.log("Datos recibidos:", personas);
      setListaPersonas(personas);
    } catch (error) {
      console.error("Error al obtener personas:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  // Función para obtener departamentos
  const obtenerDeps = async () => {
    setShowSpinner(true);
    try {
      const resp = await ObtenerDepartamentos();
      setListaDepartamentos(resp.filter((x: any) => x.estado));
      setDepartamentosFiltrados(resp.filter((x: any) => x.estado));
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  // Función para obtener puestos
  const obtenerPuestos = async () => {
    setShowSpinner(true);
    try {
      const resp = await ObtenerPuestos();
      setListaPuestos(resp.filter((x: any) => x.estado));
      setPuestosFiltrados(resp.filter((x: any) => x.estado));
    } catch (error) {
      console.error("Error al obtener puestos:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  // Función para eliminar una persona
  const eliminarPersona = (persona: Persona) => {
    openConfirm("¿Está seguro que desea cambiar el estado de la persona?", async () => {
      try {
        setShowSpinner(true);
        
        // Buscar departamento y puesto con verificaciones
        const depEncontrado = listaDepartamentos.find((x: any) => x.nombre === persona.departamento);
        const puestoEncontrado = listaPuestos.find((x: any) => x.nombre === persona.puesto);
  
        if (!depEncontrado || !puestoEncontrado) {
          throw new Error("No se encontró el departamento o puesto asociado");
        }
  
        const personaActualizar = {
          ...persona,
          departamento: depEncontrado.idDepartamento,
          puesto: puestoEncontrado.idPuesto,
          UsuarioModificacion: identificacionUsuario || "",
          FechaModificacion: new Date().toISOString(),
        };
  
        const response = await EliminarPersona(personaActualizar);
  
        if (response?.indicador === 0) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerPersonas();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: response?.mensaje || "Error al cambiar el estado de la persona",
          });
        }
      } catch (error) {
        console.error("Error al eliminar persona:", error);
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al cambiar el estado de la persona: " + (error instanceof Error ? error.message : String(error)),
        });
      } finally {
        setShowSpinner(false);
      }
    });
  };

  // Función para abrir el modal y editar una persona
  const editarPersona = (persona: Persona) => {
    try {
      // Obtener IDs de departamento y puesto con verificaciones
      const puestoEncontrado = listaPuestos.find((x: any) => x.nombre === persona.puesto);
      const depEncontrado = listaDepartamentos.find((x: any) => x.nombre === persona.departamento);
      const institucionEncontrada = persona.nomInstitucion 
        ? listaInstituciones.find((x: any) => x.nombre === persona.nomInstitucion)
        : null;
  
      const idPuest = puestoEncontrado?.idPuesto || "";
      const idDp = depEncontrado?.idDepartamento || "";
      const idInst = institucionEncontrada?.idInstitucion || "";
  
      setNuevaPersona({
        ...persona,
        departamento: idDp,
        puesto: idPuest
      });
      
      setIsEditing(true);
      setShowModal(true);
      setIdDep(idDp);
      setDepText(persona.departamento);
      setPuestText(persona.puesto);
      setIdPuesto(idPuest);
      setIdInstitucion(idInst);
      setInstitucionText(persona.nomInstitucion || "");
      
      // Filtrar departamentos y puestos si hay institución
      if (idInst) {
        const depsFiltrados = listaDepartamentos.filter((x: any) => x.idInstitucion === idInst);
        const puestosFiltrados = listaPuestos.filter((x: any) => x.idInstitucion === idInst);
        setDepartamentosFiltrados(depsFiltrados);
        setPuestosFiltrados(puestosFiltrados);
      } else {
        setDepartamentosFiltrados(listaDepartamentos);
        setPuestosFiltrados(listaPuestos);
      }
    } catch (error) {
      console.error("Error al preparar edición:", error);
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: "Error al preparar los datos para edición"
      });
    }
  };

  // Función para ver detalles de una persona
  const verDetallesPersona = (persona: Persona) => {
    setPersonaDetalle(persona);
    setShowDetailModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevaPersona({
      idPersona: "",
      departamento: "",
      email: "",
      identificacion: "",
      nombreCompleto: "",
      puesto: "",
      nomInstitucion: "",
      telefono: "",
      usuarioCreacion: "",
      usuarioModificacion: "",
      fechaCreacion: "",
      estado: false
    });
    setIdDep("");
    setDepText("");
    setPuestText("");
    setIdPuesto("");
    setIdInstitucion("");
    setInstitucionText("");
    setDepartamentosFiltrados(listaDepartamentos);
    setPuestosFiltrados(listaPuestos);
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaPersona({
      ...nuevaPersona,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el cambio de institución
  const handleInstitucionChange = (e: any) => {
    const idInst = e.value;
    const nombreInst = e.label;
    
    setIdInstitucion(idInst);
    setInstitucionText(nombreInst);
    setNuevaPersona({
      ...nuevaPersona,
      nomInstitucion: nombreInst
    });

    // Filtrar departamentos y puestos por institución
    if (idInst) {
      const depsFiltrados = listaDepartamentos.filter((x: any) => x.idInstitucion === idInst);
      const puestosFiltrados = listaPuestos.filter((x: any) => x.idInstitucion === idInst);
      setDepartamentosFiltrados(depsFiltrados);
      setPuestosFiltrados(puestosFiltrados);
      
      // Resetear departamento y puesto si no están en los filtrados
      if (idDep && !depsFiltrados.some(dep => dep.idDepartamento === idDep)) {
        setIdDep("");
        setDepText("");
        setNuevaPersona(prev => ({...prev, departamento: ""}));
      }
      if (idPuesto && !puestosFiltrados.some(puesto => puesto.idPuesto === idPuesto)) {
        setIdPuesto("");
        setPuestText("");
        setNuevaPersona(prev => ({...prev, puesto: ""}));
      }
    } else {
      // Mostrar todos si no se selecciona institución
      setDepartamentosFiltrados(listaDepartamentos);
      setPuestosFiltrados(listaPuestos);
    }
  };

  // Maneja el envío del formulario para agregar o editar una persona
  const handleSubmit = async (e: React.FormEvent) => {
    setShowSpinner(true);
    e.preventDefault();    

    if (isEditing) {
      // editar
      try {
        const identificacionUsuario = localStorage.getItem("identificacionUsuario");

        nuevaPersona.departamento = idDep;
        nuevaPersona.puesto = idPuesto;
        nuevaPersona.nomInstitucion = institucionText;

        const personaActualizar = {
          ...nuevaPersona,
          UsuarioModificacion: identificacionUsuario,
          FechaModificacion: new Date().toISOString(),
        };

        const response = await ActualizarPersona(personaActualizar);

        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerPersonas();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al actualizar la persona",
          });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al actualizar la persona",
        });
      }
    } else {
      // agregar persona
      try {
        const identificacionUsuario = localStorage.getItem("identificacionUsuario");
        const personaACrear = {
          ...nuevaPersona,
          idPersona: "0",
          departamento: idDep,
          puesto: idPuesto,
          nomInstitucion: institucionText,
          usuarioCreacion: identificacionUsuario,
          fechaCreacion: new Date().toISOString(),
        };
        
        const response = await CrearPersona(personaACrear);
        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerPersonas();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al crear la persona",
          });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al crear la persona",
        });
      }
    }
    handleModal(); // Cierra el modal
  };

  // Encabezados de la tabla con acciones
  const encabezadoPersonas = [
    {
      id: "nombreCompleto",
      name: "Nombre",
      selector: (row: Persona) => row.nombreCompleto,
      sortable: true,
      style: { fontSize: "1.2em" },
    },
    {
      id: "identificacion",
      name: "Identificación",
      selector: (row: Persona) => row.identificacion,
      sortable: true,
      style: { fontSize: "1.2em" },
    },
    {
      id: "telefono",
      name: "Teléfono",
      selector: (row: Persona) => row.telefono,
      sortable: true,
      style: { fontSize: "1.2em" },
    },
    {
      id: "email",
      name: "Correo",
      selector: (row: Persona) => row.email,
      sortable: true,
      style: { fontSize: "1.2em" },
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: Persona) => (row.estado ? "Activo" : "Inactivo"),
      sortable: true,
      style: { fontSize: "1.2em" },
    },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: Persona) => (
        <>
          <Button
            onClick={() => editarPersona(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <VscEdit />
          </Button>
          <Button
            size="sm"
              onClick={() => eliminarPersona(row)}
            className="bg-secondary">            
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>
  
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              verDetallesPersona(row);
            }}
            size="sm"
            className="bg-secondary"
            title="Ver detalles"
          >
            <FaClipboardList />
          </Button>
        </>
      ),
      width: "180px",
    },
  ];
  

  // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaPersonasImportar([]);
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaPersonasImportar([]);
    setFile(file);
  };

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        const binaryString = new Uint8Array(arrayBuffer).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );

        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (
          | string
          | number
        )[][];

        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        const formattedData: Persona[] = jsonData.slice(1).map((row) => {
          const obj: Partial<Persona> = {};

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === "Nombre" && (value === undefined || value === ""))
              InfoValida = false;
            if (
              property === "Identificación" &&
              (value === undefined || value === "")
            )
              InfoValida = false;
            if (property === "Correo" && (value === undefined || value === ""))
              InfoValida = false;

            obj.idPersona = "0" as string;
            if (property === "Nombre") obj.nombreCompleto = value as string;
            if (property === "Identificación")
              obj.identificacion = value as string;
            if (property === "Departamento") obj.departamento = value as string;
            if (property === "Puesto") obj.puesto = value as string;
            if (property === "Teléfono") obj.telefono = value as string;
            if (property === "Correo") obj.email = value as string;
            if (property === "Institución") obj.nomInstitucion = value as string;
            obj.usuarioCreacion = identificacionUsuario
              ? identificacionUsuario
              : "";
            obj.usuarioModificacion = "";
          });
          return obj as Persona;
        });

        if (!InfoValida) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje:
              "Información incompleta. Verifique los campos requeridos en el archivo.",
          });
          setShowSpinner(false);
          return;
        }

        const errores: string[] = [];        
        var deps = '';
        var puestos = '';
        var instituciones = '';

        formattedData.forEach(
          ({
            departamento,
            email,
            identificacion,
            nombreCompleto,
            puesto,
            telefono,
            nomInstitucion
          }) => {           

            if (typeof nombreCompleto !== "string" || nombreCompleto === null)
              errores.push("Nombre");
            if (
              (typeof identificacion !== "string" &&
                typeof telefono !== "number") ||
              identificacion === null
            )
              errores.push("Identificación");
            if (typeof email !== "string" || email === null || !email.includes("@"))
              errores.push("Correo");

            // Validar que exista institución si se especificó
            if (nomInstitucion && nomInstitucion.trim() !== "") {
              const existeInst = listaInstituciones.filter((x: any) => 
                x.nombre.toLowerCase() === nomInstitucion.trim().toLowerCase()).length > 0;
              
              if(!existeInst) instituciones += instituciones === '' ? nomInstitucion : ", " + nomInstitucion;
            }

            // Validar que exista departamento y puesto
            const existeDep = listaDepartamentos.filter((x: any) => 
              x.nombre.toLowerCase() === departamento.trim().toLowerCase()).length > 0;
            const existePuesto = listaPuestos.filter((x: any) => 
              x.nombre.toLowerCase() === puesto.trim().toLowerCase()).length > 0;

            if(!existeDep) deps += deps === '' ? departamento : ", " + departamento;     
            if(!existePuesto) puestos += puestos === '' ? puesto : ", " + puesto;           
          }
        );

        // Mensaje instituciones que no existen
        if(instituciones !== ''){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Las siguientes instituciones no existen: " + instituciones
          });
          setShowSpinner(false);
          return;
        }

        // Mensaje departamentos que no existen
        if(deps !== ''){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Los siguientes departamentos no existen: " + deps
          });
          setShowSpinner(false);
          return;
        }

        // Mensaje puestos que no existen
        if(puestos !== ''){
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Los siguientes puestos no existen: " + puestos
          });
          setShowSpinner(false);
          return;
        }

        if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores));
          const mensaje =
            columnasErroneas.length === 1
              ? `La columna ${columnasErroneas[0]} no cumple con el formato esperado.`
              : `Las siguientes columnas no cumplen con el formato esperado: ${columnasErroneas.join(
                  ", "
                )}.`;
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje,
          });
          setShowSpinner(false);
          return;
        }

        if (!FormatoValido) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje,
          });
          setShowSpinner(false);
          return;
        }

        setShowSpinner(false);
        setListaPersonasImportar(formattedData);
        setShowImportButton(true);
      };

      reader.readAsArrayBuffer(file);
    } else {
      setShowSpinner(false);
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "Seleccione un archivo válido.",
      });
    }
  };

  const importarArchivoExcel = async () => {
    setShowSpinner(true);

    var personas = listaPersonasImportar.map((item) => {
      // Obtener IDs de departamento y puesto
      const idDep = listaDepartamentos.filter((x: any) => 
        x.nombre.toLowerCase() === item.departamento.trim().toLowerCase())[0].idDepartamento;
      const idPuesto = listaPuestos.filter((x: any) => 
        x.nombre.toLowerCase() === item.puesto.trim().toLowerCase())[0].idPuesto;
      
      // Obtener ID de institución si se especificó
      const idInstitucion = item.nomInstitucion && item.nomInstitucion.trim() !== "" ?
        listaInstituciones.filter((x: any) => 
          x.nombre.toLowerCase() === item.nomInstitucion.trim().toLowerCase())[0].idInstitucion : "";

      return {
        idPersona: item.idPersona,
        departamento: idDep,
        email: item.email,
        identificacion: item.identificacion.toString(),
        nombreCompleto: item.nombreCompleto,
        puesto: idPuesto,
        nomInstitucion: item.nomInstitucion || "",
        telefono: item.telefono.toString(),
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: "",
        fechaCreacion: new Date().toISOString(),
      };
    });

    // Función para verifica si una persona ya existe en listaPersonas
    const personaExists = (persona: Persona) => {
      return listaPersonas.some(
        (existingPersona) =>
          existingPersona.identificacion === persona.identificacion ||
          existingPersona.email === persona.email
      );
    };

    // Filtrar personas para eliminar duplicados
    const personasSinDuplicados = personas.filter(
      (persona: any) => !personaExists(persona)
    );    

    if (personas.length > 0 && personasSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: `Las personas que intenta importar ya existen.`,
      });

      setShowSpinner(false);
      return;
    }

    const respuesta: ErrorResponse[] = await ImportarPersonas(
      personasSinDuplicados
    );

    if (respuesta && respuesta.length > 0) {
      const errores = respuesta.filter((item) => item.indicador === 1);

      if (errores.length > 0) {
        const mensajesDeError = errores
          .map((error) => error.mensaje)
          .join("\n");
        setShowSpinner(false);
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: `Errores encontrados:\n${mensajesDeError}`,
        });
      } else {
        setShowSpinner(false);
        obtenerPersonas();
        handleModalImportar();
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Importación exitosamente.",
        });
      }
    }
  };

  // Encabezados de la tabla de importación sin acciones
  const encabezadoPersonasImportar = [
    {
      id: "nombreCompleto",
      name: "Nombre",
      selector: (row: Persona) => row.nombreCompleto,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "identificacion",
      name: "Identificación",
      selector: (row: Persona) => row.identificacion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "nomInstitucion",
      name: "Institución",
      selector: (row: Persona) => row.nomInstitucion || "N/A",
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "departamento",
      name: "Departamento",
      selector: (row: Persona) => row.departamento,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "puesto",
      name: "Puesto",
      selector: (row: Persona) => row.puesto,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "telefono",
      name: "Teléfono",
      selector: (row: Persona) => row.telefono,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "email",
      name: "Correo",
      selector: (row: Persona) => row.email,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    }
  ];

  const handelDepChange = (e: any) => {
    setIdDep(e.value);
    setDepText(listaDepartamentos.filter((x: any) => x.idDepartamento === e.value)[0].nombre);
    setNuevaPersona(prev => ({...prev, departamento: e.value}));
  }

  const handelPuestoChange = (e: any) => {
    setIdPuesto(e.value);
    setPuestText(listaPuestos.filter((x: any) => x.idPuesto === e.value)[0].nombre);
    setNuevaPersona(prev => ({...prev, puesto: e.value}));
  }

  // Descarga de catálogo
  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte = "Reporte de personas DocSync - " + new Date().toLocaleDateString() +".xlsx";
    const nombreHoja = "Personas";

    const columnsSelect = [
      "identificacion",
      "nombreCompleto",
      "nomInstitucion",
      "puesto",
      "email",
      "telefono",
      "departamento",
      "estado"
    ];

    const columnas = {
      identificacion: "Identificación",
      nombreCompleto: "Nombre",
      nomInstitucion: "Institución",
      departamento: "Departamento",
      puesto: "Puesto",
      email: "Correo",
      telefono: "Teléfono",
      estado: "Estado"
    } as any;

    const datosFiltrados = listaPersonas.map((item: any) => {
      const filteredItem: any = {};
      columnsSelect.forEach((column: any) => {
        if (column === "estado") {
          filteredItem[columnas[column]] = item[column] ? "Activo" : "Inactivo";
        } else {
          filteredItem[columnas[column]] = item[column];
        }
      });
      return filteredItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(datosFiltrados);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
    
    await XLSX.writeFile(workbook, nombreReporte);
    setShowSpinner(false);
  }

  return (
    <>
      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <h1 style={{ marginLeft: 20 }} className="title">
              Catálogo de Personas
            </h1>
          </Col>
        </Row>
      </div>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        {/* Tabla de personas */}
        <Grid
          gridHeading={encabezadoPersonas}
          gridData={listaPersonas}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={[
            "nombreCompleto",
            "identificacion",
            "telefono",
            "email",
          ]}
          selectableRows={false}
          botonesAccion={[
            {
              condicion: true,
              accion: handleModalImportar,
              icono: <FaFileCirclePlus className="me-2" size={24} />,
              texto: "Importar",
            },
            {
              condicion: true,
              accion: descargaCatalogo,
              icono: <FaDownload className="me-2" size={24} />,
              texto: "Descargar",
            }
          ]}
        ></Grid>
      </div>

      {/* Modal para agregar o editar una persona */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? "Editar Persona" : "Agregar Persona"}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formPersona"
      >
        <Form id="formPersona" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formNombreCompleto">
                <Form.Label>Nombre Completo*</Form.Label>
                <Form.Control
                  type="text"
                  name="nombreCompleto"
                  value={nuevaPersona.nombreCompleto}
                  onChange={handleChange}
                  required
                  maxLength={150}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formIdentificacion">
                <Form.Label>Identificación</Form.Label>
                <Form.Control
                  type="text"
                  name="identificacion"
                  value={nuevaPersona.identificacion || ""}
                  onChange={handleChange}
                  maxLength={15}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{marginTop: '1%'}}>
            <Col md={6}>
              <Form.Group controlId="formInstitucion">
                <Form.Label>Institución</Form.Label>
                <Select
                  value={
                    institucionText !== ""
                      ? {
                          value: idInstitucion,
                          label: institucionText,
                        }
                      : null
                  }
                  onChange={handleInstitucionChange}
                  className="GrupoFiltro"
                  styles={{
                    control: (provided: any) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "2%",
                      outline: "none",
                      marginTop: "1%",
                    }),
                  }}
                  placeholder="Seleccione (opcional)"
                  options={listaInstituciones.map((x: any) => ({
                    value: x.idInstitucion,
                    label: x.nombre,
                  }))}
                  isClearable
                  noOptionsMessage={() => "Opción no encontrada"}     
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{marginTop: '1%'}}>
            <Col md={6}>
              <Form.Group controlId="formDepartamento">
                <Form.Label>Departamento</Form.Label>
                <Select
                  value={
                    depText !== ""
                      ? {
                          value: idDep,
                          label: depText,
                        }
                      : null
                  }
                  onChange={(e: any) => handelDepChange(e)}
                  className="GrupoFiltro"
                  styles={{
                    control: (provided: any) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "2%",
                      outline: "none",
                      marginTop: "1%",
                    }),
                  }}
                  placeholder="Seleccione"
                  options={departamentosFiltrados.map((x: any) => ({
                    value: x.idDepartamento,
                    label: x.nombre,
                  }))}
                  noOptionsMessage={() => "Opción no encontrada"}     
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPuesto">
                <Form.Label>Puesto</Form.Label>
                <Select
                  value={
                    puestoText !== ""
                      ? {
                          value: idPuesto,
                          label: puestoText,
                        }
                      : null
                  }
                  onChange={(e: any) => handelPuestoChange(e)}
                  className="GrupoFiltro"
                  styles={{
                    control: (provided: any) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "2%",
                      outline: "none",
                      marginTop: "1%",
                    }),
                  }}
                  placeholder="Seleccione"
                  options={puestosFiltrados.map((x: any) => ({
                    value: x.idPuesto,
                    label: x.nombre,
                  }))}
                  noOptionsMessage={() => "Opción no encontrada"}     
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{marginTop: '1%'}}>
            <Col md={6}>
              <Form.Group controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={nuevaPersona.telefono}
                  onChange={handleChange}
                  maxLength={12}
                  pattern="\d*"
                  title="Solo se permiten números"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formEmail">
                <Form.Label>Correo*</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={nuevaPersona.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{marginTop: '1%'}}>
            <Col md={{ span: 6, offset: 6 }}>
                <Form.Group controlId="formEstado">
                  <div
                    style={{
                      display: "flex",
                      alignContent: "start",
                      alignItems: "start",
                      flexDirection: "column"
                    }}
                  >
                    <Form.Label>
                      Persona activa
                    </Form.Label>
                    <div className="w-100">
                      <BootstrapSwitchButton
                        checked={nuevaPersona.estado === true}
                        onlabel="Sí"
                        onstyle="success"
                        offlabel="No"
                        offstyle="danger"
                        style="w-100 mx-3;"
                        onChange={(checked) => setNuevaPersona(prev => ({...prev, estado: checked}))}
                      />
                    </div>
                  </div>
                </Form.Group>
              </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* Modal para ver detalles de la persona */}
      <CustomModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        title="Detalles de la Persona"
        showSubmitButton={false}
        size="lg"
      >
        {personaDetalle && (
          <div className="container-fluid">
            <Row className="mb-3">
              <Col md={6}>
                <h5>Información Básica</h5>
                <hr />
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Nombre:</div>
                  <div className="col-md-8">{personaDetalle.nombreCompleto}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Identificación:</div>
                  <div className="col-md-8">{personaDetalle.identificacion || "N/A"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Teléfono:</div>
                  <div className="col-md-8">{personaDetalle.telefono}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Correo:</div>
                  <div className="col-md-8">{personaDetalle.email}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Estado:</div>
                  <div className="col-md-8">
                    {personaDetalle.estado ? "Activo" : "Inactivo"}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <h5>Información Laboral</h5>
                <hr />
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Institución:</div>
                  <div className="col-md-8">{personaDetalle.nomInstitucion || "N/A"}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Departamento:</div>
                  <div className="col-md-8">{personaDetalle.departamento}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-4 fw-bold">Puesto:</div>
                  <div className="col-md-8">{personaDetalle.puesto}</div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </CustomModal>

      {/* Modal para importar personas  */}
      <CustomModal
        size={"xl"}
        show={showModalImportar}
        onHide={handleModalImportar}
        title={"Importar Personas"}
        showSubmitButton={false}
      >
        {/* Importar personas */}
        <Container className="d-Grid align-content-center">
          <Form>
            <Form.Group controlId="file">
              <Row className="align-items-left">
                <Col md={6}>
                  <Form.Label className="mr-2">
                    <strong>Archivo: </strong>
                  </Form.Label>
                </Col>
              </Row>
              <Row className="align-items-center justify-content-between">
                <Col md={9}>
                  <Form.Control
                    type="file"
                    required={true}
                    accept=".xlsx"
                    onChange={handleFileChange}
                  />
                </Col>
                <Col md={3} className="d-flex justify-content-end">
                  <Button
                    style={{ margin: 4 }}
                    className="btn-crear"
                    variant="primary"
                    onClick={importarExcel}
                  >
                    <FaUpload className="me-2" size={24} />
                    Cargar Archivo
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Container>
        <br></br>
        {/* Tabla de personas */}
        <Grid
          gridHeading={encabezadoPersonasImportar}
          gridData={listaPersonasImportar}
          handle={handleModalImportar}
          buttonVisible={false}
          selectableRows={false}
        />
        <Row>
          <Col md={12} className="d-flex justify-content-end">
            <Button
              style={{
                margin: 4,
                display: showImportButton ? "inline-block" : "none",
              }}
              className="btn-save"
              variant="primary"
              type="submit"
              onClick={importarArchivoExcel}
            >
              <RiSaveFill className="me-2" size={24} />
              Guardar
            </Button>
          </Col>
        </Row>
      </CustomModal>
    </>
  );
}

export default CatalogoPersonas;