import { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form , Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerTiposDocumentos, CrearTipoDocumento, EliminarTipoDocumento, ActualizarTipoDocumento } from "../../../servicios/ServicioTiposDocumentos";
import { FaTrash ,FaPlus } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal"; // Importar el nuevo modal
import { RiSaveFill } from "react-icons/ri";
import Swal from "sweetalert2";


// Interfaz para la información del tipo de documento
interface TipoDocumento {
    idTipoDocumento: string;
    codigo: string;
    descripcion: string;
    usuarioCreacion: string;
    usuarioModificacion: string;
  }

// Componente principal
function CatalogoTiposDocumentos() {
  const [listaTiposDocumentos, setListaTiposDocumentos] = useState<TipoDocumento[]>([]);
  const [showModal, setShowModal] = useState(false);
const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState<TipoDocumento>({
  idTipoDocumento: "0",
  codigo: "",
  descripcion: "",
  usuarioCreacion: "",
  usuarioModificacion: ""
});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    obtenerTiposDocumentos();
  }, []);

  // Función para obtener todas los tipos de documentos
  const obtenerTiposDocumentos = async () => {
    try {
      const tiposDocumentos = await ObtenerTiposDocumentos();
      setListaTiposDocumentos(tiposDocumentos);
    } catch (error) {
      console.error("Error al obtener los tipos de documentos:", error);
    }
  };

  // Función para eliminar un tipo de documento
  const eliminarTipoDocumento = async (tipoDocumento: TipoDocumento) => {
    try {

      const response = await EliminarTipoDocumento(tipoDocumento);

        if (response.indicador === 0) {
            Swal.fire({
                icon: 'success',
                title: response.mensaje,      
            });
            obtenerTiposDocumentos();
          } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.mensaje,
            });
          }
    } catch (error) {
      console.error("Error al eliminar tipo de documento:", error);
    }
  };

  // Función para abrir el modal y editar un tipo de documento
  const editarTipoDocumento = (tipoDocumento: TipoDocumento) => {
    setNuevoTipoDocumento(tipoDocumento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNuevoTipoDocumento({
        idTipoDocumento: "0",
        codigo: "",
        descripcion: "",
        usuarioCreacion: "",
        usuarioModificacion: ""
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoTipoDocumento({
      ...nuevoTipoDocumento,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar un tipo de dotcumento 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identificacionUsuario = localStorage.getItem('identificacionUsuario');
  
    if (isEditing) {
      // Editar tipo de dotcumento 
      try {
        const tipoDocumentoActualizar = { ...nuevoTipoDocumento, usuarioModificacion: identificacionUsuario };
        const response = await ActualizarTipoDocumento(tipoDocumentoActualizar);
  
        if (response.indicador === 0) {
          Swal.fire({
            icon: 'success',
            title: response.mensaje,
          });
          obtenerTiposDocumentos();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al actualizar el tipo de documento:", error);
      }
    } else {
      // Crear tipo de documento
      try {
        const tipoDocumentoACrear = { ...nuevoTipoDocumento, idTipoDocumento: "0", usuarioCreacion: identificacionUsuario };
        const response = await CrearTipoDocumento(tipoDocumentoACrear);
  
        if (response.indicador === 0) {
          Swal.fire({
            icon: 'success',
            title: response.mensaje,
          });
          obtenerTiposDocumentos();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al crear el tipo de documento:", error);
      }
    }
  
    handleModal();  // Cierra el modal 
  };

  // Encabezados de la tabla con acciones
  const encabezadoTiposDocumentos = [
    { id: "codigo", name: "Código", selector: (row: TipoDocumento) => row.codigo, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    { id: "descripcion", name: "Descripción", selector: (row: TipoDocumento) => row.descripcion, sortable: true, style: {
      fontSize: "1.2em",
    }, },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: TipoDocumento) => (
        <>
          <Button
            onClick={() => editarTipoDocumento(row)}
            size="sm"
            className="bg-secondary me-1">
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminarTipoDocumento(row)}
            className="bg-secondary">
            <FaTrash />
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  return (
    <>
      <h1 className="title">Catálogo Tipos de Documentos</h1>
      <div style={{ padding: "20px" }}>
        {/* Tabla de tipos de documentos */}
        <Grid
          gridHeading={encabezadoTiposDocumentos}
          gridData={listaTiposDocumentos}
          handle={handleModal}
          buttonVisible={true}
          filterColumns={["codigo", "descripcion"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar un tipo de documento */}
      <CustomModal
          show={showModal}
          onHide={handleModal}
          title={isEditing ? "Editar Tipo de Documento" : "Agregar Tipo de Documento"}
          showSubmitButton={true} 
          submitButtonLabel={isEditing ? "Actualizar" : "Guardar"} 
          formId="formTipoDocumento"
        >
        <Form id="formTipoDocumento" onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="formCodigoTipoDocumento">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo"
                  value={nuevoTipoDocumento.codigo}
                  onChange={handleChange}
                  required
                  maxLength={3}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDescripcionTipoDocumento">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevoTipoDocumento.descripcion || ""}
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

export default CatalogoTiposDocumentos;
