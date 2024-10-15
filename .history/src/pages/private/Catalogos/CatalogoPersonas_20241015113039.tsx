import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import CustomModal from "../../../components/modal/CustomModal";

import { Grid } from "../../../components/table/tabla";
import { ObtenerPersonas, CrearPersona, EliminarPersona, ActualizarPersona, ImportarPersonas } from "../../../servicios/ServicioPersonas";
import { FaTrash, FaUpload } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import * as XLSX from 'xlsx';
import { RiSaveFill } from "react-icons/ri";
import { useSpinner } from "../../../context/spinnerContext";


// Interfaz para la información de la persona
interface Persona {
  idPersona: string;
  departamento: string;
  email: string;
  identificacion: string;
  nombreCompleto: string;
  puesto: string;
  telefono: string;
  usuarioCreacion: string;
  usuarioModificacion: string;
  fechaCreacion: string;
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
  const [showModal, setShowModal] = useState(false);
  const [nuevaPersona, setNuevaPersona] = useState<Persona>({
    idPersona: "0",
    departamento: "",
    email: "",
    identificacion: "",
    nombreCompleto: "",
    puesto: "",
    telefono: "",
    usuarioCreacion: identificacionUsuario?identificacionUsuario:"",
    usuarioModificacion: "",
    fechaCreacion:""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({ indicador: 0, mensaje: "" });

  const [showModalImportar, setShowModalImportar] = useState(false);
  const [listaPersonasImportar, setListaPersonasImportar] = useState<Persona[]>([]);
  const [showImportButton, setShowImportButton] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    obtenerPersonas();
  }, []);

  // Función para obtener todas las personas
  const obtenerPersonas = async () => {
    setShowSpinner(true);
    try {
      const personas = await ObtenerPersonas();
      setListaPersonas(personas);
    } catch (error) {
      console.error("Error al obtener personas:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  // Función para eliminar una persona
  const eliminarPersona = async (persona: Persona) => {
    try {
      const personaActualizar = {
        ...persona,
        UsuarioModificacion: identificacionUsuario,
        FechaModificacion: ( new Date().toLocaleString()
      };
      const response = await EliminarPersona(personaActualizar);

      if (response) {
        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerPersonas();
      } else {
        setShowAlert(true);
        setMensajeRespuesta({ indicador: 1, mensaje: "Error al eliminar la persona" });
      }
    } catch (error) {
      setShowAlert(true);
      setMensajeRespuesta({ indicador: 1, mensaje: "Error al eliminar la persona" });
    }
  };


  // Función para abrir el modal y editar una persona
  const editarPersona = (persona: Persona) => {
    setNuevaPersona(persona);
    setIsEditing(true);
    setShowModal(true);
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
      telefono: "",
      usuarioCreacion: "",
      usuarioModificacion: "",
      fechaCreacion:""
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaPersona({
      ...nuevaPersona,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar una persona
  const handleSubmit = async (e: React.FormEvent) => {
    setShowSpinner(true);
    e.preventDefault();
    if (isEditing) {
      // editar
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );
        const personaActualizar = {
          ...nuevaPersona,
          UsuarioModificacion: identificacionUsuario,
          FechaModificacion: (new Date()).toLocaleString();
        };
        const response = await ActualizarPersona(personaActualizar);

        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerPersonas();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({ indicador: 1, mensaje: "Error al actualizar la persona" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({ indicador: 1, mensaje: "Error al actualizar la persona" });
      }
    } else {
      // agregar persona
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );
        const personaACrear = {
          ...nuevaPersona,
          idPersona: "0",
          usuarioCreacion: identificacionUsuario,
          fechaCreacion:(new Date()).toISOString()
        };
        const response = await CrearPersona(personaACrear); // Crea la persona
        if (response) {
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerPersonas();
        } else {
          setShowAlert(true);
          setMensajeRespuesta({ indicador: 1, mensaje: "Error al crear la persona" });
        }

      } catch (error) {

        setShowAlert(true);
        setMensajeRespuesta({ indicador: 1, mensaje: "Error al crear la persona" });
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
            className="bg-secondary"
          >
            <FaTrash />
          </Button>
        </>
      ),
      width: "120px",
    },
  ];

  // Función para manejar el cierre del modal de importar
  const handleModalImportar = () => {
    setListaPersonasImportar([])
    setFile(null);
    setShowImportButton(false);
    setShowModalImportar(!showModalImportar);
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setShowImportButton(false);
    setListaPersonasImportar([]);
    //setDataArray([]);
    setFile(file);
  }

  const importarExcel = () => {
    setShowSpinner(true);
    let InfoValida = true;

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        // Convierte el ArrayBuffer a una cadena binaria
        const binaryString = new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), "");

        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];
        //console.log("jsonData:" + jsonData);
        // Obtener nombres de propiedades desde la primera fila
        const properties: (string | number)[] = jsonData[0];
        let FormatoValido = true;
        let mensaje = "";

        // Crear un array de objetos utilizando los nombres de propiedades
        const formattedData: Persona[] = jsonData.slice(1).map((row) => {
          const obj: Partial<Persona> = {}; // Utilizamos Partial inicialmente para permitir campos opcionales

          properties.forEach((property, index) => {
            const value = row[index];
            if (property === 'Nombre' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Identificación' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Departamento' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Puesto' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Teléfono' && (value === undefined || value === '')) InfoValida = false;
            if (property === 'Correo' && (value === undefined || value === '')) InfoValida = false;

            // Asignar valores al objeto Persona
            obj.idPersona = "0" as string;
            if (property === 'Nombre') obj.nombreCompleto = value as string;
            if (property === 'Identificación') obj.identificacion = value as string;
            if (property === 'Departamento') obj.departamento = value as string;
            if (property === 'Puesto') obj.puesto = value as string;
            if (property === 'Teléfono') obj.telefono = value as string;
            if (property === 'Correo') obj.email = value as string;
            obj.usuarioCreacion = identificacionUsuario ? identificacionUsuario:"";
            obj.usuarioModificacion = '';
          });
          return obj as Persona; // Finalmente convertimos a un objeto de tipo Persona
        });

        if (!InfoValida) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: 'Información incompleta. Verifique los campos requeridos en el archivo.'
          });
          setShowSpinner(false);
          return;
        }

        const errores: string[] = [];

        // Validar que todos los campos son correctos
        formattedData.forEach(({ departamento, email, identificacion, nombreCompleto, puesto, telefono }) => {
          if (typeof nombreCompleto !== 'string' || nombreCompleto === null) errores.push('Nombre');
          if (typeof identificacion !== 'string' && typeof telefono !== 'number' || identificacion === null) errores.push('Identificación');
          if (typeof departamento !== 'string' || departamento === null) errores.push('Departamento');
          if (typeof puesto !== 'string' || puesto === null) errores.push('Puesto');
          if (typeof telefono !== 'number' || telefono === null) errores.push('Teléfono');
          if (typeof email !== 'string' || email === null || !email.includes('@')) { errores.push('Correo'); }
        });

        if (errores.length > 0) {
          const columnasErroneas = Array.from(new Set(errores)); // Elimina duplicados
          const mensaje = columnasErroneas.length === 1
            ? `La columna ${columnasErroneas[0]} no cumple con el formato esperado.`
            : `Las siguientes columnas no cumplen con el formato esperado: ${columnasErroneas.join(', ')}.`;
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje
          });
          setShowSpinner(false);
          return;
        }

        if (!FormatoValido) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: mensaje
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
        mensaje: 'Seleccione un archivo válido.'
      });
    }
  };

  const importarArchivoExcel = async () => {

    //let erroresFormato = false;
    setShowSpinner(true);

    var personas = listaPersonasImportar.map(item => {
      //agregar validadciones a campos

      return {
        idPersona: item.idPersona,
        departamento: item.departamento,
        email: item.email,
        identificacion: item.identificacion.toString(),
        nombreCompleto: item.nombreCompleto,
        puesto: item.puesto,
        telefono: item.telefono.toString(),
        usuarioCreacion: item.usuarioCreacion,
        usuarioModificacion: '',
        fechaCreacion:(new Date()).toISOString()
      };
    });

    // Función para verifica si una persona ya existe en listaPersonas
    const personaExists = (persona: Persona) => {
      return listaPersonas.some(existingPersona =>
        existingPersona.identificacion === persona.identificacion ||
        existingPersona.email === persona.email
      );
    };

    // Filtrar personas para eliminar duplicados
    const personasSinDuplicados = personas.filter(persona => !personaExists(persona));

    if (personas.length > 0 && personasSinDuplicados.length == 0) {
      setShowAlert(true);
      setMensajeRespuesta(
        {
          "indicador": 1,
          "mensaje": `Las personas que intenta importar ya existen.`
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

    const respuesta: ErrorResponse[] = await ImportarPersonas(personasSinDuplicados);

    if (respuesta && respuesta.length > 0) {
      // Filtrar los errores de la respuestea
      const errores = respuesta.filter(item => item.indicador === 1);

      // setIsLoading(false); 

      if (errores.length > 0) {
        const mensajesDeError = errores.map(error => error.mensaje).join('\n');
        setShowSpinner(false);
        setShowAlert(true);
        setMensajeRespuesta({
          "indicador": 1,
          "mensaje": `Errores encontrados:\n${mensajesDeError}`
        });

      } else {
        setShowSpinner(false);
        // Mostrar mensaje de éxito si no hay errores     
        obtenerPersonas();
        handleModalImportar();
        setShowAlert(true);
        setMensajeRespuesta({
          "indicador": 0,
          "mensaje": 'Importación exitosamente.'
        });
      }
    }
  }


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
    },
  ];

  return (
    <>
      <div className="container-fluid">
        <Row>
          <Col md={10} className="d-flex justify-content-start">
            <h1 style={{ marginLeft: 20 }} className="title">Catálogo de Personas</h1>
          </Col>
        </Row>
      </div>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible
            mensaje={mensajeRespuesta}
            setShow={setShowAlert}
          />
        )}
        {/* Tabla de personas */}
        <Grid
          gridHeading={encabezadoPersonas}
          gridData={listaPersonas}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["nombreCompleto", "identificacion", "departamento", "puesto", "telefono", "email",]}
          selectableRows={false}
          visibleButtonOpcion1={true}
          nameButtonOpcion1={"Importar"}
          iconButtonOpcion1={<FaFileCirclePlus className="me-2" size={24} />}
          handleButtonOpcion1={handleModalImportar}
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
                <Form.Label>Nombre Completo</Form.Label>
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
                  value={nuevaPersona.identificacion || ""} // Valor opcional
                  onChange={handleChange}
                  maxLength={15}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formDepartamento">
                <Form.Label>Departamento</Form.Label>
                <Form.Control
                  type="text"
                  name="departamento"
                  value={nuevaPersona.departamento}
                  onChange={handleChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPuesto">
                <Form.Label>Puesto</Form.Label>
                <Form.Control
                  type="text"
                  name="puesto"
                  value={nuevaPersona.puesto}
                  onChange={handleChange}
                  maxLength={100}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
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
                <Form.Label>Correo</Form.Label>
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
        </Form>
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
        <Container className='d-Grid align-content-center'>
          <Form>
            <Form.Group controlId="file">
              <Row className="align-items-left">
                <Col md={6}>
                  <Form.Label className="mr-2"><strong>Archivo: </strong></Form.Label>
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
                  <Button style={{ margin: 4 }}
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
                display: showImportButton ? 'inline-block' : 'none',
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
