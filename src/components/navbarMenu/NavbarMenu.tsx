import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/Store";
import { Logout } from "../logout";
import { FaRegBell } from "react-icons/fa";
import "../../css/TopBar.css";
import icono from "../../assets/logo.png";
import { menuItem } from "../menuItems/menuItems";
import { Link } from "react-router-dom";
import { subMenuCatalogos, subMenuOtros } from "../menuItems/subMenuItems";
// Interfaz para que reciba el nombre que se desea para la pantalla

// Componente principal
const NavbarMenu: React.FC = () => {
  // Renderizado
  const [showOptions, setShowOptions] = useState(false);
  const userState = useSelector((store: AppStore) => store.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [
    notifications,
    {
      /*setNotifications*/
    },
  ] = useState<string[]>([]);

  const handleAvatarClick = () => {
    setShowOptions(!showOptions);
  };

  // Manejador de clics para abrir o cerrar el panel de notificaciones
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  return (
    <>
      <Navbar
        style={{ backgroundColor: "#9E0000" }}
        data-bs-theme="dark"
        expand="lg"
      >
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
              <Nav style={{ width: "100%" }} navbarScroll>
                {menuItem.map((item, index) => {
                  if (!item.roles || item.roles.includes(userState.idRol)) {
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
                          {item.icon}
                          {item.name}
                        </div>
                      </Nav.Link>
                    );
                  }
                })}
              </Nav>
              <div className="notifications">
                <FaRegBell
                  size={30}
                  style={{ margin: 10 }}
                  onClick={toggleNotifications}
                />{" "}
                {/* Icono de notificaciones */}
                {/* Mostrar las notificaciones si showNotifications es true */}
                {showNotifications && notifications.length >= 0 && (
                  <div className="notification-list">
                    <h3>Notificaciones:</h3>
                    <ul>
                      {notifications.map((notification, index) => (
                        <li key={index}>{notification}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <NavDropdown
                style={{ margin: 10, marginRight: 30, marginTop: 15 }}
                title="Más opciones"
                id="navbarScrollingDropdown"
              >
                <NavDropdown
                  style={{ margin: 10, marginLeft: 15 }}
                  title="Catálogos"
                >
                    {subMenuCatalogos.map((item, index) => {
                      if (!item.roles || item.roles.includes(userState.idRol)) {
                        return (
                          <NavDropdown.Item key={index * 5}>
                            <Nav.Link as={Link} to={item.path}>
                              {item.name}
                            </Nav.Link>
                          </NavDropdown.Item>
                        );
                      }
                    })}
                </NavDropdown>

                <NavDropdown.Divider />
                {subMenuOtros.map((item, index) => {
                  if (!item.roles || item.roles.includes(userState.idRol)) {
                    return (
                      <NavDropdown.Item key={index * 10}>
                        <Nav.Link as={Link} to={item.path}>
                          {item.name}
                        </Nav.Link>
                      </NavDropdown.Item>
                    );
                  }
                })}
              </NavDropdown>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
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
