import ExpenseItem from "./ExpenseItem.jsx";

function ExpenseList({ expenses, loading, onEdit, onDelete, deletingId }) {
  if (loading) {
    return <p className="list-message">Loading expenses...</p>;
  }

  if (expenses.length === 0) {
    return <p className="list-message">No expenses to show.</p>;
  }

  return (
    <div className="expense-list">
      <div aria-hidden="true" className="list-heading">
        <span>Description</span>
        <span>Category</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Actions</span>
      </div>
      {expenses.map((expense) => (
        <ExpenseItem
          deleting={deletingId === expense._id}
          expense={expense}
          key={expense._id}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ExpenseList;
