import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/Store";
import { Logout } from "../logout";
import {
  FaBook,
  FaHistory,
  FaSignature,
  FaUser,
  FaFlag,
  FaFileAlt,
  FaSitemap,
  FaUsers,
  FaUserCog,
  FaUpload,
  FaBuilding,
  FaUserTie,
  FaSearch,
} from "react-icons/fa";
import { IconType } from "react-icons/lib";
import "../../css/TopBar.css";
import icono from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { ObtenerAccesoMenuPorRol } from "../../servicios/ServicioUsuario";
import { AiOutlineFileSearch } from "react-icons/ai";
import { jwtDecode } from "jwt-decode";
import Notification from "../notification/notification";
import { PiNotebookBold  } from "react-icons/pi";

// Interfaz para que reciba el nombre que se desea para la pantalla
interface MenuItem {
  path: string;
  name: string;
  icon?: IconType;
  idRol?: number;
  children?: MenuItem[]; // Para elementos colapsables
}

// Componente principal
const NavbarMenu: React.FC = () => {
  const navigate = useNavigate(); // Hook de react-router-dom para la navegación

  // Renderizado
  const [showOptions, setShowOptions] = useState(false);
  const [validarAcceso, setValidarAcceso] = useState<boolean>(true);
  const [menuCompleto, setMenuCompleto] = useState([]);
  const [subMenuCatalogos, setSubMenuCatalogos] = useState([]);
  const [subMenuOtros, setSubMenuOtros] = useState([]);
  const [mostrarCatalogos, setMostrarCatalogos] = useState<boolean>(false);
  const [mostrarEncabezado, setMostrarEncabezado] = useState<boolean>(false);
  const [menuItem, setMenuItems] = useState([]);
  const userState = useSelector((store: AppStore) => store.user);

  

  const handleAvatarClick = () => {
    setShowOptions(!showOptions);
  };



  // Aquí se deben agregar los nuevos iconos para las opciones de menú
  const iconMap: { [key: string]: IconType } = {
    FaHistory: FaHistory,
    FaSignature: FaSignature,
    FaUser: FaUser,
    FaFlag: FaFlag,
    FaFileAlt: FaFileAlt,
    FaSitemap: FaSitemap,
    FaUsers: FaUsers,
    FaUserCog: FaUserCog,
    FaBook: FaBook,
    FaUpload: FaUpload,
    AiOutlineFileSearch: AiOutlineFileSearch,
    FaBuilding: FaBuilding,
    FaUserTie: FaUserTie,
    FaSearch: FaSearch,
    PiNotebookBold: PiNotebookBold
  };

  const obtenerOpcionesMenu = async () => {
    const data = {
      idRol: localStorage.getItem("idRol"),
    };

    const menu = await ObtenerAccesoMenuPorRol(data);

    // Se mapean todos los iconos
    menu.forEach((element: any) => {
      element.icon = iconMap[element.icon];
      element.iconCategoria = iconMap[element.iconCategoria];
    });

    setMenuCompleto(menu);

    // Llenar opciones para catálogos
    const menuCat = menu.filter((x: any) => x.idCategoria === 1); // Esta manera se va a cambiar

    setSubMenuCatalogos(menuCat);

    setMostrarCatalogos(menuCat.length > 0);

    //Llenar opciones que no tienen submenú
    const menuOtros = menu.filter(
      (x: any) => x.name === x.nombreCategoria && !x.esOpcionEncabezado
    );

    setSubMenuOtros(menuOtros);

    //Opciones de encabezado
    const menuEnc = menu.filter((x: any) => x.esOpcionEncabezado);

    setMenuItems(menuEnc);

    setMostrarEncabezado(menuEnc.length > 0);
  };

  const tokenExpirado = () => {
    const token = localStorage.getItem("token");

    if (!token) return true;

    const decoded = jwtDecode(token);
    const exp = decoded.exp;

    if (!exp) return true;

    // Compara la fecha de expiración con la fecha actual
    return exp * 1000 < Date.now();
  };

  useEffect(() => {
    // Validar que el token no haya expirado
    if (tokenExpirado()) {
      localStorage.setItem("token", ""); // Se borra el token de sesión
      navigate("/login");
    }

    const hayMenu = menuCompleto.length > 0;

    // Validar si rol tiene acceso a la vista
    if (validarAcceso && hayMenu) {
      if (
        menuCompleto.filter((x: any) => x.path === location.pathname).length < 1
      )
        navigate("/private/dashboard");
      setValidarAcceso(false); // Para que solo se valide una vez que se ingresa a nueva vista
    }

    if (!hayMenu) obtenerOpcionesMenu(); // Para que solo haga llamado al API una vez
  });

  return (
    <>
      <Navbar style={{ backgroundColor: "#9E0000" }} expand="lg">
        <Container fluid>
          <Navbar.Brand href="#">
            <div className="brand-content">
              <img width={50} height={50} src={icono}></img>
              <span>DOCSYNC</span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            ></Nav>
            <Form style={{ color: "#fff" }} className="d-flex">
              {mostrarEncabezado && (
                <Nav style={{ width: "100%" }} navbarScroll>
                  {menuItem.map((item: MenuItem, index) => {
                    if (!item.idRol || item.idRol === userState.idRol) {
                      return (
                        <Nav.Link
                          key={index}
                          as={Link}
                          className="nav-link-custom"
                          to={item.path}
                        >
                          <div
                            className="nav-icon-text"
                            style={{ width: "200px" }}
                          >
                            {item.icon && (
                              <item.icon
                                size={30}
                                style={{ marginRight: "5px" }}
                              />
                            )}
                            {item.name}
                          </div>
                        </Nav.Link>
                      );
                    }
                  })}
                </Nav>
              )}

              <NavDropdown
                style={{ margin: 10, marginRight: 30, marginTop: 15 }}
                title={
                  <>
                    <FaBook style={{ margin: "8%" }} />
                    Más opciones
                  </>
                }
                id="navbarScrollingDropdown"
              >
                {subMenuOtros.map((item: MenuItem, index) => {
                  if (!item.idRol || item.idRol === userState.idRol) {
                    return (
                      <NavDropdown.Item key={index * 10}>
                        <Nav.Link as={Link} to={item.path}>
                          {item.icon && <item.icon />} {item.name}
                        </Nav.Link>
                      </NavDropdown.Item>
                    );
                  }
                })}
                {mostrarCatalogos && <NavDropdown.Divider />}
                {mostrarCatalogos && (
                  <NavDropdown
                    style={{ margin: 10, marginLeft: 15 }}
                    title={
                      <>
                        <FaBook style={{ marginRight: 5 }} />
                        Catálogos
                      </>
                    }
                  >
                    {subMenuCatalogos.map((item: MenuItem, index) => {
                      if (!item.idRol || item.idRol === userState.idRol) {
                        return (
                          <NavDropdown.Item key={index * 5}>
                            <Nav.Link as={Link} to={item.path}>
                              {item.icon && (
                                <item.icon style={{ marginRight: "5%" }} />
                              )}
                              {item.name}
                            </Nav.Link>
                          </NavDropdown.Item>
                        );
                      }
                    })}
                  </NavDropdown>
                )}
              </NavDropdown>
              <Notification />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <div className="user-name">{userState.nombre}</div>
                <div className="user-avatar" onClick={handleAvatarClick}>
                  {showOptions && (
                    <div className="avatar-options">
                      <Logout />
                    </div>
                  )}
                </div>
              </div>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarMenu;
