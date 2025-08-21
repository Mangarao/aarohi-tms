import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <Card className="text-center">
                            <Card.Body className="p-5">
                                <div className="mb-4">
                                    <img 
                                        src="/aarohi.png"
                                        alt="Aarohi Sewing Enterprises Logo"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'contain',
                                            margin: '0 auto',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                                <h2 className="mb-3">Welcome to Aarohi Sewing Enterprises</h2>
                                <p className="text-muted mb-4">
                                    Task Management System
                                </p>
                                
                                <div className="d-grid gap-3">
                                    <Button 
                                        variant="primary" 
                                        size="lg"
                                        onClick={() => navigate('/complaint')}
                                    >
                                        File New Complaint
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => navigate('/login')}
                                    >
                                        Staff/Admin Login
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HomePage;
