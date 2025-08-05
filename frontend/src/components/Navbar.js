import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import authService from '../services/authService';

/**
 * Navigation bar component
 */
const NavbarComponent = ({ user, onLogout }) => {
  const isAdmin = authService.isAdmin();
  const isStaff = authService.isStaff();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="/">
          <div className="d-flex align-items-center">
            <div 
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
                color: '#0d6efd',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              TMS
            </div>
            Task Management System
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAdmin && (
              <>
                <LinkContainer to="/admin/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/complaints">
                  <Nav.Link>All Complaints</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/users">
                  <Nav.Link>User Management</Nav.Link>
                </LinkContainer>
              </>
            )}
            
            {isStaff && (
              <>
                <LinkContainer to="/staff/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/complaints">
                  <Nav.Link>My Complaints</Nav.Link>
                </LinkContainer>
              </>
            )}
            
            <LinkContainer to="/complaints/new">
              <Nav.Link>New Complaint</Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                {user.fullName}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.ItemText>
                  <div>
                    <strong>{user.fullName}</strong><br />
                    <small className="text-muted">{user.email}</small><br />
                    <small className="text-muted">Role: {user.role.replace('ROLE_', '')}</small>
                  </div>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
