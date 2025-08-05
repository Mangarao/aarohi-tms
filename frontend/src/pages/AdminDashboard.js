import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import complaintService from '../services/complaintService';
import userService from '../services/userService';

/**
 * Admin Dashboard component
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    complaints: null,
    users: null
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [complaintStats, userStats, recent] = await Promise.all([
        complaintService.getComplaintStats(),
        userService.getUserStats(),
        complaintService.getRecentComplaints()
      ]);

      setStats({
        complaints: complaintStats,
        users: userStats
      });
      setRecentComplaints(recent.slice(0, 5)); // Show only 5 recent complaints
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Welcome to the Task Management System</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h3 className="text-primary">{stats.complaints?.totalComplaints || 0}</h3>
              <p className="mb-1">Total Complaints</p>
              <small className="text-muted">All time</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.complaints?.openComplaints || 0}</h3>
              <p className="mb-1">Open Complaints</p>
              <small className="text-muted">Needs attention</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h3 className="text-info">{stats.complaints?.inProgressComplaints || 0}</h3>
              <p className="mb-1">In Progress</p>
              <small className="text-muted">Being worked on</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.complaints?.closedComplaints || 0}</h3>
              <p className="mb-1">Closed</p>
              <small className="text-muted">Completed</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h3 className="text-dark">{stats.users?.totalStaff || 0}</h3>
              <p className="mb-1">Staff Members</p>
              <small className="text-muted">Active users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="dashboard-card h-100">
            <Card.Body className="text-center">
              <h3 className="text-danger">{stats.complaints?.highPriorityComplaints || 0}</h3>
              <p className="mb-1">High Priority</p>
              <small className="text-muted">Urgent attention</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <h5>Quick Actions</h5>
              <div className="d-grid gap-2">
                <Button as={Link} to="/complaints/new" variant="primary">
                  New Complaint
                </Button>
                <Button as={Link} to="/users" variant="outline-primary">
                  Manage Users
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Complaints */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Complaints</h5>
                <Button as={Link} to="/complaints" variant="outline-primary" size="sm">
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {recentComplaints.length === 0 ? (
                <p className="text-muted text-center">No recent complaints</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentComplaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>#{complaint.id}</td>
                          <td>{complaint.customerName}</td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {complaint.problemDescription}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td>
                            {new Date(complaint.createdDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
