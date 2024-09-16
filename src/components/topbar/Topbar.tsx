import React from "react";
import "../../css/Topbar.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { menuItem } from "../../components/menuItems/menuItems";
import { useSelector } from "react-redux";
import { AppStore } from "../../redux/Store";
import { Link } from 'react-router-dom';


const Topbar: React.FC = () => {
  const userState = useSelector((store: AppStore) => store.user);
  return (
    <Navbar style={{ backgroundColor: "#f2f2f2" }}>
      <Container fluid>
        <Navbar.Brand href="#"></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav style={{ width: "100%" }} navbarScroll>
            {menuItem.map((item, index) => {
              if (!item.roles || item.roles.includes(userState.idRol)) {
                return (
                  <Nav.Link key={index} as={Link} className="nav-link-custom" to={item.path}>
                    <div className="nav-icon-text" style={{ width: "200px" }}>
                      {item.icon}
                      {item.name}
                    </div>
                  </Nav.Link>
                );
              }
            })}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Topbar;
