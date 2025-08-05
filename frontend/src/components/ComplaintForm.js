import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import complaintService from '../services/complaintService';
import userService from '../services/userService';
import authService from '../services/authService';

/**
 * Complaint Form component for creating and editing complaints
 */
const ComplaintForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    machineNameModel: '',
    problemDescription: '',
    underWarranty: false,
    machinePurchaseDate: '',
    complaintType: 'MACHINE_REPAIR',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedStaff: null,
    resolutionNotes: ''
  });

  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const complaintTypes = [
    { value: 'MACHINE_REPAIR', label: 'Machine Repair' },
    { value: 'DEMO', label: 'Demo' },
    { value: 'MACHINE_ENQUIRY', label: 'Machine Enquiry' },
    { value: 'TRAINING', label: 'Training' },
    { value: 'OTHERS', label: 'Others' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const statuses = [
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const fetchComplaint = useCallback(async () => {
    try {
      const complaint = await complaintService.getComplaintById(id);
      setFormData({
        ...complaint,
        machinePurchaseDate: complaint.machinePurchaseDate ? 
          complaint.machinePurchaseDate.split('T')[0] : '',
        assignedStaff: complaint.assignedStaff?.id || null
      });
    } catch (error) {
      setError('Error fetching complaint details');
      console.error('Error:', error);
    }
  }, [id]);

  useEffect(() => {
    if (authService.isAdmin()) {
      fetchStaffMembers();
    }
    if (isEdit) {
      fetchComplaint();
    }
  }, [id, isEdit, fetchComplaint]);

  const fetchStaffMembers = async () => {
    try {
      const staff = await userService.getActiveStaffMembers();
      setStaffMembers(staff);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const dataToSubmit = {
        ...formData,
        assignedStaff: formData.assignedStaff ? { id: formData.assignedStaff } : null
      };

      if (isEdit) {
        await complaintService.updateComplaint(id, dataToSubmit);
        setSuccess('Complaint updated successfully!');
      } else {
        await complaintService.createComplaint(dataToSubmit);
        setSuccess('Complaint created successfully!');
      }

      setTimeout(() => {
        navigate(authService.isAdmin() ? '/admin/dashboard' : '/staff/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Error saving complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} lg={8}>
          <Card>
            <Card.Header>
              <h4>{isEdit ? 'Edit Complaint' : 'New Complaint'}</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" className="mb-3">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Customer Information */}
                <h5 className="mb-3">Customer Information</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
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
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Machine Information */}
                <h5 className="mb-3 mt-4">Machine Information</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Machine Name/Model *</Form.Label>
                      <Form.Control
                        type="text"
                        name="machineNameModel"
                        value={formData.machineNameModel}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Machine Purchase Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="machinePurchaseDate"
                        value={formData.machinePurchaseDate}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="underWarranty"
                    label="Under Warranty"
                    checked={formData.underWarranty}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Complaint Details */}
                <h5 className="mb-3 mt-4">Complaint Details</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Complaint Type *</Form.Label>
                      <Form.Select
                        name="complaintType"
                        value={formData.complaintType}
                        onChange={handleChange}
                        required
                      >
                        {complaintTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority *</Form.Label>
                      <Form.Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        required
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Problem Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Admin only fields */}
                {authService.isAdmin() && (
                  <>
                    <h5 className="mb-3 mt-4">Assignment & Status</h5>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                          >
                            {statuses.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Assign to Staff</Form.Label>
                          <Form.Select
                            name="assignedStaff"
                            value={formData.assignedStaff || ''}
                            onChange={handleChange}
                          >
                            <option value="">Select Staff Member</option>
                            {staffMembers.map(staff => (
                              <option key={staff.id} value={staff.id}>
                                {staff.fullName} ({staff.username})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Resolution notes for closed complaints */}
                {(formData.status === 'CLOSED' || authService.isStaff()) && (
                  <Form.Group className="mb-3">
                    <Form.Label>Resolution Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="resolutionNotes"
                      value={formData.resolutionNotes}
                      onChange={handleChange}
                      placeholder="Add resolution notes here..."
                    />
                  </Form.Group>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEdit ? 'Update Complaint' : 'Create Complaint'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ComplaintForm;
