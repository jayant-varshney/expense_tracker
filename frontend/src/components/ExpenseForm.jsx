import { useEffect, useState } from "react";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

function emptyForm() {
  return {
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

function ExpenseForm({ editingExpense, onSave, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        description: editingExpense.description,
        amount: String(editingExpense.amount),
        category: editingExpense.category,
        date: new Date(editingExpense.date).toISOString().slice(0, 10),
      });
    } else {
      setForm(emptyForm());
    }
    setError("");
  }, [editingExpense]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.description.trim()) {
      setError("Enter a description.");
      return;
    }
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.category) {
      setError("Choose a category.");
      return;
    }
    if (!form.date) {
      setError("Choose a date.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        description: form.description.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
      });
      if (!editingExpense) setForm(emptyForm());
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <label className="field field-description">
        <span>Description</span>
        <input
          autoComplete="off"
          maxLength="120"
          name="description"
          onChange={handleChange}
          placeholder="e.g. Lunch with friends"
          value={form.description}
        />
      </label>

      <label className="field">
        <span>Amount</span>
        <div className="amount-input">
          <span aria-hidden="true">$</span>
          <input
            min="0"
            name="amount"
            onChange={handleChange}
            placeholder="0.00"
            step="any"
            type="number"
            value={form.amount}
          />
        </div>
      </label>

      <label className="field">
        <span>Category</span>
        <select name="category" onChange={handleChange} value={form.category}>
          <option value="">Choose category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Date</span>
        <input name="date" onChange={handleChange} type="date" value={form.date} />
      </label>

      <div className="form-actions">
        <button className="primary-button" disabled={saving} type="submit">
          {saving ? "Saving..." : editingExpense ? "Save changes" : "Add expense"}
        </button>
        {editingExpense && (
          <button className="text-button" onClick={onCancelEdit} type="button">
            Cancel
          </button>
        )}
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}

export default ExpenseForm;
