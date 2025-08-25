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
              📋
            </div>
            <span className="d-none d-md-inline">Task Management System</span>
            <span className="d-inline d-md-none">TMS</span>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAdmin && (
              <>
                <LinkContainer to="/admin/dashboard">
                  <Nav.Link>📊 <span className="d-none d-lg-inline">Dashboard</span></Nav.Link>
                </LinkContainer>
                <LinkContainer to="/complaints">
                  <Nav.Link>📋 <span className="d-none d-lg-inline">All Complaints</span></Nav.Link>
                </LinkContainer>
                <LinkContainer to="/users">
                  <Nav.Link>👥 <span className="d-none d-lg-inline">User Management</span></Nav.Link>
                </LinkContainer>
              </>
            )}
            
            {isStaff && (
              <>
                <LinkContainer to="/staff/dashboard">
                  <Nav.Link>📊 <span className="d-none d-lg-inline">Dashboard</span></Nav.Link>
                </LinkContainer>
                <LinkContainer to="/complaints">
                  <Nav.Link>📋 <span className="d-none d-lg-inline">My Complaints</span></Nav.Link>
                </LinkContainer>
              </>
            )}
            
            <LinkContainer to="/complaint">
              <Nav.Link>➕ <span className="d-none d-lg-inline">New Complaint</span></Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic" className="d-flex align-items-center">
                <span className="me-2">👤</span>
                <span className="d-none d-sm-inline">{user.fullName}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.ItemText>
                  <div>
                    <strong>👤 {user.fullName}</strong><br />
                    <small className="text-muted">📧 {user.email}</small><br />
                    <small className="text-muted">🏷️ Role: {user.role.replace('ROLE_', '')}</small>
                  </div>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>
                  🚪 Logout
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
