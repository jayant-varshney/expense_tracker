function formatDate(date) {
  const [year, month, day] = new Date(date).toISOString().slice(0, 10).split("-");
  return `${month}/${day}/${year}`;
}

function ExpenseItem({ expense, onEdit, onDelete, deleting }) {
  return (
    <article className="expense-row">
      <div className="expense-main">
        <strong>{expense.description}</strong>
        <span className="expense-mobile-meta">{expense.category} · {formatDate(expense.date)}</span>
      </div>
      <span className="category-tag">{expense.category}</span>
      <time className="expense-date" dateTime={new Date(expense.date).toISOString()}>
        {formatDate(expense.date)}
      </time>
      <strong className="expense-amount">${Number(expense.amount).toFixed(2)}</strong>
      <div className="row-actions">
        <button aria-label={`Edit ${expense.description}`} onClick={() => onEdit(expense)} type="button">
          Edit
        </button>
        <button
          aria-label={`Delete ${expense.description}`}
          className="delete-button"
          disabled={deleting}
          onClick={() => onDelete(expense)}
          type="button"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default ExpenseItem;
