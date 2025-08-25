import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Badge, Button, Row, Col, Tabs, Tab, Form, InputGroup } from 'react-bootstrap';
import staffExpenseService from '../services/staffExpenseService';
import StaffExpenseModal from './StaffExpenseModal';

const StaffExpenseManager = () => {
  // Fetch expenses data from backend
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [unpaid, paid] = await Promise.all([
        staffExpenseService.getMyUnpaidStaffExpenses(),
        staffExpenseService.getMyStaffExpenses()
      ]);
      setUnpaidExpenses(unpaid);
      setPaidExpenses(paid.filter(e => e.isPaidByCompany));
      setStats({
        totalUnpaidAmount: unpaid.reduce((sum, e) => sum + (e.amount || 0), 0),
        totalPaidAmount: paid.filter(e => e.isPaidByCompany).reduce((sum, e) => sum + (e.amount || 0), 0),
        unpaidCount: unpaid.length,
        paidCount: paid.filter(e => e.isPaidByCompany).length,
        totalCount: paid.length
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, []);
  // Add missing state variables and stubs
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUnpaidAmount: 0,
    totalPaidAmount: 0,
    unpaidCount: 0,
    paidCount: 0,
    totalCount: 0
  });
  const [activeTab, setActiveTab] = useState('unpaid');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Handler stubs
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowModal(true);
  };
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };
  const [clearingExpenseId, setClearingExpenseId] = useState(null);
  const [clearMessage, setClearMessage] = useState('');

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await staffExpenseService.deleteStaffExpense(id);
      setClearMessage('Expense deleted successfully.');
      await fetchAllData();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const handleClearExpense = async (id) => {
    setClearingExpenseId(id);
    try {
      await staffExpenseService.clearExpense(id);
      setClearMessage('Expense marked as cleared.');
      await fetchAllData();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError('Failed to clear expense: ' + err.response.data.message);
      } else {
        setError('Failed to clear expense');
      }
    }
    setClearingExpenseId(null);
  };
  // ...existing code...
  // Place return statement at the end
  const [unpaidExpenses, setUnpaidExpenses] = useState([]);
  const [paidExpenses, setPaidExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...existing code...
  // Place return statement at the end

  const handleExpenseSaved = async () => {
    await fetchAllData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredExpenses = (expenses) => {
    if (!searchTerm) return expenses;
    return expenses.filter(expense => 
      expense.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.complaintNumber && expense.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const renderExpenseTable = (expenses, showActions = true) => {
    const filteredExpenses = getFilteredExpenses(expenses);

    if (filteredExpenses.length === 0) {
      return (
        <div className="text-center text-muted py-4">
          <p>No expenses found{searchTerm ? ' matching your search' : ''}.</p>
          {!searchTerm && showActions && (
            <Button variant="outline-primary" onClick={handleAddExpense}>
              Add Your First Expense
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Reason</th>
              <th>Complaint #</th>
              <th>Date</th>
              <th>Status</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr key={expense.id}>
                <td>
                  <Badge bg="info" className="fs-6">
                    {formatCurrency(expense.amount)}
                  </Badge>
                </td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '200px' }}>
                    {expense.reason}
                  </div>
                </td>
                <td>
                  {expense.complaintNumber ? (
                    <Badge bg="secondary">{expense.complaintNumber}</Badge>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <small>{formatDateTime(expense.expenseDate)}</small>
                </td>
                <td>
                  <Badge bg={expense.isPaidByCompany ? 'success' : 'warning'}>
                    {expense.isPaidByCompany ? 'Paid' : 'Pending'}
                  </Badge>
                </td>
                {showActions && (
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant={expense.isPaidByCompany ? 'outline-secondary' : 'outline-primary'}
                        size="sm"
                        onClick={() => handleEditExpense(expense)}
                        title={expense.isPaidByCompany ? 'View Details' : 'Edit'}
                      >
                        {expense.isPaidByCompany ? '👁️' : '✏️'}
                      </Button>
                      {!expense.isPaidByCompany && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          title="Delete"
                        >
                          🗑️
                        </Button>
                      )}
                      {/* Clear button for unpaid expenses */}
                      {!expense.isPaidByCompany && expense.status !== 'CLEARED' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          disabled={clearingExpenseId === expense.id}
                          onClick={() => handleClearExpense(expense.id)}
                          title="Mark as Cleared"
                        >
                          {clearingExpenseId === expense.id ? 'Clearing...' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">My Staff Expenses</h5>
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
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">My Staff Expenses</h5>
            <small className="text-muted">Manage your personal expenses for reimbursement</small>
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={handleAddExpense}
          >
            ➕ Add Expense
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {clearMessage && <Alert variant="success">{clearMessage}</Alert>}
          {/* Stats Row */}
          <Row className="mb-4">
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-primary mb-1">{formatCurrency(stats.totalUnpaidAmount)}</h5>
                <small className="text-muted">Pending Amount</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-success mb-1">{formatCurrency(stats.totalPaidAmount)}</h5>
                <small className="text-muted">Paid Amount</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-info mb-1">{stats.unpaidCount}</h5>
                <small className="text-muted">Pending Count</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h5 className="text-secondary mb-1">{stats.totalCount}</h5>
                <small className="text-muted">Total Records</small>
              </div>
            </Col>
          </Row>
          {/* Search Bar */}
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by reason or complaint number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              </InputGroup>
            </Col>
          </Row>
          {/* Tabs for different views */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="unpaid" title={`Pending (${stats.unpaidCount})`}>
              {renderExpenseTable(unpaidExpenses, true)}
            </Tab>
            <Tab eventKey="paid" title={`Paid (${stats.paidCount})`}>
              {renderExpenseTable(paidExpenses, true)}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      <StaffExpenseModal
        show={showModal}
        onHide={() => setShowModal(false)}
        expense={editingExpense}
        onSave={handleExpenseSaved}
      />
    </>
  );
}

export default StaffExpenseManager;