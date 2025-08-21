import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge, ButtonGroup } from 'react-bootstrap';
import staffExpenseService from '../services/staffExpenseService';
import authService from '../services/authService';

const StaffExpenseModal = ({ show, onHide, expense, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    expenseDate: '',
    complaintNumber: '',
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    const currentUser = authService.getCurrentUser();
    setIsAdmin(currentUser && currentUser.roles && currentUser.roles.includes('ROLE_ADMIN'));
  }, []);

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount || '',
        reason: expense.reason || '',
        expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : '',
        complaintNumber: expense.complaintNumber || '',
        status: expense.status || 'PENDING'
      });
    } else {
      // Reset form for new expense
      setFormData({
        amount: '',
        reason: '',
        expenseDate: new Date().toISOString().split('T')[0],
        complaintNumber: '',
        status: 'PENDING'
      });
    }
    setError('');
  }, [expense, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.reason || !formData.expenseDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate
      };

      if (expense) {
        // Update existing expense
        await staffExpenseService.updateStaffExpense(expense.id, expenseData);
      } else {
        // Create new expense
        await staffExpenseService.createStaffExpense(expenseData);
      }

      onSave();
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
      console.error('Error saving expense:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!expense || !isAdmin) return;
    
    try {
      setUpdatingStatus(true);
      setError('');
      
      if (newStatus === 'PAID') {
        await staffExpenseService.markExpenseAsPaid(expense.id);
      } else {
        await staffExpenseService.updateExpenseStatus(expense.id, newStatus);
      }
      
      onSave();
      // Don't close modal, just refresh data to show updated status
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const isReadOnly = expense && expense.isPaidByCompany;
  const isPaid = expense && (expense.status === 'PAID' || expense.isPaidByCompany);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {expense ? (isReadOnly ? 'Expense Details' : 'Edit Expense') : 'Add New Expense'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Status Display for existing expenses */}
          {expense && (
            <div className="mb-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span><strong>Status:</strong></span>
                <Badge bg={isPaid ? 'success' : 'warning'} className="fs-6">
                  {isPaid ? 'PAID' : expense.status || 'PENDING'}
                </Badge>
              </div>
              {expense.isPaidByCompany && (
                <small className="text-success">
                  ✅ This expense has been paid by the company
                </small>
              )}
              
              {/* Admin Status Update Controls */}
              {isAdmin && !expense.isPaidByCompany && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted"><strong>Admin Controls:</strong></small>
                  </div>
                  <ButtonGroup size="sm" className="w-100">
                    <Button 
                      variant={expense.status === 'PENDING' ? 'warning' : 'outline-warning'}
                      onClick={() => handleStatusUpdate('PENDING')}
                      disabled={updatingStatus || expense.status === 'PENDING'}
                    >
                      {updatingStatus ? <Spinner size="sm" /> : 'Pending'}
                    </Button>
                    <Button 
                      variant={expense.status === 'APPROVED' ? 'info' : 'outline-info'}
                      onClick={() => handleStatusUpdate('APPROVED')}
                      disabled={updatingStatus || expense.status === 'APPROVED'}
                    >
                      {updatingStatus ? <Spinner size="sm" /> : 'Approve'}
                    </Button>
                    <Button 
                      variant="success"
                      onClick={() => handleStatusUpdate('PAID')}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? <Spinner size="sm" /> : 'Mark Paid'}
                    </Button>
                    <Button 
                      variant={expense.status === 'REJECTED' ? 'danger' : 'outline-danger'}
                      onClick={() => handleStatusUpdate('REJECTED')}
                      disabled={updatingStatus || expense.status === 'REJECTED'}
                    >
                      {updatingStatus ? <Spinner size="sm" /> : 'Reject'}
                    </Button>
                  </ButtonGroup>
                  <small className="text-muted d-block mt-1">
                    Update expense status and payment information
                  </small>
                </div>
              )}
            </div>
          )}

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Amount (₹) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  disabled={isReadOnly || saving}
                  style={{
                    textDecoration: isPaid ? 'line-through' : 'none',
                    opacity: isPaid ? 0.7 : 1
                  }}
                  required
                />
                {isPaid && formData.amount && (
                  <Form.Text className="text-success">
                    Amount paid: {formatCurrency(formData.amount)}
                  </Form.Text>
                )}
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Expense Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for expense"
              disabled={isReadOnly || saving}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Complaint Number</Form.Label>
            <Form.Control
              type="text"
              name="complaintNumber"
              value={formData.complaintNumber}
              onChange={handleChange}
              placeholder="Related complaint number (optional)"
              disabled={isReadOnly || saving}
            />
            <Form.Text className="text-muted">
              Link this expense to a specific complaint if applicable
            </Form.Text>
          </Form.Group>

          {/* Additional info for paid expenses */}
          {expense && expense.isPaidByCompany && (
            <div className="alert alert-success">
              <h6>Payment Information</h6>
              <p className="mb-1">
                <strong>Paid Amount:</strong> {formatCurrency(expense.amount)}
              </p>
              {expense.paidDate && (
                <p className="mb-1">
                  <strong>Paid Date:</strong> {new Date(expense.paidDate).toLocaleDateString('en-IN')}
                </p>
              )}
              <small className="text-muted">
                This expense has been processed and paid by the company.
              </small>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          
          {!isReadOnly && (
            <Button 
              variant="primary" 
              type="submit" 
              disabled={saving}
            >
              {saving && <Spinner as="span" animation="border" size="sm" className="me-2" />}
              {expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StaffExpenseModal;
