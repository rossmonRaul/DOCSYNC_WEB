/**
 * Página de inicio de sesión que permite a los usuarios autenticarse en la aplicación.
 * Proporciona un formulario para ingresar credenciales de usuario y permite alternar entre el inicio de sesión y la creación de una cuenta.
 */
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input, Button, Col, FormFeedback } from "reactstrap";
import { Form, Row } from "react-bootstrap";
import "../css/LoginPage.css";
import { CambiarContrasennaTemporal, ValidarUsuario } from "../servicios/ServicioUsuario.ts";
import { useDispatch } from "react-redux";
import { UserKey, createUser, resetUser } from "../redux/state/User.ts";
import { useNavigate } from "react-router-dom";
import { clearSessionStorage } from "../utilities/SessionStorageUtility.tsx";
import { PrivateRoutes, PublicRoutes } from "../models/routes.ts";
import { IoLogIn } from "react-icons/io5";
import icono from "../assets/iconoLogin.png"
import CustomModal from "../components/modal/CustomModal.tsx";
import { AlertDismissible } from "../components/alert/alert";

/**
 * Interfaz para el estado del formulario de inicio de sesión.
 */
interface FormData {
  usuario: string;
  contrasena: string;
  mostrarCrearCuenta: boolean;
}

/**
 * Componente funcional que representa el formulario de inicio de sesión.
 */
const FormularioInicioSesion: React.FC<{
  onSubmit: (formData: FormData) => void;
  toggleForm: () => void;
  formData: FormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: (fieldName: string) => void;
  errors: Record<string, string>;
}> = ({
  onSubmit,
  formData,
  handleInputChange,
  handleInputBlur,
  errors,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };  

  return (
    <>
      <div className="form-header" style={{alignItems: 'center'}}>
        <div className="brand-content">
          <img width={150} height={100} src={icono}></img>
          <span style={{color: 'black'}}>DocSync <br /> Inicio de sesión</span>
        </div>
        <br />
        {/* <h2>Iniciar sesión</h2> */}
      </div>
      <form onSubmit={handleSubmit}>
        <FormGroup row className="input">
          <Label for="usuario" sm={2} className="input-label">
            Usuario
          </Label>
          <Col sm={12}>
            <Input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              placeholder="Identificación o correo"
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("usuario")} // Llama a handleInputBlur cuando se dispara el evento onBlur
              className={
                errors.usuario ? "input-styled input-error" : "input-styled"
              }
            />
            <FormFeedback>{errors.usuario}</FormFeedback>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="contrasena" sm={2} className="input-label">
            Contraseña
          </Label>
          <Col sm={12}>
            <Input
              type="password"
              id="contrasena"
              name="contrasena"
              placeholder="Ingresa tu contraseña"
              value={formData.contrasena}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("contrasena")} // Llama a handleInputBlur cuando se dispara el evento onBlur
              className={
                errors.contrasena ? "input-styled input-error" : "input-styled"
              }
            />
          </Col>
          <FormFeedback>{errors.contrasena}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <div>
            <Button type="submit" color="success" className="btn-styled">
            <IoLogIn  className="me-2" size={24}/>
              Iniciar sesión
            </Button>
          </div>  
        </FormGroup>
      </form>      
    </>
  );
};

/**
 * Página de inicio de sesión que permite a los usuarios autenticarse en la aplicación.
 */
const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usuario: "",
    contrasena: "",
    mostrarCrearCuenta: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contrasena1, setContrasenna1] = useState("");
  const [contrasena2, setContrasenna2] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [correo, setCorreo] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

  const handleModal = () => {
    setShowModal(!showModal);
    setContrasenna1("");
    setContrasenna2("");
  };

  useEffect(() => {          
    clearSessionStorage(UserKey);
    dispatch(resetUser());
    navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Alternar entre mostrar el formulario de inicio de sesión y el formulario de creación de cuenta.
   */
  const toggleForm = () => {
    setFormData((prevState) => ({
      ...prevState,
      mostrarCrearCuenta: !prevState.mostrarCrearCuenta,
    }));
  };

  /**
   * Manejar cambios en los campos de entrada del formulario.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Almacenar errores
  const [errors, setErrors] = useState<Record<string, string>>({
    usuario: "",
    contrasena: "",
  });

  // Manejar la validación del formulario de inicio de sesión.

  const handleSubmitConValidacion = () => {
    // Validar campos antes de enviar los datos al servidor
    const newErrors: Record<string, string> = {};

    // Validar selección de usuario
    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido";
    } else {
      newErrors.usuario = "";
    }

    // Validar selección de contraseña
    if (!formData.contrasena.trim()) {
      newErrors.contrasena = "Debe ingresar la contraseña";
    } else {
      newErrors.contrasena = "";
    }

    // Actualizar los errores
    setErrors(newErrors);

    // Si no hay errores, enviar los datos al servidor
    if (Object.values(newErrors).every((error) => error === "")) {
      handleLoginSubmit();
    }
  };

  const handleInputBlur = (fieldName: string) => {
    // Eliminar el mensaje de error para el campo cuando el usuario comienza a escribir en él
    if (errors[fieldName]) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [fieldName]: "",
      }));
    }
  };

  // Manejar el envío del formulario de inicio de sesión.
  const handleLoginSubmit = async () => {
    const formDataLogin = {
      identificacion: formData.usuario,
      correoElectronico: formData.usuario,
      contrasenna: formData.contrasena
    };

    try {
      const response = await ValidarUsuario(formDataLogin);   
      
      if(response){
        const usuario = response.usuario;

        if(usuario.mensaje === "1"){
          dispatch(createUser(usuario));
          //localstorage datos guardados
          localStorage.setItem(
            "identificacionUsuario",
            usuario.identificacion
          );
          localStorage.setItem("token", response.token);
          localStorage.setItem("idRol", response.usuario.idRol);
          localStorage.setItem("verConfidencial", response.usuario.verConfidencial);

          navigate(`/${PrivateRoutes.PRIVATE}`, { replace: true });

          setIsLoggedIn(true);
        }
        else if(usuario.mensaje === "2"){
          setShowAlert(true);
          setCorreo(response.usuario.correo);
          setIdentificacion(response.usuario.identificacion);

          setMensajeRespuesta({
            indicador: 3,
            mensaje: "La contraseña ingresada es temporal, por favor cree una"
          });

          
          localStorage.setItem("token", response.token);

          handleModal();
        }
        else if(usuario.mensaje === "3"){
          setShowAlert(true);          
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "El usuario está bloqueado, contacte a un administrador"
          });
        }
        else if(usuario.mensaje === "4"){
          setShowAlert(true);          
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "El rol del usuario está bloqueado, contacte a un administrador"
          });
        }
        else if(usuario.mensaje === "5"){
          setShowAlert(true);          
          setMensajeRespuesta({
            indicador: 1,
            mensaje: "Las credenciales son incorrectas o el usuario no existe"
          });
        }
        else{
          setShowAlert(true);          
          setMensajeRespuesta({
            indicador: 1,
            mensaje: usuario.mensaje
          });
        }
      }
      else{
        setShowAlert(true);
        setMensajeRespuesta({indicador: 1, mensaje: "Ocurrió un error al contactar con el servicio"});
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitContrasenna = async (e: React.FormEvent) => {    
    e.preventDefault();

    if(contrasena1 !== contrasena2){
      setShowAlert(true);
      setMensajeRespuesta({indicador: 1, mensaje: "Las contraseñas no coinciden"});
    }
    else{
      const data = {
        identificacion: identificacion,
        correoElectronico: correo,
        contrasennaTemporal: contrasena1
      }

      const response = await CambiarContrasennaTemporal(data);

      setShowAlert(true);
      setMensajeRespuesta(response);

      if(response.indicador == "0")
      {        
        localStorage.setItem("token", '');
        handleModal();
      }
    }
  }

  return (    
    <div className={`container ${isLoggedIn ? "" : "login-bg"}`}>
      {showAlert && (
        <AlertDismissible
        mensaje={mensajeRespuesta}
        setShow={setShowAlert}
        />
      )}
      <div className="container-lg">
        <div className="form-container">          
          <FormularioInicioSesion
            onSubmit={handleSubmitConValidacion}
            toggleForm={toggleForm}
            formData={formData}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            errors={errors}
          />
          <CustomModal
          show={showModal}
          onHide={handleModal}
          title={"Crea tu contraseña"}
          showSubmitButton={true}
          submitButtonLabel={"Guardar"}
          formId="formContrasenna"
          >
            <Form id="formContrasenna" onSubmit={handleSubmitContrasenna}>
              <Row>
                <Col md={12}>
                  <Form.Group controlId="formContrasenna1">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="contrasenna"
                      value={contrasena1}
                      onChange={(e: any) => setContrasenna1(e.target.value)}
                      required
                      maxLength={50}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group controlId="formContrasenna2">
                      <Form.Label style={{marginTop: '2%'}}>Confirmar contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="contrasenna2"
                        value={contrasena2}
                        onChange={(e: any) =>  setContrasenna2(e.target.value)}
                        maxLength={15}
                      />
                    </Form.Group>
                  </Col>
                </Row>
            </Form>
          </CustomModal>
        </div>
      </div>
    </div>    
  );
};

export default Login;
