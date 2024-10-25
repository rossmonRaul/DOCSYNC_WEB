import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerEstados, CrearEstado, EliminarEstado, ActualizarEstado } from "../../../servicios/ServicioEstados";
import { FaBan, FaRedo } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal"; // Importar el nuevo modal
import { AlertDismissible } from "../../../components/alert/alert";
import { useConfirm } from "../../../context/confirmContext";


// Interfaz para la información de el estado
interface Estado {
    idEstado: string;
    codigoEstado: string;
    descripcionEstado: string;
    usuarioCreacion: string;
    usuarioModificacion: string;
    estado: boolean;
  }

// Componente principal
function CatalogoEstados() {
  const [listaEstados, setListaEstados] = useState<Estado[]>([]);
  const [showModal, setShowModal] = useState(false);
const [nuevaEstado, setNuevaEstado] = useState<Estado>({
  idEstado: "0",
  codigoEstado: "",
  descripcionEstado: "",
  usuarioCreacion: "",
  usuarioModificacion: "",
  estado: false
});
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { openConfirm } = useConfirm();
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

  useEffect(() => {
    obtenerEstados();
  }, []);

  // Función para obtener todos los estados
  const obtenerEstados = async () => {
    try {
      const estados = await ObtenerEstados();
      setListaEstados(estados);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }
  };

  // Función para eliminar un estado
  const eliminarEstado = async (estado: Estado) => {
    openConfirm("¿Está seguro que desea inactivar?", async () => {
    try {

      const response = await EliminarEstado(estado);

      if(response){
        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerEstados();
      }else{
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al eliminar el estado" });
      }
    } catch (error) {

      setShowAlert(true);
      setMensajeRespuesta({indicador : 1, mensaje : "Error al eliminar el estado" });
    }
  })
  };

  // Función para abrir el modal y editar un estado
  const editarEstado = (estado: Estado) => {
    setNuevaEstado(estado);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevaEstado({
        idEstado: "0",
        codigoEstado: "",
        descripcionEstado: "",
        usuarioCreacion: "",
        usuarioModificacion: "",
        estado: false
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaEstado({
      ...nuevaEstado,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar un estado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identificacionUsuario = localStorage.getItem('identificacionUsuario');
  
    if (isEditing) {
      // Editar estado
      try {
        const estadoActualizar = { ...nuevaEstado, usuarioModificacion: identificacionUsuario };
        const response = await ActualizarEstado(estadoActualizar);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerEstados();
        }else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar el estado" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar el estado" });
      }
    } else {
      // Crear estado
      try {
        const estadoACrear = { ...nuevaEstado, idEstado: "0", usuarioCreacion: identificacionUsuario };
        const response = await CrearEstado(estadoACrear);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerEstados();
        } else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al crear el estado" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al crear el estado" });
      }
    }
  
    handleModal();  // Cierra el modal 
  };

  // Encabezados de la tabla con acciones
  const encabezadoEstados = [
    { id: "codigoEstado", name: "Código", selector: (row: Estado) => row.codigoEstado, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "descripcionEstado", name: "Descripción", selector: (row: Estado) => row.descripcionEstado, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: Estado) => (
        <>
          <Button
            onClick={() => editarEstado(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarEstado(row)}
            className="bg-secondary">
            {row.estado ? <FaBan /> : <FaRedo/>}
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  return (
    <>
      <h1 className="title">Catálogo de Estados</h1>
      <div style={{ padding: "20px" }}>
       {showAlert && (
          <AlertDismissible
          mensaje={mensajeRespuesta}
          setShow={setShowAlert}
          />
        )}
        {/* Tabla de estados */}
        <Grid
          gridHeading={encabezadoEstados}
          gridData={listaEstados}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigoEstado", "descripcionEstado"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar un estado */}
      <CustomModal show={showModal} 
      onHide={handleModal} 
      title={isEditing ? "Editar Estado" : "Agregar Estado"}
      showSubmitButton={true} 
      submitButtonLabel={isEditing ? "Actualizar" : "Guardar"} 
      formId="formEstado">
        <Form  id="formEstado" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoEstado">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigoEstado"
                  value={nuevaEstado.codigoEstado}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionEstado">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcionEstado"
                  value={nuevaEstado.descripcionEstado || ""}
                  onChange={handleChange}
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

export default CatalogoEstados;
