import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import CustomModal from "../../../components/modal/CustomModal";

import { Grid } from "../../../components/table/tabla";
import { ObtenerInstitucion, CrearInstitucion, EliminarInstitucion, ActualizarInstitucion, ImportarInstitucion } from "../../../servicios/ServicioInstitucion";
import { FaBan, FaDownload, FaRedo, FaUpload, FaUniversity } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import { RiSaveFill } from "react-icons/ri";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";
// import { ObtenerDepartamentos } from "../../../servicios/ServicioDepartamento";
// import { ObtenerPuestos } from "../../../servicios/ServicioPuesto";
import Select from "react-select";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es";

// Interfaz para la información de la institucion
interface Institucion {
  idInstitucion: string;
  nomInstitucion: string;
  fechaApertura: string;
  tipo: string;
  descripcion: string;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string;
  fechaModificacion: string;
  estado: boolean;
}

// Definición de tipos para la respuesta
interface ErrorResponse {
  indicador: number;
  mensaje: string;
}

// Componente principal
function CatalogoInstituciones() {
  const { setShowSpinner } = useSpinner();

  const identificacionUsuario = localStorage.getItem("identificacionUsuario");
  const [listaInstituciones, setListaInstituciones] = useState<Institucion[]>([]);
  // const [listaDepartamentos, setListaDepartamentos] = useState<any[]>([]);
  // const [idDep, setIdDep] = useState("");
  // const [depText, setDepText] = useState("");
  // const [idPuesto, setIdPuesto] = useState("");
  // const [puestoText, setPuestText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [nuevaInstitucion, setNuevaInstitucion] = useState<Institucion>({
    idInstitucion: "0",
    nomInstitucion: "",
    fechaApertura: "",
    tipo: "",
    descripcion: "",
    fechaModificacion: "",
    usuarioCreacion: identificacionUsuario ? identificacionUsuario : "",
    usuarioModificacion: "",
    fechaCreacion:"",
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
  const [listaInstitucionesImportar, setListaInstitucionesImportar] = useState<Institucion[]>(
    []
  );
  const [fechaApertura, setfechaApertura] = useState<Date | null>(
      null
    );
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // obtenerDeps();
    // obtenerPuestos();
    ObtenerInstituciones();
  }, []);

  // Función para obtener todas las instituciones
   const ObtenerInstituciones = async () => {
      setShowSpinner(true);
      try {
        const instituciones = await ObtenerInstitucion();
        setListaInstituciones(instituciones);
      } catch (error) {
        console.error("Error al obtener :", error);
      } finally {
        setShowSpinner(false);
      }
    };
  // // Función para obtener departamentos
  // const obtenerDeps = async () => {
  //   setShowSpinner(true);
  //   try {
  //     const resp = await ObtenerDepartamentos();
  //     setListaDepartamentos(resp.filter((x: any) => x.estado));
  //   } catch (error) {
  //     console.error("Error al obtener departamentos:", error);
  //   } finally {
  //     setShowSpinner(false);
  //   }
  // };

  // // Función para obtener departamentos
  // const obtenerPuestos = async () => {
  //   setShowSpinner(true);
  //   try {
  //     const resp = await ObtenerPuestos();
  //     setListaPuestos(resp.filter((x: any) => x.estado));
  //   } catch (error) {
  //     console.error("Error al obtener puestos:", error);
  //   } finally {
  //     setShowSpinner(false);
  //   }
  // };

  // Función para eliminar una institucion
  const eliminarInstitucion = (institucion: Institucion) => {
    openConfirm("¿Está seguro que desea cambiar el estado de la Institución?", async () => {
      try {
        // institucion.departamento = listaDepartamentos.filter((x: any) => x.nombre === persona.departamento)[0].idDepartamento;
        // persona.puesto = listaPuestos.filter((x: any) => x.nombre === persona.puesto)[0].idPuesto;

        const institucionActualizar = {
          ...institucion,
          UsuarioModificacion: identificacionUsuario,
          FechaModificacion: new Date().toISOString(),
        };

        const response = await EliminarInstitucion(institucionActualizar);

        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          ObtenerInstitucion();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al eliminar la institución",
          });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al eliminar la isntitución",
        });
      }
    });
  };

  // Función para abrir el modal y editar una persona
  const editarInstitucion = (isntitución: Institucion) => {
    // const idPuest = listaPuestos.filter((x: any) => x.nombre === persona.puesto)[0].idPuesto;
    // const idDp = listaDepartamentos.filter((x: any) => x.nombre === persona.departamento)[0].idDepartamento;

    setNuevaInstitucion(isntitución);
    setIsEditing(true);
    setShowModal(true);
    // setIdDep(idDp);
    // setDepText(persona.departamento);
    // setPuestText(persona.puesto);
    // setIdPuesto(idPuest);   
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevaInstitucion({
      idInstitucion: "",
      nomInstitucion: "",
      fechaApertura: "",
      tipo: "",
      descripcion: "",
      fechaModificacion: "",
      usuarioCreacion: "",
      usuarioModificacion: "",
      fechaCreacion:"",
      estado: false
    });
    // setIdDep("");
    // setDepText("");
    // setPuestText("");
    // setIdPuesto("");
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaInstitucion({
      ...nuevaInstitucion,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar una institucion
  const handleSubmit = async (e: React.FormEvent) => {
    setShowSpinner(true);
    e.preventDefault();    

    if (isEditing) {
      // editar
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );

        // nuevaPersona.departamento = idDep;
        // nuevaPersona.puesto = idPuesto;

        const institucionActualizar = {
          ...nuevaInstitucion,
          UsuarioModificacion: identificacionUsuario,
          FechaModificacion: new Date().toISOString(),
        };

        const response = await ActualizarInstitucion(institucionActualizar);

        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          ObtenerInstitucion();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al actualizar la institución",
          });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al actualizar la institución",
        });
      }
    } else {
      // agregar institucion
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );
        const institucionACrear = {
          ...nuevaInstitucion,
          idInstitucion: "0",
          usuarioCreacion: identificacionUsuario,
          fechaCreacion: new Date().toISOString(),
        };
        const response = await CrearInstitucion(institucionACrear); // Crea la institucion
        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          ObtenerInstitucion();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Error al crear la institución",
          });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "Error al crear la instutución",
        });
      }
    }
    handleModal(); // Cierra el modal
  };

  // Encabezados de la tabla con acciones
  const encabezadoInstituciones = [
    {
      id: "idInstitucion",
      name: "Identificación",
      selector: (row: Institucion) => row.idInstitucion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "nomInstitucion",
      name: "Nombre",
      selector: (row: Institucion) => row.nomInstitucion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    
    {
      id: "fechaApertura",
      name: "Fecha de apertura",
      selector: (row: Institucion) => row.fechaApertura,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "tipo",
      name: "Tipo",
      selector: (row: Institucion) => row.tipo,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "descripcion",
      name: "Descripción",
      selector: (row: Institucion) => row.descripcion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: Institucion) => row.estado ? 'Activo': 'Inactivo',
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: Institucion) => (
        <>
          <Button
            onClick={() => editarInstitucion(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarInstitucion(row)}
            className="bg-secondary"
          >
            
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>
        </>
      ),
      width: "120px",
    },
  ];

  // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaInstitucionesImportar([]);
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaInstitucionesImportar([]);
    //setDataArray([]);
    setFile(file);
  };

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        // Convierte el ArrayBuffer a una cadena binaria
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
        //console.log("jsonData:" + jsonData);
        // Obtener nombres de propiedades desde la primera fila
        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        // Crear un array de objetos utilizando los nombres de propiedades
        const formattedData: Institucion[] = jsonData.slice(1).map((row) => {
          const obj: Partial<Institucion> = {}; // Utilizamos Partial inicialmente para permitir campos opcionales

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === "Nombre" && (value === undefined || value === ""))
              InfoValida = false;
            if (
              property === "Identificación" &&
              (value === undefined || value === "")
            )
              InfoValida = false;
            if (
              property === "Fecha de apertura" &&
              (value === undefined || value === "")
            )
              InfoValida = false;
            if (property === "Tipo" && (value === undefined || value === ""))
              InfoValida = false;
            if (
              property === "Descripción" &&
              (value === undefined || value === "")
            )
            //   InfoValida = false;
            // if (property === "Correo" && (value === undefined || value === ""))
            //   InfoValida = false;

            // Asignar valores al objeto Institucion
            obj.idInstitucion = "0" as string;
             if (property === "Identificación") obj.idInstitucion = value as string;
            if (property === "Nombre") obj.nomInstitucion = value as string;
            if (property === "Fecha de Apertuta") obj.fechaApertura = value as string;
            if (property === "Tipo") obj.tipo = value as string;
            if (property === "Descripción") obj.descripcion = value as string;
            // if (property === "Correo") obj.email = value as string;
            obj.usuarioCreacion = identificacionUsuario
              ? identificacionUsuario
              : "";
            obj.usuarioModificacion = "";
          });
          return obj as Institucion; // Finalmente convertimos a un objeto de tipo Institucion
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
        

        // Validar que todos los campos son correctos
        formattedData.forEach(
          ({
            idInstitucion,
            nomInstitucion,
            fechaApertura,
            tipo,
            descripcion,
          }) => {           

            if (typeof idInstitucion !== "string" || idInstitucion === null)
              errores.push("Identificación");
            if (
              (typeof nomInstitucion !== "string" && typeof nomInstitucion !== "string") || nomInstitucion === null
            ) errores.push("Nombre ");
            if (typeof fechaApertura !== "string" || fechaApertura === null)
              errores.push("Fecha de Apertura");
            if (typeof tipo !== "string" || tipo === null)
              errores.push("Tipo");
            if (typeof descripcion !== "string" || descripcion === null)
              errores.push("Descripción");
            // if (
            //   typeof email !== "string" ||
            //   email === null ||
            //   !email.includes("@")
            // ) {
            //   errores.push("Correo");
            // }

            //Se valida que exista departamento y puesto de cada registro ingresado
          //   const existeDep = listaDepartamentos.filter((x: any) => x.nombre.toLowerCase() === departamento.trim().toLowerCase()).length > 0;
          //   const existePuesto = listaPuestos.filter((x: any) => x.nombre.toLowerCase() === puesto.trim().toLowerCase()).length > 0;

          //   if(!existeDep) deps += deps === '' ? departamento : ", " + departamento;     

          //   if(!existePuesto) puestos += puestos === '' ? puesto : ", " + puesto;           
          }
       );

        // Mensaje departamentos que no existen
        // if(deps !== ''){
        //   setShowAlert(true);
        //   setMensajeRespuesta({
        //     indicador: 1,
        //     mensaje: "Los siguientes departamentos no existen: " + deps
        //   });
        //   setShowSpinner(false);
        //   return;
        // }

        // Mensaje puestos que no existen
        // if(puestos !== ''){
        //   setShowAlert(true);
        //   setMensajeRespuesta({
        //     indicador: 1,
        //     mensaje: "Los siguientes puestos no existen: " + puestos
        //   });
        //   setShowSpinner(false);
        //   return;
        // }

        if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores)); // Elimina duplicados
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
        setListaInstitucionesImportar(formattedData);
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
    //let erroresFormato = false;
    setShowSpinner(true);

    var instituciones = listaInstitucionesImportar.map((item) => {
      //agregar validadciones a campos

      return {
        idInstitucion: item.idInstitucion,
        nomInstitucion: item.nomInstitucion,
        fechaApertura: item.fechaApertura,
        tipo: item.tipo.toString(),
        descripcion: item.descripcion,
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: "",
        fechaCreacion: new Date().toISOString(),
        estado: item.estado.toString(),
      };
    });

    // Función para verifica si una persona ya existe en listaInstitucion
    const institucionExists = (institucion: Institucion) => {
      return listaInstituciones.some(
        (existingInstitucion) =>
          existingInstitucion.idInstitucion === institucion.idInstitucion ||
          existingInstitucion.nomInstitucion === institucion.nomInstitucion
      );
    };

    // Filtrar instituciones para eliminar duplicados
    const institucionesSinDuplicados = instituciones.filter(
      (institucion: any) => !institucionExists(institucion)
    );    

    if (instituciones.length > 0 && institucionesSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 1,
        mensaje: `Las instituciones que intenta importar ya existen.`,
      });

      setShowSpinner(false);
      return;
    }

    //console.log("listaPersonasImportar: " + JSON.stringify(listaPersonasImportar, null, 2));
    //console.log("personas: " + JSON.stringify(personas, null, 2));

    /*if (erroresFormato) {
        //setIsLoading(false);
        setShowAlert(true);
        return; // Detiene el proceso si el formato  es correcto
    }*/

    // Se asigna id de puesto y departamento, según el nombre        
    // institucionesSinDuplicados.forEach((i: any) => {
    //   i.departamento = listaDepartamentos.filter((x: any) => x.nombre.toLowerCase() === i.departamento.trim().toLowerCase())[0].idDepartamento;
    //   i.puesto = listaPuestos.filter((x: any) => x.nombre.toLowerCase() === i.puesto.trim().toLowerCase())[0].idPuesto;
    // });

    const respuesta: ErrorResponse[] = await ImportarInstitucion(
      institucionesSinDuplicados
    );

    if (respuesta && respuesta.length > 0) {
      // Filtrar los errores de la respuestea
      const errores = respuesta.filter((item) => item.indicador === 1);

      // setIsLoading(false);

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
        // Mostrar mensaje de éxito si no hay errores
        ObtenerInstitucion();
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
  const encabezadoInstitucionesImportar = [
    {
      id: "idInstitucion",
      name: "Identificación",
      selector: (row: Institucion) => row.idInstitucion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "nomInstitucion",
      name: "Nombre",
      selector: (row: Institucion) => row.nomInstitucion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    
    {
      id: "fechaApertura",
      name: "Fecha de apertura",
      selector: (row: Institucion) => row.fechaApertura,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "tipo",
      name: "Tipo de Institución",
      selector: (row: Institucion) => row.tipo,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "descripcion",
      name: "Descripción o propósito de la institución",
      selector: (row: Institucion) => row.descripcion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: Institucion) => row.estado,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
  ];

  // const handelDepChange = (e: any) => {
  //   setIdDep(e.value);
  //   setDepText(listaDepartamentos.filter((x: any) => x.idDepartamento === e.value)[0].nombre);
  //   nuevaPersona.departamento = e.value;
  // }

  // const handelPuestoChange = (e: any) => {
  //   setIdPuesto(e.value);
  //   setPuestText(listaPuestos.filter((x: any) => x.idPuesto === e.value)[0].nombre);
  //   nuevaPersona.puesto = e.value;
  // }

  // Descarga de catálogo
  const descargaCatalogo = async () => {
    setShowSpinner(true);
    const nombreReporte = "Reporte de isntituciones DocSync - " + new Date().toLocaleDateString() +".xlsx";
    const nombreHoja = "Instituciones";

    const columnsSelect = [
      "idInstitucion",
      "nomInstitucion",
      "fechaApertura",
      "tipo",
      "descripcion",
      "estado"
    ];

    const columnas = {
      idInstitucion: "Identificación",
      nomInstitucion: "Nombre",      
      fechaApertura: "Fecha de Apertura",
      tipo: "Tipo",
      descripcion: "Descripción",
      estado: "Estado"
    } as any;

    const datosFiltrados = listaInstituciones.map((item: any) => {
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
              Catálogo de Institución
            </h1>
          </Col>
        </Row>
      </div>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        {/* Tabla de isnticiones */}
        <Grid
          gridHeading={encabezadoInstituciones}
          gridData={listaInstituciones}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={[
            "idInstitucion",
            "nomInstitucion",
            "fechaaPertura",
            "tipo",
            "descripcion",
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

      {/* Modal para agregar o editar una institucion */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? "Editar Institución" : "Agregar Institución"}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formInstitucion"
      >
        <Form id="formInstitucion" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formidInstitucion">
                <Form.Label>Identificación *</Form.Label>
                <Form.Control
                  type="text"
                  name="idInstitucion"
                  value={nuevaInstitucion.idInstitucion}
                  onChange={handleChange}
                  required
                  maxLength={150}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formnomInstitucion">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nomInstitucion"
                  value={nuevaInstitucion.nomInstitucion } 
                  onChange={handleChange}
                  maxLength={15}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{marginTop: '1%'}}>
            <Col md={6}>
              <Form.Group controlId="formfechaapertura">
                <Form.Label>Fecha de apertura</Form.Label>
                <DatePicker
                  showIcon
                  selected={fechaApertura}
                  onChange={(date) => setfechaApertura(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  locale={es}
                  placeholderText="Fecha de Apertura"
                />
                
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTipo">
                <Form.Label>Tipo</Form.Label>
                <Form.Control
                  type="text"
                  name="tipo"
                  value={nuevaInstitucion.tipo } 
                  onChange={handleChange}
                  maxLength={255}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row style={{marginTop: '1%'}}>
            <Col md={6}>
              <Form.Group controlId="formdescripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="paragraph"
                  name="descripcion"
                  value={nuevaInstitucion.descripcion } 
                  onChange={handleChange}
                  maxLength={255}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>

      {/* Modal para importar instituciones  */}
      <CustomModal
        size={"xl"}
        show={showModalImportar}
        onHide={handleModalImportar}
        title={"Importar Institucione"}
        showSubmitButton={false}
      >
        {/* Importar instituciones */}
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
        {/* Tabla de instituciones */}
        <Grid
          gridHeading={encabezadoInstitucionesImportar}
          gridData={listaInstitucionesImportar}
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

export default CatalogoInstituciones;
