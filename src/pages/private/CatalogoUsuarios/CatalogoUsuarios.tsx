import { useState, useEffect } from "react";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Topbar from "../../../components/topbar/Topbar";
import "../../../css/general.css";
import { Button, Col, Form , Modal, Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerUsuarios } from "../../../servicios/ServicioUsuario";
import { ObtenerPersonas } from "../../../servicios/ServicioPersonas";
import { FaTrash ,FaPlus } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AiOutlineClose  } from "react-icons/ai";
import { RiSaveFill } from "react-icons/ri";
import Swal from "sweetalert2";
import { Input } from 'reactstrap';

interface Usuario {
  idUsuario: string;
  correoElectronico: string;
  identificacion: string;
  nombreCompleto: string;
  puesto: string;
  rol: string;
  usuarioCreacion:string;
  usuarioModificacion: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

// Componente principal
function CatalogoPersonas() {
  const [listaUsuarios, setUsuarios] = useState<Usuario[]>([]);
  const [persona, setPersona] = useState<string>("");
  const [personas, setPersonas] = useState<any>([]);
  const [identificacion, setIdentificacion] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario>({
    idUsuario: "0",
    correoElectronico: "",
    identificacion: "",
    nombreCompleto: "",
    puesto: "",
    rol: "",
    usuarioCreacion:"",
    usuarioModificacion:"",
    fechaCreacion: "",
    fechaModificacion: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
    obtenerPersonas();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const response = await ObtenerUsuarios();
      setUsuarios(response.filter(x => x.estado === true));
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const obtenerPersonas = async () => {
    try {
      const response = await ObtenerPersonas();
      setPersonas(response.filter(x => x.estado === true));
    } catch (error) {
      console.error("Error al obtener personas:", error);
    }
  };

  // Función para eliminar una persona
  // const eliminarPersona = async (usuario: Usuario) => {
  //   try {

  //     const response = await EliminarPersona(persona);

  //       if (response.indicador === 0) {
  //           Swal.fire({
  //               icon: 'success',
  //               title: response.mensaje,      
  //           });
  //           obtenerPersonas();
  //         } else {
  //           Swal.fire({
  //               icon: 'error',
  //               title: 'Error',
  //               text: response.mensaje,
  //           });
  //         }
  //   } catch (error) {
  //     console.error("Error al eliminar persona:", error);
  //   }
  // };

  // Función para abrir el modal y editar una persona
  const editarPersona = (usuario: Usuario) => {
    setNuevoUsuario(usuario);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevoUsuario({
      idUsuario: "",
      correoElectronico: "",
      identificacion: "",
      nombreCompleto: "",
      puesto: "",
      rol: "",
      usuarioCreacion:"",
      usuarioModificacion:"",
      fechaCreacion: "",
      fechaModificacion: ""
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoUsuario({
      ...nuevoUsuario,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar una persona
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      // editar
      try {

        const identificacionUsuario = localStorage.getItem('identificacionUsuario');
        const usuarioActualizar = { ...nuevoUsuario, UsuarioModificacion: identificacionUsuario };
        // const response = await ActualizarPersona(usuarioActualizar);

        // if (response.indicador === 0) {
        //     Swal.fire({
        //         icon: 'success',
        //         title: response.mensaje,      
        //     });
        //     obtenerUsuarios();
        //   } else {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Error',
        //         text: response.mensaje,
        //     });
        //   }
      } catch (error) {
        console.error("Error al actualizar la persona:", error);
      }
    } else {
      // agregar persona
      try {
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');
        const personaACrear = { ...nuevoUsuario, idPersona: "0", usuarioCreacion :identificacionUsuario };
        // const response  = await CrearPersona(personaACrear); // Crea la persona
        // if (response.indicador === 0) {
        //     Swal.fire({
        //         icon: 'success',
        //         title: response.mensaje,      
        //     });
        //     obtenerPersonas();
        //   } else {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Error',
        //         text: response.mensaje,
        //     });
        //   }
      } catch (error) {
        console.error("Error al crear la persona:", error);
      }
    }
    handleModal(); // Cierra el modal 
  };

  // Encabezados de la tabla con acciones
  const encabezadoTabla = [
    { id: "identificacion", name: "Identificación", selector: (row: Usuario) => row.identificacion, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "nombreCompleto", name: "Nombre completo", selector: (row: Usuario) => row.nombreCompleto, sortable: true, style: {
      fontSize: "1.2em",
    },},
    { id: "rol", name: "Rol", selector: (row: Usuario) => row.rol, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "puesto", name: "Puesto", selector: (row: Usuario) => row.puesto, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "correoElectronico", name: "Correo electrónico", selector: (row: Usuario) => row.correoElectronico, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: Usuario) => (
        <>
        <Button
            onClick={() => editarPersona(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit  />
          </Button>
          <Button
            size="sm"
            // onClick={() => eliminarUsuario(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ),
    },
  ];

  return (
    <>
      <BordeSuperior />
      <Topbar />
      <h1 className="title">Catálogo de usuarios</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
        {/* Botón para abrir el modal de agregar */}
        <Button variant="primary" onClick={handleModal} className="mt-3 mb-0 btn-save">
          <FaPlus className="me-2" size={24} />
          Agregar
        </Button>
  
        {/* Tabla */}
        <Grid
          gridHeading={encabezadoTabla}
          gridData={listaUsuarios}
          filterColumns={["identificacion", "nombreCompleto", "rol", "puesto", "correoElectronico"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar */}
      <Modal show={showModal} onHide={handleModal} size={'lg'}>
        <Modal.Header closeButton={false} className="d-flex align-items-center">
          <Modal.Title>{isEditing ? "Editar usuario" : "Agregar usuario"}</Modal.Title>
          <Button className="ms-auto btn-cancel" onClick={handleModal}>
            <AiOutlineClose />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formPersona">
                  <Form.Label>Persona</Form.Label>
                  <Input
                        type="select"
                        id="opcion"
                        // value={selectedPersona || ''}
                        // onChange={handleOpcionChange}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '2%'}}
                    >
                        <option value="">Seleccione</option>
                        {personas.map(persona => (
                            <option key={persona.idPersona} value={persona.idPersona}>{persona.nombreCompleto}</option>
                        ))}
                    </Input>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formIdentificacion">
                  <Form.Label>Identificación</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificacion"
                    value={identificacion || ""} // Valor opcional
                    maxLength={50}
                    pattern="\d*"
                    title="Solo se permiten números" 
                    readOnly
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
                    // value={nuevaPersona.departamento}
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
                    // value={nuevaPersona.puesto } 
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
                    // value={nuevaPersona.telefono} 
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
                    // value={nuevaPersona.email}
                    onChange={handleChange}
                    required
                    maxLength={100} 
                  />
                </Form.Group>
              </Col>
            </Row>
            <div style={{display: 'flex', justifyContent: 'end'}}>
              <Button  
                      type="submit" 
                      className="mt-3 mb-0 btn-crear"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        alignContent: 'center',
                        backgroundColor: '#548454'
                      }}
              >
                <RiSaveFill className="me-2" size={24} />
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default CatalogoPersonas;
