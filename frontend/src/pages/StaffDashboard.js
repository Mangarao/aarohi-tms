import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import complaintService from '../services/complaintService';
import StaffExpenseManager from '../components/StaffExpenseManager';

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
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

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

  // Status update functions
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      setUpdatingStatus(complaintId);
      setUpdateMessage({ type: '', text: '' });

      if (newStatus === 'CLOSED') {
        // For closing complaints, show modal to get resolution notes
        const complaint = assignedComplaints.find(c => c.id === complaintId);
        setSelectedComplaint(complaint);
        setStatusUpdateModal(true);
        setUpdatingStatus(null);
        return;
      }

      await complaintService.updateComplaintStatus(complaintId, newStatus);
      
      // Refresh data
      await fetchStaffData();
      
      setUpdateMessage({ 
        type: 'success', 
        text: `Complaint status updated to ${newStatus.replace('_', ' ')}` 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdateMessage({ 
        type: 'danger', 
        text: 'Failed to update status. Please try again.' 
      });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 5000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCloseComplaint = async () => {
    if (!selectedComplaint || !resolutionNotes.trim()) {
      alert('Please provide resolution notes before closing the complaint.');
      return;
    }

    try {
      setUpdatingStatus(selectedComplaint.id);
      await complaintService.updateComplaintStatus(
        selectedComplaint.id, 
        'CLOSED', 
        resolutionNotes
      );
      
      // Close modal and refresh data
      setStatusUpdateModal(false);
      setSelectedComplaint(null);
      setResolutionNotes('');
      await fetchStaffData();
      
      setUpdateMessage({ 
        type: 'success', 
        text: 'Complaint closed successfully' 
      });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Error closing complaint:', error);
      setUpdateMessage({ 
        type: 'danger', 
        text: 'Failed to close complaint. Please try again.' 
      });
      setTimeout(() => setUpdateMessage({ type: '', text: '' }), 5000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getAvailableStatusUpdates = (currentStatus) => {
    switch (currentStatus) {
      case 'ASSIGNED':
        return ['IN_PROGRESS'];
      case 'IN_PROGRESS':
        return ['CLOSED'];
      case 'CLOSED':
        return []; // No further updates allowed
      default:
        return [];
    }
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
        <Col xs={12} sm={6} md={4}>
          <Card className="border-warning">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.assigned}</h3>
              <p className="mb-0">Assigned</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="border-info">
            <Card.Body className="text-center">
              <h3 className="text-info">{stats.inProgress}</h3>
              <p className="mb-0">In Progress</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={4}>
          <Card className="border-success">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.completed}</h3>
              <p className="mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* Staff Expenses Quick Action */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-2">
                  <Button 
                    as={Link} 
                    to="/staff/expenses" 
                    variant="warning" 
                    className="w-100"
                  >
                    💸 My Expenses
                  </Button>
                </Col>
                {/* ...existing quick action buttons... */}
                <Col md={4} className="mb-2">
                  <Button 
                    as={Link} 
                    to="/complaints" 
                    variant="primary" 
                    className="w-100"
                  >
                    📋 View All Complaints
                  </Button>
                </Col>
                <Col md={4} className="mb-2">
                  <Button 
                    as={Link} 
                    to="/complaint" 
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
                          <td>{formatDate(complaint.scheduledDate)}</td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap flex-column flex-sm-row">
                              {/* Edit Button */}
                              <Button
                                as={Link}
                                to={`/complaints/edit/${complaint.id}`}
                                size="sm"
                                variant="outline-primary"
                                className="mb-1 btn-responsive"
                              >
                                ✏️ Edit
                              </Button>
                              
                              {/* Status Update Buttons */}
                              {getAvailableStatusUpdates(complaint.status).map(status => (
                                <Button
                                  key={status}
                                  size="sm"
                                  variant={status === 'IN_PROGRESS' ? 'info' : 'success'}
                                  onClick={() => handleStatusUpdate(complaint.id, status)}
                                  disabled={updatingStatus === complaint.id}
                                  className="mb-1 btn-responsive"
                                >
                                  {updatingStatus === complaint.id ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  ) : (
                                    <>
                                      {status === 'IN_PROGRESS' ? '▶️' : '✅'} 
                                      {status === 'IN_PROGRESS' ? 'Start' : 'Complete'}
                                    </>
                                  )}
                                </Button>
                              ))}
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
        </Col>
      </Row>

      {/* Status Update Message */}
      {updateMessage.text && (
        <Row className="mb-3">
          <Col>
            <Alert variant={updateMessage.type} className="text-center">
              {updateMessage.text}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Status Update Modal for Closing Complaints */}
      <Modal show={statusUpdateModal} onHide={() => setStatusUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Close Complaint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <div>
              <p><strong>Complaint ID:</strong> #{selectedComplaint.id}</p>
              <p><strong>Customer:</strong> {selectedComplaint.customerName}</p>
              <p><strong>Issue:</strong> {selectedComplaint.problemDescription}</p>
              
              <Form.Group className="mt-3">
                <Form.Label>Resolution Notes *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Please describe how this complaint was resolved..."
                  required
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setStatusUpdateModal(false);
              setSelectedComplaint(null);
              setResolutionNotes('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleCloseComplaint}
            disabled={!resolutionNotes.trim() || updatingStatus}
          >
            {updatingStatus ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Closing...
              </>
            ) : (
              'Close Complaint'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffDashboard;
