const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

function ExpenseFilter({ category, onChange }) {
  return (
    <label className="filter-control">
      <span>Category</span>
      <select onChange={(event) => onChange(event.target.value)} value={category}>
        <option value="">All categories</option>
        {categories.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default ExpenseFilter;
