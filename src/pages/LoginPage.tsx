/**
 * Página de inicio de sesión que permite a los usuarios autenticarse en la aplicación.
 */
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input, Button, Col, FormFeedback } from "reactstrap";
import { Form, Row } from "react-bootstrap";
import "../css/LoginPage.css";
import { CambiarContrasennaTemporal, RecuperarContrasenna, ValidarUsuario } from "../servicios/ServicioUsuario.ts";
import { useDispatch } from "react-redux";
import { UserKey, createUser, resetUser } from "../redux/state/User.ts";
import { useNavigate } from "react-router-dom";
import { clearSessionStorage } from "../utilities/SessionStorageUtility.tsx";
import { PrivateRoutes, PublicRoutes } from "../models/routes.ts";
import { IoLogIn } from "react-icons/io5";
import icono from "../assets/iconoLogin.png"
import CustomModal from "../components/modal/CustomModal.tsx";
import { AlertDismissible } from "../components/alert/alert";
import { useSpinner } from "../context/spinnerContext";
import { LimpiarTrabajos, ValidarTrabajosProceso } from "../servicios/ServicioTrabajos.ts";
import { useAccept } from "../context/acceptContext";

/**
 * Interfaz para el estado del formulario de inicio de sesión.
 */
interface FormData {
  usuario: any;
  contrasena: any;
}

/**
 * Componente funcional que representa el formulario de inicio de sesión.
 */
const FormularioInicioSesion: React.FC<{
  onSubmit: (formData: FormData) => void;
  formData: FormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: (fieldName: string) => void;
  errors: Record<string, string>;
}> = ({
  onSubmit,
  formData,
  handleInputChange,
  handleInputBlur,
  errors
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };  
  
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState("");  
  const { setShowSpinner } = useSpinner();
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});

  const handleModalRecupera = () => {
    setShowModal(!showModal);
    setUser("");
  };

  const handleRecuperaContrasenna = () => {
    handleModalRecupera();
  }

  const handleSubmitRecuperaContrasenna = async (e: any) => {
    e.preventDefault();
    
    setShowSpinner(true);

    const response = await RecuperarContrasenna({
      identificacion: user
    }); 

    if(response){
      setShowAlert(true);
      setMensajeRespuesta(response);

      handleModalRecupera();
    }
    else{
      setShowAlert(true);
      setMensajeRespuesta({indicador: 1, mensaje: "Ocurrió un error al contactar con el servicio"});
    }
    setShowSpinner(false);
  }

  return (
    <>
      {showAlert && (
          <AlertDismissible
          mensaje={mensajeRespuesta}
          setShow={setShowAlert}
          />
        )}
      <div className="form-header" style={{alignItems: 'center'}}>      
        <div className="brand-content">
          <img width={150} height={100} src={icono}></img>
          <span style={{color: 'black'}}>DocSync <br /> Inicio de sesión</span>
        </div>
        <br />
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
      
      <FormGroup>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            color: "#9e0000"
          }}
          onClick={handleRecuperaContrasenna}>
              Olvidé mi contraseña
          </div>
        </FormGroup>  

         {/* Modal para recuperar contraseña */}
         <CustomModal
          show={showModal}
          onHide={handleModalRecupera}
          title={"Recuperar contraseña"}
          showSubmitButton={true}
          isPassReset={true}
          submitButtonLabel={"Recuperar"}
          formId="formRecuperaPass"          
          >
            <Form id="formRecuperaPass" onSubmit={handleSubmitRecuperaContrasenna}>
              <Row>
                <Col md={12}>
                  <Form.Group controlId="formContrasenna">
                    <Form.Label>Identificación o correo</Form.Label>
                    <Form.Control
                      type="text"
                      name="usuario"
                      value={user}
                      placeholder="Identificación o correo"
                      onChange={(e: any) => setUser(e.target.value)}
                      required
                      maxLength={50}
                    />
                  </Form.Group>
                </Col>
                </Row>
            </Form>
          </CustomModal>
    </>
  );
};

/**
 * Página de inicio de sesión que permite a los usuarios autenticarse en la aplicación.
 */
const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usuario: "",
    contrasena: ""
  });
  
  const { setShowSpinner } = useSpinner();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contrasena1, setContrasenna1] = useState("");
  const [contrasena2, setContrasenna2] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [correo, setCorreo] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [mensajeRespuesta, setMensajeRespuesta] = useState({indicador:0, mensaje:""});
  const { openAccept } = useAccept();

  const handleModal = () => {
    setShowModal(!showModal);
    setContrasenna1("");
    setContrasenna2("");
    setFormData({usuario: "", contrasena: ""});
  };

  useEffect(() => {          
    clearSessionStorage(UserKey);
    dispatch(resetUser());
    navigate(`/${PublicRoutes.LOGIN}`, { replace: true });

    if(localStorage.getItem("token") === ""){
      setShowAlert(true);
      setMensajeRespuesta({
        indicador: 2,
        mensaje: "Su sesión expiró, por favor ingrese nuevamente"
      });
    }
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    if(formData.usuario.trim() === '' || formData.contrasena.trim() === ''){
      setShowAlert(true);
      setMensajeRespuesta({indicador: 1, mensaje: "Debe ingresar sus credenciales para iniciar sesión"});
    }
    else
      handleLoginSubmit();
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
      setShowSpinner(true);
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

          const responseTrabajos = await ValidarTrabajosProceso({identificacion: usuario.identificacion});

          if(responseTrabajos.hayTrabajos){            
            openAccept("Se detectaron fallos de red en su última carga de documentos. Se han cargado "
              +responseTrabajos.docsBien+" documentos correctamente, "
              +responseTrabajos.docsMal+" fallaron de un total de "
              +responseTrabajos.totalDocs+" documentos.", async () => {      
                
                const responseLimpieza = await LimpiarTrabajos({identificacion: usuario.identificacion});

                if(responseLimpieza.indicador === '0'){
                  setShowAlert(true);
                  setMensajeRespuesta({
                    indicador: 3,
                    mensaje: responseLimpieza.mensaje
                  });
                }                
            });
          }

          navigate(`/${PrivateRoutes.BUSCARDOCUMENTOS}`, { replace: true });

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

      setShowSpinner(false);
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
      setShowSpinner(true);
      
      const response = await CambiarContrasennaTemporal(data);      

      setShowAlert(true);
      setMensajeRespuesta(response);

      if(response){
        if(response.indicador == "0")
        {        
          localStorage.setItem("token", '');
          handleModal();
        }
      }
      else{
        setShowAlert(true);
        setMensajeRespuesta({indicador: 1, mensaje: "Ocurrió un error al contactar con el servicio"});
      }

      setShowSpinner(false);
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
            formData={formData}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            errors={errors}
          />
          {/* Modal para cambiar contraseña */}
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
