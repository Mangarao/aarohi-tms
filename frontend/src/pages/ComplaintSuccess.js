import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Complaint Success page - shows confirmation after successful complaint submission
 */
const ComplaintSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the complaint data from the navigation state
  const { complaintId, customerName } = location.state || {};

  // If no complaint data, redirect to complaint form
  if (!complaintId || !customerName) {
    navigate('/complaint');
    return null;
  }

  return (
    <div className="complaint-success-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '50px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card className="shadow-lg">
              <Card.Body className="p-5 text-center">
                {/* Logo */}
                <div className="mb-4">
                  <img 
                    src="/aarohi.png"
                    alt="Aarohi Sewing Enterprises Logo"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain',
                      margin: '0 auto',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Success Icon */}
                <div className="mb-4">
                  <div 
                    className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    ✓
                  </div>
                </div>

                {/* Success Message */}
                <h2 className="text-success mb-4">Complaint Submitted Successfully!</h2>
                
                <div className="bg-light p-4 rounded mb-4">
                  <h4 className="text-primary mb-3">Your Complaint Number: #{complaintId}</h4>
                  
                  <div className="text-start">
                    <p className="mb-3">
                      <strong>Dear {customerName},</strong>
                    </p>
                    
                    <p className="mb-3">
                      Thank you for reaching out to <strong>Aarohi Sewing Enterprises</strong>. 
                      We have received your complaint and assigned it reference number <strong>#{complaintId}</strong>.
                    </p>
                    
                    <p className="mb-3">
                      We appreciate your patience. Our dedicated service team will contact you 
                      as per their availability at the earliest.
                    </p>
                    
                    <p className="mb-3">
                      Please save this complaint number for future reference and kindly avoid 
                      submitting multiple complaints for the same issue.
                    </p>
                    
                    <p className="mb-0">
                      We are committed to resolving your concern promptly and efficiently.
                    </p>
                  </div>
                </div>

                {/* Company Signature */}
                <div className="text-muted mb-4">
                  <p className="mb-0"><strong>Best regards,</strong></p>
                  <p className="mb-0">Aarohi Sewing Enterprises Team</p>
                </div>

                {/* Additional Information */}
                <div className="alert alert-info mb-4">
                  <h6 className="mb-2">📱 <strong>For Embroidery Designs:</strong></h6>
                  <small>Use Aarohi Designs app or visit aarohisewing.com</small>
                </div>

                {/* Contact Information */}
                <div className="mt-4 pt-4 border-top">
                  <small className="text-muted">
                    If you have any questions about your complaint, please contact our support team 
                    with your complaint number #{complaintId}.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ComplaintSuccess;
