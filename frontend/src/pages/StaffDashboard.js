import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import complaintService from '../services/complaintService';

/**
 * Staff Dashboard component
 */
const StaffDashboard = () => {
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      // Fetch assigned complaints for the current staff member
      const complaints = await complaintService.getMyAssignedComplaints();
      setAssignedComplaints(complaints);

      // Calculate stats
      const assigned = complaints.filter(c => c.status === 'ASSIGNED').length;
      const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
      const completed = complaints.filter(c => c.status === 'CLOSED').length;

      setStats({ assigned, inProgress, completed });
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-danger';
      case 'ASSIGNED': return 'bg-warning text-dark';
      case 'IN_PROGRESS': return 'bg-info text-dark';
      case 'CLOSED': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-danger';
      case 'MEDIUM': return 'bg-warning text-dark';
      case 'LOW': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Staff Dashboard</h2>
          <p className="text-muted">Manage your assigned complaints and tasks</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-warning">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.assigned}</h3>
              <p className="mb-0">Assigned</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-info">
            <Card.Body className="text-center">
              <h3 className="text-info">{stats.inProgress}</h3>
              <p className="mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-success">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.completed}</h3>
              <p className="mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-2">
                  <Button 
                    as={Link} 
                    to="/complaints" 
                    variant="primary" 
                    className="w-100"
                  >
                    📋 View All Complaints
                  </Button>
                </Col>
                <Col md={6} className="mb-2">
                  <Button 
                    as={Link} 
                    to="/complaints/new" 
                    variant="success" 
                    className="w-100"
                  >
                    ➕ Create New Complaint
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assigned Complaints */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">My Assigned Complaints ({assignedComplaints.length})</h5>
            </Card.Header>
            <Card.Body>
              {assignedComplaints.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>No complaints assigned to you at the moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Schedule Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedComplaints.map(complaint => (
                        <tr key={complaint.id}>
                          <td>#{complaint.id}</td>
                          <td>
                            <div>
                              <strong>{complaint.customerName}</strong>
                              <br />
                              <small className="text-muted">{complaint.mobileNumber}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {complaint.complaintType?.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <Badge className={getPriorityBadgeClass(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                          </td>
                          <td>
                            <Badge className={getStatusBadgeClass(complaint.status)}>
                              {complaint.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td>{formatDate(complaint.createdAt)}</td>
                          <td>{formatDate(complaint.scheduleDate)}</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/complaints/edit/${complaint.id}`}
                              size="sm"
                              variant="outline-primary"
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffDashboard;
