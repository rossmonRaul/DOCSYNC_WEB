import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FaDownload, FaUpload } from "react-icons/fa";
import { MdDocumentScanner } from "react-icons/md";
import { ArrowRepeat } from "react-bootstrap-icons";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/Store";
import { Logout } from "../logout";
import { FaRegBell, FaSearch } from "react-icons/fa";
import "../../css/TopBar.css";
import icono from "../../assets/logo.png";
// Interfaz para que reciba el nombre que se desea para la pantalla
interface BorderProps {
  text: string;
}

// Componente principal
const BordeSuperior: React.FC<BorderProps> = ({ text }) => {
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
              <div className="notifications">
                <FaRegBell
                  size={35}
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
                <NavDropdown.Item href="#action3">Catálogos</NavDropdown.Item>
                <NavDropdown.Item href="#action4">
                  Historial
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action5">
                  Firma Digital
                </NavDropdown.Item>
              </NavDropdown>
              <div className="user-name">{userState.nombre}</div>
              <div className="user-avatar" onClick={handleAvatarClick}>
                {showOptions && (
                  <div className="avatar-options">
                    <Logout />
                  </div>
                )}
              </div>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default BordeSuperior;
