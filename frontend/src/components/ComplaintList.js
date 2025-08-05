import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form } from 'react-bootstrap';
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

  const handleAssignStaff = async (complaintId, staffId) => {
    try {
      await complaintService.assignComplaint(complaintId, staffId);
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.message || 'Error assigning complaint');
    }
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>{isAdmin ? 'All Complaints' : 'My Assigned Complaints'}</h1>
              <p className="text-muted">
                {filteredComplaints.length} of {complaints.length} complaints
              </p>
            </div>
            <Button as={Link} to="/complaints/new" variant="primary">
              New Complaint
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
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
            <Col md={2}>
              <Form.Group>
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
            <Col md={2}>
              <Form.Group>
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
              <Col md={3}>
                <Form.Group>
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
            <Col md={2} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={() => setFilters({ search: '', status: '', priority: '', assignedStaff: '' })}
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
            <div className="table-responsive">
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
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>#{complaint.id}</td>
                      <td>
                        <div>
                          <strong>{complaint.customerName}</strong>
                          <br />
                          <small className="text-muted">
                            {complaint.city}, {complaint.state}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {complaint.mobileNumber}
                          <br />
                          {complaint.email && (
                            <small className="text-muted">{complaint.email}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{complaint.machineNameModel}</strong>
                          <br />
                          {complaint.underWarranty && (
                            <Badge bg="success" className="small">Under Warranty</Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <div 
                          className="text-truncate" 
                          style={{ maxWidth: '200px' }}
                          title={complaint.problemDescription}
                        >
                          <Badge bg="info" className="small">
                            {complaint.complaintType.replace('_', ' ')}
                          </Badge>
                          <br />
                          <small>{complaint.problemDescription}</small>
                        </div>
                      </td>
                      <td>
                        <Badge className={getStatusBadgeClass(complaint.status)}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge className={getPriorityBadgeClass(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          {complaint.assignedStaff ? (
                            <span>{complaint.assignedStaff.fullName}</span>
                          ) : (
                            <Form.Select
                              size="sm"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignStaff(complaint.id, e.target.value);
                                }
                              }}
                            >
                              <option value="">Assign Staff</option>
                              {staffMembers.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                  {staff.fullName}
                                </option>
                              ))}
                            </Form.Select>
                          )}
                        </td>
                      )}
                      <td>
                        <small>
                          {new Date(complaint.createdDate).toLocaleDateString()}
                          <br />
                          {new Date(complaint.createdDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group-vertical btn-group-sm">
                          <Button
                            as={Link}
                            to={`/complaints/edit/${complaint.id}`}
                            size="sm"
                            variant="outline-primary"
                          >
                            Edit
                          </Button>
                          
                          {(isStaff && complaint.status === 'ASSIGNED') && (
                            <Button
                              size="sm"
                              variant="info"
                              onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                            >
                              Start
                            </Button>
                          )}
                          
                          {(isStaff && complaint.status === 'IN_PROGRESS') && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusUpdate(complaint.id, 'CLOSED')}
                            >
                              Complete
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
    </Container>
  );
};

export default ComplaintList;
