import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerJerarquiasDoc, CrearJerarquiaDoc, EliminarJerarquiaDoc, ActualizarJerarquiaDoc } from "../../../servicios/ServicioJerarquiasDocumentos";
import { FaTrash } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal"; 
import { AlertDismissible } from "../../../components/alert/alert";


// Interfaz
interface JerarquiaDocumento {
    idJerarquiaDoc: string;
    codigo: string;
    descripcion: string;
    usuarioCreacion: string;
    usuarioModificacion: string;
  }

// Componente principal
function CatalogoJerarquiasDocumentos() {
  const [listaJerarquiasDocumentos, setListaJerarquiasDocumentos] = useState<JerarquiaDocumento[]>([]);
  const [showModal, setShowModal] = useState(false);
const [nuevaJerarquiaDocumento, setNuevaJerarquiaDocumento] = useState<JerarquiaDocumento>({
  idJerarquiaDoc: "0",
  codigo: "",
  descripcion: "",
  usuarioCreacion: "",
  usuarioModificacion: ""
});
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

  useEffect(() => {
    obtenerJerarquiasDoc();
  }, []);

  // Función para obtener todas las  jerarquías
  const obtenerJerarquiasDoc = async () => {
    try {
      const jerarquiasDoc = await ObtenerJerarquiasDoc();
      setListaJerarquiasDocumentos(jerarquiasDoc);
    } catch (error) {
      console.error("Error al obtener las jerarquías de documentos:", error);
    }
  };

  // Función para eliminar una jerarquía
  const eliminarJerarquiaDoc = async (jerarquiasDoc: JerarquiaDocumento) => {
    try {

      const response = await EliminarJerarquiaDoc(jerarquiasDoc);

      if(response){
        setShowAlert(true);
        setMensajeRespuesta(response);
            obtenerJerarquiasDoc();
      }else{
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al eliminar la jerarquía de documento" });
      }
    } catch (error) {
      setShowAlert(true);
      setMensajeRespuesta({indicador : 1, mensaje : "Error al eliminar la jerarquía de documento" });
    }
  };

  // Función para abrir el modal y editar una jerarquía
  const editarJerarquiaDocumento = (jerarquiaDocumento: JerarquiaDocumento) => {
    setNuevaJerarquiaDocumento(jerarquiaDocumento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevaJerarquiaDocumento({
        idJerarquiaDoc: "0",
        codigo: "",
        descripcion: "",
        usuarioCreacion: "",
        usuarioModificacion: ""
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaJerarquiaDocumento({
      ...nuevaJerarquiaDocumento,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar una jerarquía
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identificacionUsuario = localStorage.getItem('identificacionUsuario');
  
    if (isEditing) {
      // Editar jerarquía
      try {
        const jerarquiaDocActualizar = { ...nuevaJerarquiaDocumento, usuarioModificacion: identificacionUsuario };
        const response = await ActualizarJerarquiaDoc(jerarquiaDocActualizar);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerJerarquiasDoc();
        }else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar la jerarquía de documento" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al actualizar la jerarquía de documento" });
      }
    } else {
      // Crear jerarquía de documento
      try {
        const jerarquiaDocACrear = { ...nuevaJerarquiaDocumento, idJerarquiaDoc: "0", usuarioCreacion: identificacionUsuario };
        const response = await CrearJerarquiaDoc(jerarquiaDocACrear);
  
        if(response){
          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerJerarquiasDoc();
        }else{
          setShowAlert(true);
          setMensajeRespuesta({indicador : 1, mensaje : "Error al crear la jerarquía de documento" });
        }
      } catch (error) {
        setShowAlert(true);
        setMensajeRespuesta({indicador : 1, mensaje : "Error al crear la jerarquía de documento" });
      }
    }
  
    handleModal();  // Cierra el modal 
  };

  // Encabezados de la tabla con acciones
  const encabezadoJerarquiasDoc = [
    { id: "codigo", name: "Código", selector: (row: JerarquiaDocumento) => row.codigo, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "descripcion", name: "Descripción", selector: (row: JerarquiaDocumento) => row.descripcion, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: JerarquiaDocumento) => (
        <>
          <Button
            onClick={() => editarJerarquiaDocumento(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarJerarquiaDoc(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  return (
    <>
      <h1 className="title">Catálogo Jerarquía de Documentos</h1>
      <div style={{ padding: "20px" }}>
        {showAlert && (
          <AlertDismissible
          mensaje={mensajeRespuesta}
          setShow={setShowAlert}
          />
        )}
        {/* Tabla de Jerarquía de Documentos*/}
        <Grid
          gridHeading={encabezadoJerarquiasDoc}
          gridData={listaJerarquiasDocumentos}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigo", "descripcion"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar una Jerarquía de Documentos */}
      <CustomModal
          show={showModal}
          onHide={handleModal}
          title={isEditing ? "Editar Jerarquía de Documento" : "Agregar Jerarquía de Documento"}
          showSubmitButton={true} 
          submitButtonLabel={isEditing ? "Actualizar" : "Guardar"} 
          formId="formJerarquiaDoc"
        >
        <Form id="formJerarquiaDoc" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoJerarquiaDoc">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  value={nuevaJerarquiaDocumento.codigo}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionJerarquiaDoc">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevaJerarquiaDocumento.descripcion || ""}
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

export default CatalogoJerarquiasDocumentos;
