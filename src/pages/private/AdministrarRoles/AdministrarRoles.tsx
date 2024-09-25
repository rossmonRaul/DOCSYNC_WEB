import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Modal, Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { 
  ObtenerRoles,
  ObtenerCategoriaMenu,
  ObtenerOpcionMenu,
  CrearRol,
  ObtenerAccesoMenuPorRol,
  ActualizarRol
} from "../../../servicios/ServicioUsuario";
import { FaTrash ,FaPlus } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AiOutlineClose  } from "react-icons/ai";
import { RiAddLine, RiSaveFill } from "react-icons/ri";
import Swal from "sweetalert2";
import { Input } from 'reactstrap';


// Componente principal
function AdministrarRoles() {
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [opciones, setOpciones] = useState<any[]>([]);
  const [opcionesRol, setOpcionesRol] = useState<any[]>([]);  
  const [roles, setRoles] = useState<any[]>([]);
  const [rol, setRol] = useState<string>("");
  const [nombreRol, setNombreRol] = useState<string>("");
  const [permiteVer, setPermiteVer] = useState<string>("");
  const [permiteAgregar, setPermiteAgregar] = useState<string>("");
  const [permiteDescargar, setPermiteDescargar] = useState<string>("");
  const [categoriaSelected, setCategoriaSelected] = useState<string>("");
  const [opcionSelected, setOpcionSelected] = useState<string>("");
  const [estados] = useState<any>([{idEstado: 1, estado: "Activo"}, {idEstado: 0, estado: 'Inactivo'}]);
  const [estado, setEstado] = useState<string>("");
  const [permisos] = useState<any>([{idPermiso: 1, permiso: "Sí"}, {idPermiso: 0, permiso: 'No'}]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    obtenerRoles();
    obtenerCategoriaMenu();
    obtenerOpcionesMenu();
  }, []);

  const obtenerRoles = async () => {
    try {    
      const response = await ObtenerRoles();      
      setRoles(response);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  }

  const obtenerCategoriaMenu = async () => {
    try {    
      const categorias = await ObtenerCategoriaMenu();      
      setCategorias(categorias);
    } catch (error) {
      console.error("Error al obtener menu:", error);
    }
  }

  const obtenerOpcionesMenu = async (idCategoria?: any) => {
    try {    
      const response = await ObtenerOpcionMenu();

      if(idCategoria)
        setOpciones(response.filter((x: any) => x.idCategoria === parseInt(idCategoria)));        
      else
        setOpciones(response);

      setOpcionSelected('');

    } catch (error) {
      console.error("Error al obtener menu:", error);
    }
  }

  const obtenerOpcionesMenuPorRol = async (rol: any) => {
    const response = await ObtenerAccesoMenuPorRol({idRol: rol});

    const data = [] as any;

    response.forEach((element: any) => {
      data.push({
          idOpcion: element.idOpcionMenu,
          categoria: element.nombreCategoria,
          opcion: element.name
      });
    });

    setOpcionesRol(data);
  }

  // Función para abrir el modal y editar
  const editarRol = (rol: any) => {
    setEstado(rol.estado ? "1" : "0");
    setRol(rol.idRol);
    setPermiteAgregar(rol.permiteAgregar ? "1" : "0");
    setPermiteDescargar(rol.permiteDescargar ? "1" : "0");
    setPermiteVer(rol.setPermiteVer ? "1" : "0");
    setNombreRol(rol.rol)
    setIsEditing(true);
    setShowModal(true);
    obtenerOpcionesMenuPorRol(rol.idRol);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setEstado('');
    setRol('');
    setNombreRol('');
    setPermiteAgregar('');
    setPermiteDescargar('');
    setPermiteVer('');
    setOpcionesRol([]);
  };

  // Maneja los cambios en el formulario del modal
  const handleCategoriaChange = (e: any) => {

    if(e.target.value !== '')
      obtenerOpcionesMenu(e.target.value);
    else
      obtenerOpcionesMenu();

    setCategoriaSelected(e.target.value);
 
  }

  const agregaOpcion = () => {

    if(opcionSelected){
      const opcion = opciones.filter((x: any) => x.idOpcion === parseInt(opcionSelected))[0];

      if(opcionesRol.find((x: any) => x.idOpcion == parseInt(opcionSelected))){
        Swal.fire({
          title: 'Opción existente',
          text: 'El rol ya cuenta con acceso a esta opción',
          icon: 'warning'
        });
      }
      else{      
        const data = {
          idOpcion: opcion.idOpcion,
          categoria: categorias.filter((x: any) => x.idCategoria === opcion.idCategoria)[0].descripcion,
          opcion: opcion.descripcion
        };

        setOpcionesRol((prevOpcionesRol: any[]) => [...prevOpcionesRol, data]);

        Swal.fire({
          title: 'Opción agregada',
          text: 'Opción agregada para el rol',
          timer: 1000,
          icon: 'success'
        });

        setOpcionSelected('');
        setCategoriaSelected('');
      }
    }
    else
      Swal.fire({
        title: 'Elija una opción',
        text: 'Debe elegir una opción para agregar',
        icon: 'warning'
      });
  }

  const eliminarOpcion = (opcion: any) => {
    Swal.fire({
      title: "Eliminar acceso",
      text: "¿Estás seguro de que deseas eliminar el acceso a la opción "+opcion.opcion+"?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
              setOpcionesRol((prevOpcionesRol: any[]) =>
                prevOpcionesRol.filter((op: any) => op.idOpcion !== opcion.idOpcion)
              );
            } catch (error) {
              Swal.fire("Error al quitar el acceso para el rol", "", "error");                    
          }
      }
    });       
  }

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      try {
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');

        let opcionesRolBD = "";

        opcionesRol.forEach(op => {
          opcionesRolBD += op.idOpcion  + ","
        });

        const nuevoRol = {
          idRol: rol,
          nombreRol: nombreRol,
          estado: estado === '1' ? true : false,
          permiteAgregar: permiteAgregar === '1' ? true : false,
          permiteDescargar: permiteDescargar === '1' ? true : false,
          permiteVer: permiteVer === '1' ? true : false,
          opcionesMenu: opcionesRolBD,
          usuarioModificacion: identificacionUsuario,
          fechaModificacion: (new Date()).toISOString()
        };

        const response  = await ActualizarRol(nuevoRol);

        if (response.indicador === 1) {
          Swal.fire({
              icon: 'success',
              title: response.mensaje,      
          });
          obtenerRoles();           
          handleModal(); // Cierra el modal 
        }
        else if(response.indicador === 2){
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: response.mensaje,
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al actualizar rol:", error);
      }
    } else {
      try {      
        const identificacionUsuario = localStorage.getItem('identificacionUsuario');

        let opcionesRolBD = "";

        opcionesRol.forEach(op => {
          opcionesRolBD += op.idOpcion  + ","
        });

        const nuevoRol = {
          nombreRol: nombreRol,
          estado: estado === '1' ? true : false,
          permiteAgregar: permiteAgregar === '1' ? true : false,
          permiteDescargar: permiteDescargar === '1' ? true : false,
          permiteVer: permiteVer === '1' ? true : false,
          opcionesMenu: opcionesRolBD,
          usuarioCreacion: identificacionUsuario,
          fechaCreacion: (new Date()).toISOString()
        };

        const response  = await CrearRol(nuevoRol);

        if (response.indicador === 1) {
          Swal.fire({
              icon: 'success',
              title: response.mensaje,      
          });
          obtenerRoles();           
          handleModal(); // Cierra el modal 
        }
        else if(response.indicador === 2){
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: response.mensaje,
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al crear rol:", error);
      }
    }
  };

  // Encabezados de la tabla con acciones
  const encabezadoTabla = [
    { id: "rol", name: "Rol", selector: (row: any) => row.rol, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "estado", name: "Estado", selector: (row: any) => row.estado ? 'Activo': 'Inactivo', sortable: true, style: {
      fontSize: "1.2em",
    },},
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: any) => (
        <>
        <Button
            onClick={() => editarRol(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit  />
          </Button>     
        </>
      ),
    },
  ];

  const encabezadoTablaModal = [
    { id: "categoria", name: "Categoría", selector: (row: any) => row.categoria, sortable: true,style: {
      fontSize: "1.2em",
    }, },
    { id: "opcion", name: "Opción", selector: (row: any) => row.opcion, sortable: true, style: {
      fontSize: "1.2em",
    },},
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: any) => (
        <>
          <Button
            size="sm"
             onClick={() => eliminarOpcion(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ),
    },
  ];

  return (
    <>
      <h1 className="title">Administración de roles</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
        {/* Botón para abrir el modal de agregar */}
        <Button variant="primary" onClick={handleModal} className="mt-3 mb-0 btn-save">
          <FaPlus className="me-2" size={24} />
          Agregar
        </Button>
  
        {/* Tabla */}
        <Grid
          gridHeading={encabezadoTabla}
          gridData={roles}
          filterColumns={["identificacion", "nombreCompleto", "rol", "puesto", "correoElectronico"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar */}
      <Modal show={showModal} onHide={handleModal} size={'lg'}>
        <Modal.Header closeButton={false} className="d-flex align-items-center">
          <Modal.Title>{isEditing ? "Editar rol" : "Agregar rol"}</Modal.Title>
          <Button className="ms-auto btn-cancel" onClick={handleModal}>
            <AiOutlineClose />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={nombreRol || ""}
                    onChange={(e: any) => setNombreRol(e.target.value)}
                    maxLength={50}                    
                    style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formPermAgregar">
                  <Form.Label>Permite agregar</Form.Label>
                  <Input
                        type="select"
                        id="rol"
                        value={permiteAgregar}
                        onChange={(e: any) => setPermiteAgregar(e.target.value)}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                    >
                        <option value="">Seleccione</option>
                        {permisos.map((permiso: any) => (
                            <option key={permiso.idPermiso} value={permiso.idPermiso}>{permiso.permiso}</option>
                        ))}
                    </Input>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formRol">
                <Form.Group controlId="formPermDesc">
                  <Form.Label style={{marginTop: '3%'}}>Permite descargar</Form.Label>
                  <Input
                        type="select"
                        id="rol"
                        value={permiteDescargar}
                        onChange={(e: any) => setPermiteDescargar(e.target.value)}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                    >
                        <option value="">Seleccione</option>
                        {permisos.map((permiso: any) => (
                            <option key={permiso.idPermiso} value={permiso.idPermiso}>{permiso.permiso}</option>
                        ))}
                    </Input>
                </Form.Group>
                </Form.Group>
              </Col>              
              <Col md={6}>
              <Form.Group controlId="formPermVer">
                  <Form.Label style={{marginTop: '3%'}}>Permite ver</Form.Label>
                  <Input
                        type="select"
                        id="rol"
                        value={permiteVer}
                        onChange={(e: any) => setPermiteVer(e.target.value)}
                        className="custom-select"
                        style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                    >
                        <option value="">Seleccione</option>
                        {permisos.map((permiso: any) => (
                            <option key={permiso.idPermiso} value={permiso.idPermiso}>{permiso.permiso}</option>
                        ))}
                    </Input>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEstado">
                  <Form.Label style={{marginTop: '3%'}}>Estado</Form.Label>
                  <Input
                        type="select"
                        id="opcion"
                        onChange={(e: any) => setEstado(e.target.value)}
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
              <Col md={6}></Col>
              <Col md={4}>
                <Form.Group controlId="formPermAgregar">
                    <Form.Label style={{marginTop: '5%'}}>Categoria</Form.Label>
                    <Input
                          type="select"
                          id="rol"
                          value={categoriaSelected}
                          onChange={handleCategoriaChange}
                          className="custom-select"
                          style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                      >
                          <option value="">Seleccione</option>
                          {categorias.map((cat: any) => (
                              <option key={cat.idCategoria} value={cat.idCategoria}>{cat.descripcion}</option>
                          ))}
                      </Input>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="formPermAgregar">
                    <Form.Label style={{marginTop: '5%'}}>Opción</Form.Label>
                    <Input
                          type="select"
                          id="rol"
                          value={opcionSelected}
                          onChange={(e: any) => setOpcionSelected(e.target.value)}
                          className="custom-select"
                          style={{fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'}}
                      >
                          <option value="">Seleccione</option>
                          {opciones.map((op: any) => (
                              <option key={op.idOpcion} value={op.idOpcion}>{op.descripcion}</option>
                          ))}
                      </Input>
                </Form.Group>
              </Col>
              <Col md={4} style={{marginTop: '3.8%', paddingRight: '0px', marginRight: '0px'}}>              
                  <Button  
                    type="button" 
                    className="mt-3 mb-0 btn-save"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}
                    onClick={() => agregaOpcion()}
                  >  
                    <RiAddLine className="me-2" size={24} />
                    Agregar opción
                  </Button>     
              </Col>
              <Col md={12}>
              <br />
                <Grid
                  gridHeading={encabezadoTablaModal}
                  gridData={opcionesRol}
                  selectableRows={false}
                ></Grid>
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

export default AdministrarRoles;
