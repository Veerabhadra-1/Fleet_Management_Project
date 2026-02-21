import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import "./AppNavbar.css";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/login">FleetFlow</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">FleetFlow</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/vehicles">Vehicles</Nav.Link>
            <Nav.Link as={Link} to="/trips">Trips</Nav.Link>
            <Nav.Link as={Link} to="/drivers">Drivers</Nav.Link>
            <Nav.Link as={Link} to="/maintenance">Maintenance</Nav.Link>
            <Nav.Link as={Link} to="/fuel">Fuel</Nav.Link>
            <Nav.Link as={Link} to="/analytics">Analytics</Nav.Link>
            <Nav.Link as={Link} to="/legacy">Legacy (Lorry/Truck/Van)</Nav.Link>
          </Nav>
          <Nav className="ms-auto align-items-center">
            <span className="navbar-role me-2">({user.role})</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
