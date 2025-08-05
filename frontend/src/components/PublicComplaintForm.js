import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';

/**
 * Public Complaint Form component - accessible without login
 */
const PublicComplaintForm = () => {
  const navigate = useNavigate();
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
    complaintType: 'MACHINE_REPAIR'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingComplaint, setExistingComplaint] = useState(null);

  const complaintTypes = [
    { value: 'MACHINE_REPAIR', label: 'Machine Repair' },
    { value: 'DEMO', label: 'Demo' },
    { value: 'MACHINE_ENQUIRY', label: 'Machine Enquiry' },
    { value: 'TRAINING', label: 'Training' },
    { value: 'OTHERS', label: 'Others' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for mobile number to allow only digits and limit to 10 characters
    if (name === 'mobileNumber') {
      const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const checkExistingComplaint = async (mobileNumber) => {
    try {
      const response = await complaintService.checkExistingComplaint(mobileNumber);
      return response;
    } catch (error) {
      return null;
    }
  };

  const handleMobileBlur = async () => {
    if (formData.mobileNumber.length === 10) {
      const existing = await checkExistingComplaint(formData.mobileNumber);
      if (existing) {
        setExistingComplaint(existing);
        setError(`You already have an active complaint (ID: ${existing.id}). Status: ${existing.status}. Please wait for it to be resolved before submitting a new complaint.`);
      } else {
        setExistingComplaint(null);
        setError('');
      }
    } else if (formData.mobileNumber.length > 0) {
      setError('Mobile number must be exactly 10 digits');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mobile number length
    if (formData.mobileNumber.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }
    
    if (existingComplaint) {
      setError('Cannot submit new complaint. You have an active complaint already.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const complaintData = {
        ...formData,
        priority: 'MEDIUM',
        status: 'OPEN'
      };

      const response = await complaintService.createPublicComplaint(complaintData);
      
      // Redirect to success page with complaint details
      navigate('/complaint/success', {
        state: {
          complaintId: response.id,
          customerName: formData.customerName
        }
      });
      
    } catch (error) {
      setError(error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-complaint-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '30px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <img 
                      src="/aarohi.png"
                      alt="Aarohi Sewing Enterprises Logo"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'contain',
                        margin: '0 auto',
                        display: 'block'
                      }}
                    />
                  </div>
                  <h3 className="mb-1">Submit a Complaint</h3>
                  <p className="text-muted">Aarohi Sewing Enterprises</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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
                          placeholder="Enter your full name"
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
                          onBlur={handleMobileBlur}
                          required
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          minLength={10}
                          pattern="[0-9]{10}"
                          title="Please enter exactly 10 digits"
                        />
                        <Form.Text className="text-muted">
                          {formData.mobileNumber.length}/10 digits
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

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

                  <Form.Group className="mb-3">
                    <Form.Label>Address *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your address"
                    />
                  </Form.Group>

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
                          placeholder="Enter city"
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
                          placeholder="Enter state"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Machine Name/Model *</Form.Label>
                    <Form.Control
                      type="text"
                      name="machineNameModel"
                      value={formData.machineNameModel}
                      onChange={handleChange}
                      required
                      placeholder="Enter machine name or model"
                    />
                  </Form.Group>

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

                  <Form.Group className="mb-3">
                    <Form.Label>Problem Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="problemDescription"
                      value={formData.problemDescription}
                      onChange={handleChange}
                      required
                      placeholder="Describe the problem in detail"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          name="underWarranty"
                          checked={formData.underWarranty}
                          onChange={handleChange}
                          label="Machine is under warranty"
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

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading || existingComplaint}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Complaint'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Your complaint will be reviewed and assigned to our support team.
                  </small>
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-info">
                      <strong>📱 For Embroidery Designs:</strong> Use Aarohi Designs app or visit aarohisewing.com
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PublicComplaintForm;
