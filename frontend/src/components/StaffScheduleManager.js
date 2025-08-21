import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Row, Col, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import complaintService from '../services/complaintService';
import userService from '../services/userService';

const StaffScheduleManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffSchedules, setStaffSchedules] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaffSchedule, setSelectedStaffSchedule] = useState(null);
  const [error, setError] = useState('');
  const [weekView, setWeekView] = useState(false);

  const fetchStaffSchedules = useCallback(async () => {
    if (allStaff.length === 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      const schedules = await Promise.all(
        allStaff.map(async (staff) => {
          try {
            const complaints = await complaintService.getStaffScheduleForDate(staff.id, selectedDate);
            return {
              staff,
              complaints: complaints || [],
              totalComplaints: complaints ? complaints.length : 0,
              completedComplaints: complaints ? complaints.filter(c => c.status === 'CLOSED').length : 0,
              inProgressComplaints: complaints ? complaints.filter(c => c.status === 'IN_PROGRESS').length : 0,
              pendingComplaints: complaints ? complaints.filter(c => c.status === 'ASSIGNED').length : 0
            };
          } catch (err) {
            console.error(`Error fetching schedule for staff ${staff.username}:`, err);
            return {
              staff,
              complaints: [],
              totalComplaints: 0,
              completedComplaints: 0,
              inProgressComplaints: 0,
              pendingComplaints: 0
            };
          }
        })
      );

      setStaffSchedules(schedules);
    } catch (error) {
      console.error('Error fetching staff schedules:', error);
      setError('Failed to fetch staff schedules');
    } finally {
      setLoading(false);
    }
  }, [allStaff, selectedDate]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (selectedDate && allStaff.length > 0) {
      fetchStaffSchedules();
    }
  }, [selectedDate, allStaff, fetchStaffSchedules]);

  const fetchStaffList = async () => {
    try {
      const staff = await userService.getAllStaff();
      setAllStaff(staff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setError('Failed to fetch staff list');
    }
  };

  const handleViewDetails = (staffSchedule) => {
    setSelectedStaffSchedule(staffSchedule);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getWorkloadColor = (totalComplaints) => {
    if (totalComplaints === 0) return 'text-muted';
    if (totalComplaints <= 2) return 'text-success';
    if (totalComplaints <= 5) return 'text-warning';
    return 'text-danger';
  };

  if (loading && allStaff.length === 0) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Staff Schedule Management</h5>
        </Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Staff Schedule Management</h5>
              <small className="text-muted">View and manage daily staff schedules</small>
            </div>
            <div className="d-flex gap-2">
              <Form.Check
                type="switch"
                id="week-view-switch"
                label="Week View"
                checked={weekView}
                onChange={(e) => setWeekView(e.target.checked)}
              />
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: 'auto' }}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Summary Statistics */}
          <Row className="mb-4">
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-primary mb-1">{staffSchedules.reduce((sum, s) => sum + s.totalComplaints, 0)}</h5>
                <small className="text-muted">Total Scheduled</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-warning mb-1">{staffSchedules.reduce((sum, s) => sum + s.pendingComplaints, 0)}</h5>
                <small className="text-muted">Pending</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-info mb-1">{staffSchedules.reduce((sum, s) => sum + s.inProgressComplaints, 0)}</h5>
                <small className="text-muted">In Progress</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-success mb-1">{staffSchedules.reduce((sum, s) => sum + s.completedComplaints, 0)}</h5>
                <small className="text-muted">Completed</small>
              </div>
            </Col>
          </Row>

          <h6 className="mb-3">Schedule for {formatDate(selectedDate)}</h6>

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading schedules...</span>
              </Spinner>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Total Tasks</th>
                    <th>Pending</th>
                    <th>In Progress</th>
                    <th>Completed</th>
                    <th>Workload</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffSchedules.map((schedule, index) => (
                    <tr key={schedule.staff.id}>
                      <td>
                        <div>
                          <strong>{schedule.staff.username}</strong>
                          <br />
                          <small className="text-muted">{schedule.staff.email}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="primary" className="fs-6">
                          {schedule.totalComplaints}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="warning" text="dark" className="fs-6">
                          {schedule.pendingComplaints}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="info" text="dark" className="fs-6">
                          {schedule.inProgressComplaints}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success" className="fs-6">
                          {schedule.completedComplaints}
                        </Badge>
                      </td>
                      <td>
                        <span className={getWorkloadColor(schedule.totalComplaints)}>
                          {schedule.totalComplaints === 0 ? 'Free' :
                           schedule.totalComplaints <= 2 ? 'Light' :
                           schedule.totalComplaints <= 5 ? 'Moderate' : 'Heavy'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(schedule)}
                          disabled={schedule.totalComplaints === 0}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {staffSchedules.length === 0 && !loading && (
            <div className="text-center text-muted py-4">
              <p>No staff members found or no schedules for the selected date.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Staff Schedule Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedStaffSchedule && selectedStaffSchedule.staff.username}'s Schedule
            <br />
            <small className="text-muted">{formatDate(selectedDate)}</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStaffSchedule && (
            <>
              {/* Staff Info */}
              <Row className="mb-3">
                <Col>
                  <Card className="bg-light">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <strong>Staff:</strong> {selectedStaffSchedule.staff.username}<br />
                          <strong>Email:</strong> {selectedStaffSchedule.staff.email}
                        </Col>
                        <Col md={6}>
                          <strong>Total Tasks:</strong> {selectedStaffSchedule.totalComplaints}<br />
                          <strong>Completion Rate:</strong> {
                            selectedStaffSchedule.totalComplaints > 0 
                              ? `${Math.round((selectedStaffSchedule.completedComplaints / selectedStaffSchedule.totalComplaints) * 100)}%`
                              : 'N/A'
                          }
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Complaint Details */}
              {selectedStaffSchedule.complaints.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Issue</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Schedule Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStaffSchedule.complaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>#{complaint.id}</td>
                          <td>{complaint.customerName}</td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {complaint.problemDescription}
                          </td>
                          <td>
                            <Badge bg={getPriorityBadgeClass(complaint.priority).replace('bg-', '')} className="fs-6">
                              {complaint.priority}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={getStatusBadgeClass(complaint.status).replace('bg-', '')} className="fs-6">
                              {complaint.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td>
                            {formatTime(complaint.scheduleDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No scheduled tasks for this date.</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StaffScheduleManager;
