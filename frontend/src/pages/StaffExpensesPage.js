import React from 'react';
import StaffExpenseManager from '../components/StaffExpenseManager';

const StaffExpensesPage = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">My Staff Expenses</h2>
      <StaffExpenseManager />
    </div>
  );
};

export default StaffExpensesPage;
