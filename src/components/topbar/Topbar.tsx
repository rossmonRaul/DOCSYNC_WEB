import React, {  useState } from 'react';
import { useSelector } from 'react-redux';
import { AppStore } from '../../redux/Store';
import '../../css/Topbar.css';
import { FaRegBell } from 'react-icons/fa';
import { Logout } from '../logout';
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FaDownload, FaUpload,FaSearch } from "react-icons/fa";
import { MdDocumentScanner } from "react-icons/md";
import icono from "../../assets/icono.png";
import { AiOutlineFileSearch } from "react-icons/ai";

const Topbar: React.FC = () => {
    const [showOptions, setShowOptions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); 
    const [notifications, {/*setNotifications*/}] = useState<string[]>([]);
    const userState = useSelector((store: AppStore) => store.user);

    const handleAvatarClick = () => {
        setShowOptions(!showOptions);
    };

    // Manejador de clics para abrir o cerrar el panel de notificaciones
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };
    
    return (
        <Navbar
         style={{backgroundColor: "#f2f2f2"}}
      >
        <Container fluid>
          <Navbar.Brand href="#">
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
             style={{width:"100%"}}
              navbarScroll
            >
              <Nav.Link className="nav-link-custom" href="#action2">
                <div className="nav-icon-text" style={{width:"200px"}}>
                  <FaUpload size={30} style={{ marginRight: "5px" }} />
                  Carga de archivo
                </div>
              </Nav.Link>
              <Nav.Link className="nav-link-custom" href="#action1">
                <div className="nav-icon-text" style={{width:"200px"}}>
                  <MdDocumentScanner size={30} style={{ marginRight: "5px" }} />
                  Carga desde el scanner
                </div>
              </Nav.Link>
              <Nav.Link className="nav-link-custom" href="#action1">
                <div className="nav-icon-text"  style={{width:"200px"}}>
                  <AiOutlineFileSearch size={30} style={{ marginRight: "5px" }} />
                  Buscar archivos
                </div>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
};

export default Topbar;
