import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Modal, Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { 
  ObtenerUsuarios,
  ObtenerRoles,
  AgregarUsuario,
  EliminarUsuario,
  ActualizarUsuario
} from "../../../servicios/ServicioUsuario";
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
  estado: string;
  contrasennaT: string;
}

// Componente principal
function CatalogoPersonas() {
  const [listaUsuarios, setUsuarios] = useState<Usuario[]>([]);
  const [correoE, setCorreoE] = useState<string>("");
  const [rol, setRol] = useState<string>("");
  const [identificacion, setIdentificacion] = useState<string>("");
  const [contrasennaT, setContrasennaT] = useState<string>("");
  const [persona, setPersona] = useState<string>("");
  const [personas, setPersonas] = useState<any>([]);
  const [roles, setRoles] = useState<any>([]);
  const [estados] = useState<any>([{idEstado: 1, estado: "Activo"}, {idEstado: 0, estado: 'Inactivo'}]);
  const [estado, setEstado] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
    obtenerPersonas();
    obtenerRoles();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const response = await ObtenerUsuarios();
      setUsuarios(response);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const obtenerPersonas = async () => {
    try {
      const response = await ObtenerPersonas();
      setPersonas(response.filter((x:any) => x.estado === true));
    } catch (error) {
      console.error("Error al obtener personas:", error);
    }
  };

  const obtenerRoles = async () => {
    try {
      const response = await ObtenerRoles();
      setRoles(response);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  }

  // Función para inhabilitar un usuario
  const eliminar = async (usuario: Usuario) => {
    try {

      const data = {
        idUsuario: usuario.idUsuario
      }

      const response = await EliminarUsuario(data);

        if (response.indicador === 1) {
            Swal.fire({
                icon: 'success',
                title: response.mensaje,      
            });
            obtenerUsuarios();
          } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.mensaje,
            });
          }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // Función para abrir el modal y editar
  const editarUsuario = (usuario: any) => {
    setCorreoE(usuario.correoElectronico);
    setEstado(usuario.estado ? "1" : "0");
    setRol(usuario.idRol);
    setIdentificacion(usuario.identificacion)
    setPersona(usuario.idPersona);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setCorreoE('');
    setEstado('');
    setRol('');
    setIdentificacion('')
    setPersona('');
  };

  // Maneja los cambios en el formulario del modal
  const handlePersonaChange = (e: any) => {
    if(e.target.value !== ''){
      const idPersona = e.target.value

      const correoE = personas.filter((x: any) => x.idPersona == idPersona)[0].email;
      const identificacion = personas.filter((x: any) => x.idPersona == idPersona)[0].identificacion;

      setCorreoE(correoE);
      setIdentificacion(identificacion);   
      setPersona(idPersona); 
    }
    else{
      setCorreoE('');
      setIdentificacion('');
      setPersona('');
    }
  }

  const handleRolChange = (e: any) => {
      setRol(e.target.value);
  }

  const handleEstadoChange = (e: any) => {
    setEstado(e.target.value);
  }

  const handlePassChange = (e: any) => {
    setContrasennaT(e.target.value);
  }

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      try {

        const identificacionUsuario = localStorage.getItem('identificacionUsuario');

        const usuario = {
          idPersona: persona,
          idRol: rol,
          correoElectronico: correoE,
          contrasennaTemporal: contrasennaT,
          estado: estado === '1' ? true : false,
          idUsuario: 0,
          usuarioModificacion: identificacionUsuario,
          fechaModificacion: (new Date()).toISOString(),
          contrasenna: ''
        };
        
        const response = await ActualizarUsuario(usuario);

        if (response.indicador === 1) {
            Swal.fire({
                icon: 'success',
                title: response.mensaje,      
            });
            obtenerUsuarios();
          } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.mensaje,
            });
          }

      } catch (error) {
        console.error("Error al actualizar usuario:", error);
      }
    } else {
      try {      
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');

        const nuevoUsuario = {
          idPersona: persona,
          idRol: rol,
          correoElectronico: correoE,
          contrasennaTemporal: contrasennaT,
          estado: estado === '1' ? true : false,
          idUsuario: 0,
          usuarioCreacion: identificacionUsuario,
          fechaCreacion: (new Date()).toISOString(),
          contrasenna: ''
        };

        const response  = await AgregarUsuario(nuevoUsuario);

        if (response.indicador === 1) {
            Swal.fire({
                icon: 'success',
                title: response.mensaje,      
            });
            obtenerUsuarios();
          } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.mensaje,
            });
          }
      } catch (error) {
        console.error("Error al crear la usuario:", error);
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
            onClick={() => editarUsuario(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit  />
          </Button>
          <Button
            size="sm"
             onClick={() => eliminar(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ),
    },
  ];

  return (
    <>
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
                        onChange={handlePersonaChange}
                        value={persona}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                    >
                        <option value="">Seleccione</option>
                        {personas.map((persona: any) => (
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
                    style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formRol">
                  <Form.Label style={{marginTop: '3%'}}>Rol</Form.Label>
                  <Input
                        type="select"
                        id="rol"
                        value={rol}
                        onChange={handleRolChange}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                    >
                        <option value="">Seleccione</option>
                        {roles.map((rol: any) => (
                            <option key={rol.idRol} value={rol.idRol}>{rol.rol}</option>
                        ))}
                    </Input>
                </Form.Group>
              </Col>              
              <Col md={6}>
                <Form.Group controlId="formCorreoE">
                  <Form.Label style={{marginTop: '3%'}}>Correo electrónico</Form.Label>
                  <Form.Control
                    type="text"
                    name="correoElectronico"
                    value={correoE || ""} // Valor opcional
                    maxLength={50}
                    readOnly
                    style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formContrasennaT">
                  <Form.Label style={{marginTop: '3%'}}>Contraseña temporal</Form.Label>
                  <Form.Control
                    type="text"
                    name="contrasennaT"
                    onChange={handlePassChange}
                    maxLength={50}
                    style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEstado">
                  <Form.Label style={{marginTop: '3%'}}>Estado</Form.Label>
                  <Input
                        type="select"
                        id="opcion"
                        onChange={handleEstadoChange}
                        value={estado}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                    >
                        <option value="">Seleccione</option>
                        {estados.map((estado: any) => (
                            <option key={estado.idEstado} value={estado.idEstado}>{estado.estado}</option>
                        ))}
                    </Input>
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
