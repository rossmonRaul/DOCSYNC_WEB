import React, { useState, useEffect } from "react";
import "../../../css/general.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Grid } from "../../../components/table/tabla";
import {
  ObtenerUsuarios,
  ObtenerRoles,
  AgregarUsuario,
  EliminarUsuario,
  ActualizarUsuario,
  ObtenerAcciones,
  ObtenerAccionesUsuario,
} from "../../../servicios/ServicioUsuario";
import { ObtenerPersonas } from "../../../servicios/ServicioPersonas";
import { FaBan, FaRedo, FaTrash } from "react-icons/fa";
import { VscEdit } from "react-icons/vsc";
import { AlertDismissible } from "../../../components/alert/alert";
import CustomModal from "../../../components/modal/CustomModal";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { useSpinner } from "../../../context/spinnerContext";
import Select from "react-select";
import { useConfirm } from "../../../context/confirmContext";
import { RiAddLine } from "react-icons/ri";

// Componente principal
function CatalogoUsuarios() {
  const { setShowSpinner } = useSpinner();
  const [listaUsuarios, setUsuarios] = useState<any[]>([]);
  const [correoE, setCorreoE] = useState<string>("");
  const [rol, setRol] = useState<string>("");
  const [rolTexto, setRolTexto] = useState<string>("");
  const [accion, setAccion] = useState<string>("");
  const [accionesUsuario, setAccionesUsuario] = useState<any[]>([]);
  const [accionTexto, setAccionTexto] = useState<string>("");
  const [nombrePersona, setNombrePersona] = useState<string>("");
  const [idUsuario, setIdUsuario] = useState<string>("");
  const { openConfirm } = useConfirm();
  const [identificacion, setIdentificacion] = useState<string>("");
  const [contrasennaT, setContrasennaT] = useState<string>("");
  const [persona, setPersona] = useState<string>("");
  const [personas, setPersonas] = useState<any>([]);
  const [roles, setRoles] = useState<any>([]);
  const [acciones, setAcciones] = useState<any>([]);
  const [estado, setEstado] = useState<boolean>(false);
  const [verConfidencial, setVerConfidencial] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({
    indicador: 0,
    mensaje: "",
  });

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setShowSpinner(true);
    await obtenerPersonas();
    await obtenerRoles();
    await obtenerAcciones();
    await obtenerUsuarios();
    setShowSpinner(false);
  };

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
      setPersonas(response.filter((x: any) => x.estado === true));
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
  };

  const obtenerAcciones = async () => {
    try {
      const response = await ObtenerAcciones();
      setAcciones(response);
    } catch (error) {
      console.error("Error al obtener acciones:", error);
    }
  };

  // Función para inhabilitar un usuario
  const eliminar = async (usuario: any) => {
    openConfirm(
      "¿Está seguro que desea cambiar el estado del usuario?",
      async () => {
        try {
          const identificacionUsuario = localStorage.getItem(
            "identificacionUsuario"
          );

          setShowSpinner(true);
          const data = {
            idUsuario: usuario.idUsuario,
            fechaModificacion: new Date().toISOString(),
            usuarioModificacion: identificacionUsuario,
          };

          const response = await EliminarUsuario(data);

          setShowAlert(true);
          setMensajeRespuesta(response);
          obtenerUsuarios();
          setShowSpinner(false);
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
        }
      }
    );
  };

  const cargarAccionesUsuario = async (identificacion: any) => {
    try {
      setShowSpinner(true);
      const response = await ObtenerAccionesUsuario({ identificacion });
      setAccionesUsuario(response);
      setShowSpinner(false);
    } catch (error) {
      console.error("Error al obtener personas:", error);
    }
  };

  // Función para abrir el modal y editar
  const editarUsuario = async (usuario: any) => {
    setCorreoE(usuario.correoElectronico);
    setEstado(usuario.estado);
    setRol(usuario.idRol);
    setIdentificacion(usuario.identificacion);
    setPersona(usuario.idPersona);
    setIsEditing(true);
    setShowModal(true);
    setIdUsuario(usuario.idUsuario);
    setVerConfidencial(usuario.verConfidencial);
    setNombrePersona(usuario.nombreCompleto);
    setRolTexto(usuario.rol);
    await cargarAccionesUsuario(usuario.identificacion);
  };

  // Función para manejar el cierre del modal
  const handleModal = () => {
    setShowModal(!showModal);
    setIsEditing(false);
    setCorreoE("");
    setEstado(false);
    setVerConfidencial(false);
    setRol("");
    setIdentificacion("");
    setPersona("");
    setNombrePersona("");
    setRolTexto("");
    setAccionesUsuario([]);
  };

  // Maneja los cambios en el formulario del modal
  const handlePersonaChange = (e: any) => {
    if (e.value !== "") {
      const idPersona = e.value;

      const correoE = personas.filter((x: any) => x.idPersona == idPersona)[0]
        .email;
      const identificacion = personas.filter(
        (x: any) => x.idPersona == idPersona
      )[0].identificacion;
      const nombre = personas.filter((x: any) => x.idPersona == idPersona)[0]
        .nombreCompleto;

      setCorreoE(correoE);
      setIdentificacion(identificacion);
      setPersona(idPersona);
      setNombrePersona(nombre);
    } else {
      setCorreoE("");
      setIdentificacion("");
      setPersona("");
      setNombrePersona("");
    }
  };

  const handleRolChange = (e: any) => {
    if (e.value !== "") {
      const nombre = roles.filter((x: any) => x.idRol == e.value)[0].rol;

      setRol(e.value);
      setRolTexto(nombre);
    } else {
      setRol("");
      setRolTexto("");
    }
  };

  const handleAccionChange = (e: any) => {
    if (e.value !== "") {
      const nombre = acciones.filter((x: any) => x.idAccion == e.value)[0]
        .descripcion;

      setAccion(e.value);
      setAccionTexto(nombre);
    } else {
      setAccion("");
      setAccionTexto("");
    }
  };

  const handlePassChange = (e: any) => {
    setContrasennaT(e.target.value);
  };

  // Maneja el envío del formulario para agregar o editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setShowSpinner(true);
    if (isEditing) {
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );

        if (persona === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Seleccione una persona",
          });
        } else if (rol === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Seleccione el rol del usuario",
          });
        } else {
          let accionesBD = "";

          accionesUsuario.forEach((op) => {
            accionesBD += op.idAccion + ",";
          });
          const usuario = {
            idPersona: persona,
            idRol: rol,
            correoElectronico: correoE,
            contrasennaTemporal: contrasennaT.length > 0 ? contrasennaT : null,
            estado: estado,
            idUsuario: idUsuario,
            usuarioModificacion: identificacionUsuario,
            fechaModificacion: new Date().toISOString(),
            contrasenna: null,
            acciones: accionesBD,
            verConfidencial: verConfidencial,
          };

          const response = await ActualizarUsuario(usuario);

          if (response.indicador === 0) {
            handleModal();
            obtenerUsuarios();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
      }
    } else {
      try {
        const identificacionUsuario = localStorage.getItem(
          "identificacionUsuario"
        );

        if (persona === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Seleccione una persona",
          });
        } else if (rol === "") {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Seleccione el rol del usuario",
          });
        } else if (contrasennaT.length < 1) {
          setShowAlert(true);
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Debe ingresar una contraseña para el usuario",
          });
        } else {
          let accionesBD = "";

          accionesUsuario.forEach((op) => {
            accionesBD += op.idAccion + ",";
          });

          const nuevoUsuario = {
            idPersona: persona,
            idRol: rol,
            correoElectronico: correoE,
            contrasennaTemporal: contrasennaT,
            estado: estado,
            idUsuario: 0,
            usuarioCreacion: identificacionUsuario,
            fechaCreacion: new Date().toISOString(),
            contrasenna: "",
            acciones: accionesBD,
            verConfidencial: verConfidencial,
          };

          const response = await AgregarUsuario(nuevoUsuario);

          if (response.indicador === 0) {
            handleModal(); // Cierra el modal
            obtenerUsuarios();
          }

          setShowAlert(true);
          setMensajeRespuesta(response);
        }
      } catch (error) {
        console.error("Error al crear la usuario:", error);
      }
    }

    setShowSpinner(false);
  };

  // Encabezados de la tabla con acciones
  const encabezadoTabla = [
    {
      id: "identificacion",
      name: "Identificación",
      selector: (row: any) => row.identificacion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "nombreCompleto",
      name: "Nombre",
      selector: (row: any) => row.nombreCompleto,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "rol",
      name: "Rol",
      selector: (row: any) => row.rol,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "puesto",
      name: "Puesto",
      selector: (row: any) => row.puesto,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "verConfidencial",
      name: "Confidencial",
      sortable: true,
      cell: (row: any) => (
        <div
          style={{
            fontSize: "1.2em",
            color: row.verConfidencial ? "green" : "red",
          }}
        >
          {row.verConfidencial ? "Sí" : "No"}
        </div>
      ),
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
            onClick={() => editarUsuario(row)}
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
            {row.estado ? <FaBan /> : <FaRedo />}
          </Button>
        </>
      ),
      width: "120px",
    },
  ];

  const agregaAccion = () => {
    if (accion) {
      const accionSelected = acciones.filter(
        (x: any) => x.idAccion === parseInt(accion)
      )[0];

      if (accionesUsuario.find((x: any) => x.idAccion == parseInt(accion))) {
        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 1,
          mensaje: "El usuario ya cuenta con este permiso",
        });
      } else {
        const data = {
          idAccion: accionSelected.idAccion,
          descripcion: accionSelected.descripcion,
        };

        setAccionesUsuario((prevOpcionesRol: any[]) => [
          ...prevOpcionesRol,
          data,
        ]);

        setShowAlert(true);
        setMensajeRespuesta({
          indicador: 0,
          mensaje: "Permiso agregado para el usuario",
        });
      }
    }
  };

  const eliminarAccion = (opcion: any) => {
    openConfirm("¿Está seguro que desea eliminar la acción?", () => {
      setAccionesUsuario((prev: any[]) =>
        prev.filter((op: any) => op.idAccion !== opcion.idAccion)
      );

      setShowAlert(true);
      setMensajeRespuesta({ indicador: 0, mensaje: "Opción eliminada" });
    });
  };

  const encabezadoTablaModal = [
    {
      id: "accion",
      name: "Permiso",
      selector: (row: any) => row.descripcion,
      sortable: true,
      style: {
        fontSize: "1.2em",
      },
    },
    {
      id: "acciones",
      name: "Acción",
      cell: (row: any) => (
        <>
          <Button
            size="sm"
            onClick={() => eliminarAccion(row)}
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
      <h1 className="title">Catálogo de usuarios</h1>
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
          gridData={listaUsuarios}
          filterColumns={[
            "identificacion",
            "nombreCompleto",
            "rol",
            "puesto",
            "correoElectronico",
          ]}
          selectableRows={false}
        ></Grid>
      </div>

      {/* Modal para agregar o editar */}
      <CustomModal
        show={showModal}
        onHide={handleModal}
        title={isEditing ? "Editar usuario" : "Agregar usuario"}
        showSubmitButton={true}
        submitButtonLabel={isEditing ? "Actualizar" : "Guardar"}
        formId="formUsuario"
      >
        <Form onSubmit={handleSubmit} id="formUsuario">
          <Row>
            <Col md={6}>
              <Form.Group controlId="formPersona">
                <Form.Label>Persona*</Form.Label>
                <Select
                  value={
                    persona !== ""
                      ? {
                          value: persona,
                          label: nombrePersona,
                        }
                      : null
                  }
                  onChange={(e: any) => handlePersonaChange(e)}
                  className="GrupoFiltro"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "2%",
                      outline: "none",
                      marginTop: "1%",
                    }),
                  }}
                  placeholder="Seleccione"
                  options={personas.map((cat: any) => ({
                    value: cat.idPersona,
                    label: cat.nombreCompleto,
                  }))}
                  noOptionsMessage={() => "Opción no encontrada"}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formRol">
                <Form.Label>Rol de acceso*</Form.Label>
                <Select
                  value={
                    rol !== ""
                      ? {
                          value: rol,
                          label: rolTexto ?? "",
                        }
                      : null
                  }
                  onChange={(e: any) => handleRolChange(e)}
                  className="GrupoFiltro"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "2%",
                      outline: "none",
                      marginTop: "1%",
                    }),
                  }}
                  placeholder="Seleccione"
                  options={roles.map((cat: any) => ({
                    value: cat.idRol,
                    label: cat.rol,
                  }))}
                  noOptionsMessage={() => "Opción no encontrada"}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formIdentificacion">
                <Form.Label style={{ marginTop: "3%" }}>
                  Identificación
                </Form.Label>
                <Form.Control
                  type="text"
                  name="identificacion"
                  value={identificacion || ""}
                  maxLength={50}
                  readOnly
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
              <Form.Group controlId="formCorreoE">
                <Form.Label style={{ marginTop: "3%" }}>
                  Correo electrónico
                </Form.Label>
                <Form.Control
                  type="text"
                  name="correoElectronico"
                  value={correoE || ""}
                  maxLength={50}
                  readOnly
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
              <Form.Group controlId="formContrasennaT">
                <Form.Label style={{ marginTop: "3%" }}>
                  Contraseña temporal*
                </Form.Label>
                <Form.Control
                  type="text"
                  name="contrasennaT"
                  onChange={handlePassChange}
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
            <Col md={3}>
              <Form.Group controlId="formEstado">
                <div
                  style={{
                    display: "flex",
                    alignContent: "start",
                    alignItems: "start",
                    flexDirection: "column",
                    padding: "2%",
                    marginTop: "4%",
                  }}
                >
                  <Form.Label style={{ marginTop: "3%" }}>
                    Usuario activo
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

            <Col md={3}>
              <Form.Group controlId="formEstado">
                <div
                  style={{
                    display: "flex",
                    alignContent: "start",
                    alignItems: "start",
                    flexDirection: "column",
                    padding: "2%",
                    marginTop: "4%",
                  }}
                >
                  <Form.Label style={{ marginTop: "3%" }}>
                    Accesos confidenciales
                  </Form.Label>
                  <div className="w-100">
                    <BootstrapSwitchButton
                      checked={verConfidencial === true}
                      onlabel="Sí"
                      onstyle="success"
                      offlabel="No"
                      offstyle="danger"
                      style="w-100 mx-3;"
                      onChange={(checked) => setVerConfidencial(checked)}
                    />
                  </div>
                </div>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="formAccion">
                <Form.Label style={{ marginTop: "3%" }}>
                  Permisos de acciones
                </Form.Label>
                <Select
                  value={
                    accion !== ""
                      ? {
                          value: accion,
                          label: accionTexto ?? "",
                        }
                      : null
                  }
                  onChange={(e: any) => handleAccionChange(e)}
                  className="GrupoFiltro"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "2%",
                      outline: "none",
                      marginTop: "1%",
                    }),
                  }}
                  placeholder="Seleccione"
                  options={acciones.map((cat: any) => ({
                    value: cat.idAccion,
                    label: cat.descripcion,
                  }))}
                  noOptionsMessage={() => "Opción no encontrada"}
                />
              </Form.Group>
            </Col>
            <Col
              md={3}
              style={{
                marginTop: "2.6%",
                paddingRight: "0px",
                marginRight: "0px",
              }}
            >
              <Button
                type="button"
                className="mt-3 mb-0 btn-save"
                style={{
                  height: "47px",
                }}
                onClick={() => agregaAccion()}
              >
                <RiAddLine className="me-2" size={24} />
                Agregar permiso
              </Button>
            </Col>
            <Col md={12}>
              <Grid
                gridHeading={encabezadoTablaModal}
                gridData={accionesUsuario}
                selectableRows={false}
              ></Grid>
            </Col>
          </Row>
        </Form>
      </CustomModal>
    </>
  );
}

export default CatalogoUsuarios;
