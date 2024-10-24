import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import {
  ActualizarDepartamento,
  AgregarDepartamento,
  EliminarDepartamento,
  ObtenerDepartamentos,
} from "../../../servicios/ServicioDepartamento";
import { FaTrash } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import CustomModal from "../../../components/modal/CustomModal";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import { useConfirm } from "../../../context/confirmContext";

// Componente principal
function CatalogoDepartamentos() {
  const { setShowSpinner } = useSpinner();
  const [listaDepartamentos, setDepartamentos] = useState<any[]>([]);
  const [idDep, setIdDep] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [estado, setEstado] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { openConfirm } = useConfirm();
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  useEffect(() => {
    obtenerDepartamentos();
  }, []);

  const obtenerDepartamentos = async () => {
    try {
      setShowSpinner(true);
      const response = await ObtenerDepartamentos();
      setDepartamentos(response);
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };

  // Función para inhabilitar un departamento
  const eliminar = (row: any) => {
    openConfirm("Está seguro que desea inactivar?", async () => {
      try {
        setShowSpinner(true);
        const data = {
          idDepartamento: row.idDepartamento,
        };

        const response = await EliminarDepartamento(data);

        setShowAlert(true);
        setMensajeRespuesta(response);
        obtenerDepartamentos();
        setShowSpinner(false);
      } catch (error) {
        console.error("Error al eliminar departamento:", error);
      }
    });
  };

  // Función para abrir el modal y editar
  const editar = (row: any) => {
    setNombre(row.nombre);
    setEstado(row.estado);
    setIdDep(row.idDepartamento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setNombre("");
    setEstado(false);
    setIdDep("");
  };

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSpinner(true);
    if (isEditing) {
      try {
        if (nombre === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Ingrese el nombre del departamento",
          });
        } else {
          const identificacionUsuario = localStorage.getItem(
            "identificacionUsuario"
          );

          const obj = {
            idDepartamento: idDep,
            nombre: nombre,
            estado: estado,
            usuarioModificacion: identificacionUsuario,
            fechaModificacion: new Date().toISOString(),
          };

          const response = await ActualizarDepartamento(obj);

          if (response.indicador === 0) {
            handleModal();
            obtenerDepartamentos();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
      } catch (error) {
        console.error("Error al actualizar departamento:", error);
      }
    } else {
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );

        if (nombre === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Ingrese el nombre del departamento",
          });
        } else {
          const obj = {
            nombre: nombre,
            estado: estado,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: new Date().toISOString(),
          };

          const response = await AgregarDepartamento(obj);

          if (response.indicador === 0) {
            handleModal(); // Cierra el modal
            obtenerDepartamentos();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
        setShowSpinner(false);
      } catch (error) {
        console.error("Error al crear la departamento:", error);
      }
    }
  };

  // Encabezados de la tabla con acciones
  const encabezadoTabla = [
    {
      id: "nombre",
      name: "Nombre",
      selector: (row: any) => row.nombre,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "estado",
      name: "Estado",
      selector: (row: any) => (row.estado ? "Activo" : "Inactivo"),
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "acciones",
      name: "Acciones",
      cell: (row: any) => (
        <>
          <Button
            onClick={() => editar(row)}
            size="sm"
            className="bg-secondary me-1"
          >
            <VscEdit />
          </Button>
          <Button
            size="sm"
            onClick={() => eliminar(row)}
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
      <h1 className="title">Catálogo de departamentos</h1>
      <div style={{ paddingLeft: "2.6rem", paddingRight: "2.6rem" }}>
        {showAlert && (
          <AlertDismissible mensaje={mensajeRespuesta} setShow={setShowAlert} />
        )}
        <br />

        {/* Tabla */}
        <Grid
          handle={handleModal}
          buttonVisible={true}
          gridHeading={encabezadoTabla}
          gridData={listaDepartamentos}
          filterColumns={["nombre", "estado"]}
          selectableRows={false}
        ></Grid>
      </div>

      {/* Modal para agregar o editar */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? "Editar departamento" : "Agregar departamento"}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formDep"
      >
        <Form onSubmit={handleSubmit} id="formDep">
          <Row>
            <Col md={6}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre del departamento</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nombre}
                  onChange={(e: any) => setNombre(e.target.value)}
                  maxLength={50}
                  style={{
                    fontSize: "16px",
                    padding: "2%",
                    outline: "none",
                    marginTop: "1%",
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formEstado">
                <div
                  style={{
                    display: "flex",
                    alignContent: "start",
                    alignItems: "start",
                    flexDirection: "column",
                  }}
                >
                  <Form.Label style={{ marginTop: "3%" }}>
                    Departamento activo
                  </Form.Label>
                  <div className="w-100">
                    <BootstrapSwitchButton
                      checked={estado === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;"
                      onChange={(checked) => setEstado(checked)}
                    />
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </>
  );
}

export default CatalogoDepartamentos;
