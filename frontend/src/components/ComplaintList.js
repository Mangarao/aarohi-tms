import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import complaintService from '../services/complaintService';
import userService from '../services/userService';
import authService from '../services/authService';

/**
 * Complaint List component for viewing and managing complaints
 */
const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedStaff: ''
  });

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');

  const isAdmin = authService.isAdmin();
  const isStaff = authService.isStaff();

  const fetchData = useCallback(async () => {
    try {
      let complaintsData;
      if (isAdmin) {
        complaintsData = await complaintService.getAllComplaints();
        const staff = await userService.getActiveStaffMembers();
        setStaffMembers(staff);
      } else if (isStaff) {
        complaintsData = await complaintService.getMyAssignedComplaints();
      }
      
      setComplaints(complaintsData || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isStaff]);

  const applyFilters = useCallback(() => {
    let filtered = [...complaints];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(complaint =>
        complaint.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.mobileNumber.includes(filters.search) ||
        complaint.problemDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.machineNameModel.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(complaint => complaint.priority === filters.priority);
    }

    // Assigned staff filter
    if (filters.assignedStaff) {
      filtered = filtered.filter(complaint =>
        complaint.assignedStaff?.id.toString() === filters.assignedStaff
      );
    }

    setFilteredComplaints(filtered);
  }, [complaints, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Open assignment modal with schedule
  const handleOpenAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaff(staffMembers.length > 0 ? staffMembers[0].id : '');
    setScheduleDate('');
    setAssignmentError('');
    setAssignmentSuccess('');
    setShowAssignModal(true);
  };

  // Handle assignment with schedule date
  const handleAssignWithSchedule = async () => {
    if (!selectedStaff) {
      setAssignmentError('Please select a staff member');
      return;
    }

    if (!scheduleDate) {
      setAssignmentError('Please select a schedule date');
      return;
    }

    try {
      setAssignmentError('');
      const scheduleDatetime = scheduleDate + 'T09:00:00'; // Set default time to 9 AM
      await complaintService.assignComplaintWithSchedule(
        selectedComplaint.id, 
        selectedStaff, 
        scheduleDatetime
      );
      setAssignmentSuccess('Complaint assigned successfully with schedule!');
      setTimeout(() => {
        setShowAssignModal(false);
        fetchData(); // Refresh data
      }, 1500);
    } catch (error) {
      setAssignmentError(error.message || 'Error assigning complaint');
    }
  };

  // Handle close modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedComplaint(null);
    setSelectedStaff('');
    setScheduleDate('');
    setAssignmentError('');
    setAssignmentSuccess('');
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await complaintService.updateComplaintStatus(complaintId, newStatus);
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.message || 'Error updating status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-danger';
      case 'ASSIGNED': return 'bg-warning text-dark';
      case 'IN_PROGRESS': return 'bg-info text-dark';
      case 'CLOSED': return 'bg-success';
      case 'CANCELLED': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-secondary';
      case 'MEDIUM': return 'bg-info text-dark';
      case 'HIGH': return 'bg-warning text-dark';
      case 'URGENT': return 'bg-danger';
      default: return 'bg-secondary';
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
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="mb-2 mb-md-0">
              <h1 className="h3">{isAdmin ? 'All Complaints' : 'My Assigned Complaints'}</h1>
              <p className="text-muted mb-0">
                {filteredComplaints.length} of {complaints.length} complaints
              </p>
            </div>
            <Button 
              as={Link} 
              to="/complaint" 
              variant="primary"
              className="w-auto"
            >
              📝 New Complaint
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col xs={12} md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  placeholder="Search complaints..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {isAdmin && (
              <Col xs={12} sm={6} md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Assigned Staff</Form.Label>
                  <Form.Select
                    name="assignedStaff"
                    value={filters.assignedStaff}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col xs={12} sm={6} md={2} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={() => setFilters({ search: '', status: '', priority: '', assignedStaff: '' })}
                className="mb-3 w-100"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Complaints Table */}
      <Card>
        <Card.Body>
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No complaints found matching your criteria.</p>
            </div>
          ) : (
            <div className="table-responsive complaints-table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Machine</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Priority</th>
                    {isAdmin && <th>Assigned To</th>}
                    <th>Created</th>
                    <th>Scheduled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td data-label="ID">#{complaint.id}</td>
                      <td data-label="Customer">
                        <div>
                          <strong>{complaint.customerName}</strong>
                          <br />
                          <small className="text-muted">
                            {complaint.city}, {complaint.state}
                          </small>
                        </div>
                      </td>
                      <td data-label="Contact">
                        <div>
                          {complaint.mobileNumber}
                          <br />
                          {complaint.email && (
                            <small className="text-muted">{complaint.email}</small>
                          )}
                        </div>
                      </td>
                      <td data-label="Machine">
                        <div>
                          <strong>{complaint.machineNameModel}</strong>
                          <br />
                          {complaint.underWarranty && (
                            <Badge bg="success" className="small">Under Warranty</Badge>
                          )}
                        </div>
                      </td>
                      <td data-label="Issue">
                        <div>
                          <Badge bg="info" className="small">
                            {complaint.complaintType.replace('_', ' ')}
                          </Badge>
                          <br />
                          <small>{complaint.problemDescription}</small>
                        </div>
                      </td>
                      <td data-label="Status">
                        <Badge className={getStatusBadgeClass(complaint.status)}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td data-label="Priority">
                        <Badge className={getPriorityBadgeClass(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td data-label="Assigned To">
                          {complaint.assignedStaff ? (
                            <div>
                              <span>{complaint.assignedStaff.fullName}</span>
                              <br />
                              {complaint.scheduledDate && (
                                <small className="text-muted">
                                  📅 {new Date(complaint.scheduledDate).toLocaleDateString()} {new Date(complaint.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              )}
                            </div>
                          ) : (
                            <div>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleOpenAssignModal(complaint)}
                                className="w-100"
                              >
                                📅 Assign with Schedule
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                      <td data-label="Created">
                        <small>
                          {new Date(complaint.createdDate).toLocaleDateString()}
                        </small>
                      </td>
                      <td data-label="Scheduled">
                        {complaint.scheduledDate ? (
                          <small>
                            {new Date(complaint.scheduledDate).toLocaleDateString()}
                          </small>
                        ) : (
                          <small className="text-muted">Not scheduled</small>
                        )}
                      </td>
                      <td data-label="Actions">
                        <div className="btn-group-vertical btn-group-sm">
                          <Button
                            as={Link}
                            to={`/complaints/edit/${complaint.id}`}
                            size="sm"
                            variant="outline-primary"
                            className="mb-1"
                          >
                            ✏️ Edit
                          </Button>
                          
                          {(isStaff && complaint.status === 'ASSIGNED') && (
                            <Button
                              size="sm"
                              variant="info"
                              onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                              className="mb-1"
                            >
                              ▶️ Start
                            </Button>
                          )}
                          
                          {(isStaff && complaint.status === 'IN_PROGRESS') && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusUpdate(complaint.id, 'CLOSED')}
                              className="mb-1"
                            >
                              ✅ Complete
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

      {/* Assignment Modal */}
      <Modal show={showAssignModal} onHide={handleCloseAssignModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>📅 Assign Complaint with Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <div className="mb-3">
              <h6>Complaint #{selectedComplaint.id}</h6>
              <p className="text-muted">
                Customer: {selectedComplaint.customerName} - {selectedComplaint.mobileNumber}
              </p>
              <p className="small">
                <strong>Issue:</strong> {selectedComplaint.problemDescription}
              </p>
            </div>
          )}

          {assignmentError && (
            <Alert variant="danger" className="mb-3">
              {assignmentError}
            </Alert>
          )}

          {assignmentSuccess && (
            <Alert variant="success" className="mb-3">
              {assignmentSuccess}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>👤 Select Staff Member</Form.Label>
              <Form.Select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                required
              >
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>📅 Schedule Date</Form.Label>
              <Form.Control
                type="date"
                value={scheduleDate ? scheduleDate.split('T')[0] : ''}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
              <Form.Text className="text-muted">
                Select when this complaint should be worked on
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAssignModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssignWithSchedule}
            disabled={!selectedStaff || !scheduleDate}
          >
            📋 Assign with Schedule
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ComplaintList;
