import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import userService from '../services/userService';

/**
 * User Management component for Admin to manage users
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    mobileNumber: '',
    password: '',
    role: 'STAFF',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      setError('Error fetching users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        mobileNumber: '',
        password: '',
        role: 'STAFF',
        isActive: true
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Prepare user data with optional email handling
      const userData = {
        ...formData,
        email: formData.email.trim() || null // Send null if email is empty
      };

      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        setSuccess('User updated successfully!');
      } else {
        await userService.createUser(userData);
        setSuccess('User created successfully!');
      }
      
      fetchUsers();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Error saving user');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await userService.deactivateUser(userId);
      } else {
        await userService.activateUser(userId);
      }
      fetchUsers();
    } catch (error) {
      alert(error.message || 'Error updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        alert(error.message || 'Error deleting user');
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>User Management</h1>
              <p className="text-muted">Manage admin and staff accounts</p>
            </div>
            <Button variant="primary" onClick={() => handleShowModal()}>
              Add New User
            </Button>
          </div>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Card.Body>
          {users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No users found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <strong>{user.fullName}</strong>
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.mobileNumber}</td>
                      <td>
                        <Badge 
                          bg={user.role === 'ADMIN' ? 'danger' : 'info'}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge 
                          bg={user.isActive ? 'success' : 'secondary'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <small>
                          {new Date(user.createdDate).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={user.isActive ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {user.username !== 'admin' && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={editingUser && editingUser.username === 'admin'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email (Optional)</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Password {editingUser ? '(Leave blank to keep current)' : '*'}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    minLength={6}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={editingUser && editingUser.username === 'admin'}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                label="Active User"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={editingUser && editingUser.username === 'admin'}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserManagement;
