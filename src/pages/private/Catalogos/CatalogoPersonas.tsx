import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import CustomModal from "../../../components/modal/CustomModal"; 

import { Grid } from "../../../components/table/tabla";
import {ObtenerPersonas,CrearPersona,EliminarPersona,ActualizarPersona,} from "../../../servicios/ServicioPersonas";
import { FaTrash, FaPlus } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";

import { AiOutlineClose } from "react-icons/ai";
import { RiSaveFill } from "react-icons/ri";
import Swal from "sweetalert2";

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
}

// Componente principal
function CatalogoPersonas() {
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
    usuarioCreacion: "",
    usuarioModificacion: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    obtenerPersonas();
  }, []);

  // Función para obtener todas las personas
  const obtenerPersonas = async () => {
    try {
      const personas = await ObtenerPersonas();
      setListaPersonas(personas);
    } catch (error) {
      console.error("Error al obtener personas:", error);
    }
  };

  // Función para eliminar una persona
  const eliminarPersona = async (persona: Persona) => {
    try {
      const response = await EliminarPersona(persona);

      if (response.indicador === 0) {
        Swal.fire({
          icon: "success",
          title: response.mensaje,
        });
        obtenerPersonas();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.mensaje,
        });
      }
    } catch (error) {
      console.error("Error al eliminar persona:", error);
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
        };
        const response = await ActualizarPersona(personaActualizar);

        if (response.indicador === 0) {
          Swal.fire({
            icon: "success",
            title: response.mensaje,
          });
          obtenerPersonas();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al actualizar la persona:", error);
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
        };
        const response = await CrearPersona(personaACrear); // Crea la persona
        if (response.indicador === 0) {
          Swal.fire({
            icon: "success",
            title: response.mensaje,
          });
          obtenerPersonas();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al crear la persona:", error);
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

  return (
    <>
      <h1 style={{marginLeft:20}} className="title">Catálogo de Personas</h1>
      <div style={{ padding: "20px" }}>
        {/* Botón para abrir el modal de agregar persona */}
        {/* Tabla de personas */}
        <Grid
          gridHeading={encabezadoPersonas}
          gridData={listaPersonas}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["nombreCompleto","identificacion","departamento", "puesto","telefono","email",]}
          selectableRows={false}
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
    </>
  );
}

export default CatalogoPersonas;
