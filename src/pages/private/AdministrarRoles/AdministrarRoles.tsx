import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { 
  ObtenerRoles,
  ObtenerCategoriaMenu,
  ObtenerOpcionMenu,
  CrearRol,
  ObtenerAccesoMenuPorRol,
  ActualizarRol
} from "../../../servicios/ServicioUsuario";
import { FaTrash } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { RiAddLine } from "react-icons/ri";
import { AlertDismissible } from "../../../components/alert/alert";
import CustomModal from "../../../components/modal/CustomModal";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import Select from "react-select"
import { useConfirm } from "../../../context/confirmContext";

// Componente principal
function AdministrarRoles() {
  
  const { setShowSpinner } = useSpinner();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [opciones, setOpciones] = useState<any[]>([]);
  const [opcionesRol, setOpcionesRol] = useState<any[]>([]);  
  const [roles, setRoles] = useState<any[]>([]);
  const [rol, setRol] = useState<string>("");
  const [nombreRol, setNombreRol] = useState<string>("");
  const [opcionSelected, setOpcionSelected] = useState<string>("");
  const [estado, setEstado] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});
  const { openConfirm } = useConfirm();

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setShowSpinner(true);    
    await obtenerCategoriaMenu();
    await obtenerOpcionesMenu();
    await obtenerRoles();
    setShowSpinner(false);
  }

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
    setEstado(rol.estado);
    setRol(rol.idRol);
    setNombreRol(rol.rol)
    setIsEditing(true);
    setShowModal(true);
    obtenerOpcionesMenuPorRol(rol.idRol);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setEstado(false);
    setRol('');
    setNombreRol('');
    setOpcionesRol([]);
  };

  // Maneja los cambios en el formulario del modal
  const handleCategoriaChange = (e: any) => {

    if(e !== '')
      obtenerOpcionesMenu(e.value);
    else
      obtenerOpcionesMenu(); 
  }

  const agregaOpcion = () => {

    if(opcionSelected){
      const opcion = opciones.filter((x: any) => x.idOpcion === parseInt(opcionSelected))[0];

      if(opcionesRol.find((x: any) => x.idOpcion == parseInt(opcionSelected))){        
        setShowAlert(true);
        setMensajeRespuesta({indicador: 1, mensaje: "El rol ya cuenta con acceso a esta opción"});
      }
      else{      
        const data = {
          idOpcion: opcion.idOpcion,
          categoria: categorias.filter((x: any) => x.idCategoria === opcion.idCategoria)[0].descripcion,
          opcion: opcion.descripcion
        };

        setOpcionesRol((prevOpcionesRol: any[]) => [...prevOpcionesRol, data]);

        setShowAlert(true);
        setMensajeRespuesta({indicador: 0, mensaje: "Opción agregada para el rol"});
      }
    }
    else{
      setShowAlert(true);
      setMensajeRespuesta({indicador: 1, mensaje: "Debe elegir una opción para agregar"});
    }
  }

  const eliminarOpcion = (opcion: any) => {
    openConfirm("¿Está seguro que desea eliminar el acceso?", () => {
      setOpcionesRol((prevOpcionesRol: any[]) =>
        prevOpcionesRol.filter((op: any) => op.idOpcion !== opcion.idOpcion)
      );

      setShowAlert(true);
      setMensajeRespuesta({indicador: 0, mensaje: 'Acceso eliminado'}); 
    });      
  }

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setShowSpinner(true);
    if (isEditing) {
      try {
        if(nombreRol === ''){
          setShowAlert(true);
          setMensajeRespuesta({indicador: 1, mensaje: 'Debe indicar el nombre del rol'});
        }
        else{

          const identificacionUsuario = localStorage.getItem('identificacionUsuario');

          let opcionesRolBD = "";

          opcionesRol.forEach(op => {
            opcionesRolBD += op.idOpcion  + ","
          });

          const nuevoRol = {
            idRol: rol,
            nombreRol: nombreRol,
            estado: estado,
            opcionesMenu: opcionesRolBD,
            usuarioModificacion: identificacionUsuario,
            fechaModificacion: (new Date()).toISOString()
          };

          const response  = await ActualizarRol(nuevoRol);

          if (response.indicador === 0) {
            obtenerRoles();           
            handleModal(); // Cierra el modal 
          }        
          
          setShowAlert(true);
          setMensajeRespuesta(response);
        }

      } catch (error) {
        console.error("Error al actualizar rol:", error);
      }
    } else {
      try {      
        if(nombreRol === ''){
          setShowAlert(true);
          setMensajeRespuesta({indicador: 1, mensaje: 'Debe indicar el nombre del rol'});
        }
        else{
          const identificacionUsuario = localStorage.getItem('identificacionUsuario');

          let opcionesRolBD = "";

          opcionesRol.forEach(op => {
            opcionesRolBD += op.idOpcion  + ","
          });

          const nuevoRol = {
            nombreRol: nombreRol,
            estado: estado,
            opcionesMenu: opcionesRolBD,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: (new Date()).toISOString()
          };

          const response  = await CrearRol(nuevoRol);

          if (response.indicador === 0) {
            obtenerRoles();           
            handleModal(); // Cierra el modal 
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
      } catch (error) {
        console.error("Error al crear rol:", error);
      }
    }

    setShowSpinner(false);
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
      name: "Acción",
      cell: (row: any) => (
        <>
        <Button
            onClick={() => editarRol(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit  />
          </Button>     
        </>
      ), width:"px"
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
      name: "Acción",
      cell: (row: any) => (
        <>
          <Button
            size="sm"
             onClick={() => eliminarOpcion(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  return (
    <>
      <h1 className="title">Administración de roles</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
      {showAlert && (
        <AlertDismissible
        mensaje={mensajeRespuesta}
        setShow={setShowAlert}
        />
      )}
      <br />  
        {/* Tabla */}
        <Grid
          gridHeading={encabezadoTabla}          
          handle={handleModal}
          buttonVisible={true}
          gridData={roles}
          filterColumns={["rol", "estado", "rol"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar */}
      <CustomModal
          show={showModal}
          onHide={handleModal}
          title={isEditing ? "Editar rol" : "Agregar rol"}
          showSubmitButton={true}
          submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
          formId="formRol"
          >
          <Form onSubmit={handleSubmit} id="formRol">
            <Row>
              <Col md={6}>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre*</Form.Label>
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
                <Form.Group controlId="formEstado">
                  <div style={{
                      display: 'flex',
                      alignContent: 'start',
                      alignItems: 'start',
                      flexDirection: 'column'
                    }}>
                    <Form.Label style={{marginBottom: '3.5%'}}>Rol activo</Form.Label>
                    <div className="w-100">
                    <BootstrapSwitchButton
                      checked={estado === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;" // Ajusta este valor según el tamaño deseado
                      onChange={(checked) => setEstado(checked)}
                    />
                    </div>
                  </div>
                </Form.Group>
              </Col>
              <Col md={12}><br /></Col>
              <Col md={4}>
                <Form.Group controlId="formPermAgregar">
                    <Form.Label style={{marginTop: '1%'}}>Categoría</Form.Label>
                    <Select
                      onChange={(e: any) => handleCategoriaChange(e)}
                      className="GrupoFiltroAdmRoles"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'
                        }),
                      }}
                      placeholder="Seleccione"
                      options={categorias.map((cat: any) => ({
                        value: cat.idCategoria,
                        label: cat.descripcion,
                      }))}      
                      noOptionsMessage={() => "Opción no encontrada"}     
                    /> 
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="formPermAgregar">
                    <Form.Label style={{marginTop: '1%'}}>Opción</Form.Label>
                    <Select
                      onChange={(e: any) => setOpcionSelected(e.value)}
                      className="GrupoFiltroAdmRoles"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: '16px', padding: '2%', outline: 'none', marginTop: '1%'
                        }),
                      }}
                      placeholder="Seleccione"
                      options={opciones.map((cat: any) => ({
                        value: cat.idOpcion,
                        label: cat.descripcion,
                      }))}      
                      noOptionsMessage={() => "Opción no encontrada"}     
                    /> 
                </Form.Group>
              </Col>
              <Col md={4} style={{marginTop: '2.8%', paddingRight: '0px', marginRight: '0px'}}>              
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
                <Grid
                  gridHeading={encabezadoTablaModal}
                  gridData={opcionesRol}
                  selectableRows={false}
                ></Grid>
              </Col>
            </Row>            
          </Form>
        </CustomModal>
    </>
  );
}

export default AdministrarRoles;
