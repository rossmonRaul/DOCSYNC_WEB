import { useState, useEffect } from "react";
import BordeSuperior from "../../../components/bordesuperior/BordeSuperior";
import Topbar from "../../../components/topbar/Topbar";
import "../../../css/general.css";
import { Button, Col, Form , Modal, Row} from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import { ObtenerEstados, CrearEstado, EliminarEstado, ActualizarEstado } from "../../../servicios/ServicioEstados";
import { FaTrash ,FaPlus } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import CustomModal from "../../../components/modal/CustomModal"; // Importar el nuevo modal

import { AiOutlineClose  } from "react-icons/ai";
import { RiSaveFill } from "react-icons/ri";
import Swal from "sweetalert2";


// Interfaz para la información de la estado
interface Estado {
    idEstado: string;
    codigoEstado: string;
    descripcionEstado: string;
    usuarioCreacion: string;
    usuarioModificacion: string;
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
  usuarioModificacion: ""
});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    obtenerEstados();
  }, []);

  // Función para obtener todas las estados
  const obtenerEstados = async () => {
    try {
      const estados = await ObtenerEstados();
      setListaEstados(estados);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }
  };

  // Función para eliminar una estado
  const eliminarEstado = async (estado: Estado) => {
    try {

      const response = await EliminarEstado(estado);

        if (response.indicador === 0) {
            Swal.fire({
                icon: 'success',
                title: response.mensaje,      
            });
            obtenerEstados();
          } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.mensaje,
            });
          }
    } catch (error) {
      console.error("Error al eliminar estado:", error);
    }
  };

  // Función para abrir el modal y editar una estado
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
        usuarioModificacion: ""
    });
  };

  // Maneja los cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaEstado({
      ...nuevaEstado,
      [e.target.name]: e.target.value,
    });
  };

  // Maneja el envío del formulario para agregar o editar una estado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identificacionUsuario = localStorage.getItem('identificacionUsuario');
  
    if (isEditing) {
      // Editar estado
      try {
        const estadoActualizar = { ...nuevaEstado, usuarioModificacion: identificacionUsuario };
        const response = await ActualizarEstado(estadoActualizar);
  
        if (response.indicador === 0) {
          Swal.fire({
            icon: 'success',
            title: response.mensaje,
          });
          obtenerEstados();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al actualizar la estado:", error);
      }
    } else {
      // Crear estado
      try {
        const estadoACrear = { ...nuevaEstado, idEstado: "0", usuarioCreacion: identificacionUsuario };
        const response = await CrearEstado(estadoACrear);
  
        if (response.indicador === 0) {
          Swal.fire({
            icon: 'success',
            title: response.mensaje,
          });
          obtenerEstados();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.mensaje,
          });
        }
      } catch (error) {
        console.error("Error al crear la estado:", error);
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
            <FaTrash />
          </Button>      
        </>
      ), width:"120px",
    },
  ];

  return (
    <>
      <BordeSuperior />
      <Topbar />
      <h1 className="title">Catálogo de Estados</h1>
      <div style={{ padding: "20px" }}>
        {/* Botón para abrir el modal de agregar estado */}
        <Button variant="primary" onClick={handleModal} className="mt-3 mb-0 btn-save">
          <FaPlus className="me-2" size={24} />
          Agregar
        </Button>
  
        {/* Tabla de estados */}
        <Grid
          gridHeading={encabezadoEstados}
          gridData={listaEstados}
          filterColumns={["codigoEstado", "descripcionEstado"]}
          selectableRows={false}
        ></Grid>
      </div>
  
      {/* Modal para agregar o editar una estado */}
      <CustomModal show={showModal} onHide={handleModal} title={isEditing ? "Editar Estado" : "Agregar Estado"}>
        <Form onSubmit={handleSubmit}>
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

          <Button variant="primary" type="submit" className="mt-3 mb-0 btn-save">
            <RiSaveFill className="me-2" size={24} />
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </Form>
      </CustomModal>
    </>
  );
}

export default CatalogoEstados;
