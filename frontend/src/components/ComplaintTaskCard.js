import React, { useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Alert } from 'react-bootstrap';

/**
 * Enhanced Complaint Card component with task scheduling for staff
 */
const ComplaintTaskCard = ({ complaint, onUpdateComplaint, currentUser }) => {
  const [scheduleDate, setScheduleDate] = useState(complaint.scheduleDate || '');
  const [completionDate, setCompletionDate] = useState(complaint.completionDate || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getStatusVariant = (status) => {
    switch (status) {
      case 'OPEN': return 'danger';
      case 'ASSIGNED': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'CLOSED': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'HIGH': return 'danger';
      case 'URGENT': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'secondary';
    }
  };

  const handleDateUpdate = async (field, value) => {
    if (!value) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { [field]: value };
      await onUpdateComplaint(complaint.id, updateData);
      
      if (field === 'scheduleDate') {
        setScheduleDate(value);
        setSuccess('Schedule date updated successfully');
      }
      if (field === 'completionDate') {
        setCompletionDate(value);
        setSuccess('Completion date updated successfully');
      }
    } catch (error) {
      setError(`Error updating ${field}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { status: newStatus };
      
      // If completing the task, auto-set completion date
      if (newStatus === 'CLOSED' && !completionDate) {
        const now = new Date().toISOString().slice(0, 16);
        updateData.completionDate = now;
        setCompletionDate(now);
      }

      await onUpdateComplaint(complaint.id, updateData);
      setSuccess(`Status updated to ${newStatus}`);
    } catch (error) {
      setError(`Error updating status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="mb-1 fw-bold">Complaint #{complaint.id}</h6>
            <p className="text-muted small mb-0">{complaint.customerName}</p>
            <small className="text-muted">{complaint.mobileNumber}</small>
          </div>
          <div className="text-end">
            <Badge bg={getStatusVariant(complaint.status)} className="me-2 mb-1">
              {complaint.status}
            </Badge>
            <br />
            <Badge bg={getPriorityVariant(complaint.priority)}>
              {complaint.priority}
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 small">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="py-2 small">
            {success}
          </Alert>
        )}

        <div className="mb-3">
          <p className="small mb-1"><strong>Machine:</strong> {complaint.machineNameModel}</p>
          <p className="small mb-1"><strong>Type:</strong> {complaint.complaintType}</p>
          <p className="small mb-0"><strong>Problem:</strong> {complaint.problemDescription}</p>
        </div>

        {/* Task Scheduling Section for Staff */}
        {currentUser.role === 'STAFF' && (
          <div className="border-top pt-3 mb-3">
            <h6 className="mb-3 text-primary">Task Scheduling</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Schedule Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    size="sm"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    onBlur={(e) => handleDateUpdate('scheduleDate', e.target.value)}
                    disabled={loading}
                  />
                  <small className="text-muted">
                    Current: {formatDate(scheduleDate)}
                  </small>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Completion Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    size="sm"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    onBlur={(e) => handleDateUpdate('completionDate', e.target.value)}
                    disabled={loading || complaint.status !== 'CLOSED'}
                  />
                  <small className="text-muted">
                    Current: {formatDate(completionDate)}
                  </small>
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Created: {new Date(complaint.createdAt).toLocaleDateString()}
          </small>
          
          {currentUser.role === 'STAFF' && (
            <div>
              {complaint.status === 'ASSIGNED' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? 'Starting...' : 'Start Work'}
                </Button>
              )}
              {complaint.status === 'IN_PROGRESS' && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleStatusUpdate('CLOSED')}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Mark Complete'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Task Timeline Display */}
        {(scheduleDate || completionDate) && (
          <div className="border-top pt-3 mt-3">
            <h6 className="mb-2 text-secondary small">Task Timeline</h6>
            <div className="d-flex justify-content-between small">
              <div>
                <span className="fw-bold">Scheduled:</span> {formatDate(scheduleDate)}
              </div>
              {completionDate && (
                <div>
                  <span className="fw-bold">Completed:</span> {formatDate(completionDate)}
                </div>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ComplaintTaskCard;
