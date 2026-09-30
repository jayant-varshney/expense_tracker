import { useEffect, useState } from "react";
import ExpenseFilter from "./components/ExpenseFilter.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseList from "./components/ExpenseList.jsx";

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "The request could not be completed.");
  }

  return result;
}

function App() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    async function loadExpenses() {
      setLoading(true);
      setPageError("");

      try {
        const query = category ? `?category=${encodeURIComponent(category)}` : "";
        const result = await request(`/api/expenses${query}`);
        setExpenses(result.expenses);
      } catch (error) {
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, [category]);

  async function refreshExpenses() {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    const result = await request(`/api/expenses${query}`);
    setExpenses(result.expenses);
  }

  async function saveExpense(values) {
    const isEditing = Boolean(editingExpense);
    const path = isEditing ? `/api/expenses/${editingExpense._id}` : "/api/expenses";
    const result = await request(path, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(values),
    });

    setEditingExpense(null);
    setMessage(isEditing ? "Expense updated." : "Expense added.");
    setPageError("");

    if (category && values.category !== category) {
      setExpenses((currentExpenses) => currentExpenses.filter((expense) => expense._id !== result.expense._id));
    } else {
      await refreshExpenses();
    }
  }

  async function deleteExpense(expense) {
    if (!window.confirm(`Delete "${expense.description}"?`)) return;

    setDeletingId(expense._id);
    setMessage("");
    try {
      await request(`/api/expenses/${expense._id}`, { method: "DELETE" });
      setExpenses((currentExpenses) => currentExpenses.filter((item) => item._id !== expense._id));
      setMessage("Expense deleted.");
      setPageError("");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setDeletingId("");
    }
  }

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a aria-label="Expense Tracker home" className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">E</span>
          <span>ledger<span className="brand-period">.</span></span>
        </a>
        <span className="topbar-note">PERSONAL FINANCE</span>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR MONEY, IN VIEW</p>
          <h1>Expenses</h1>
          <p className="heading-copy">A clear record of where it goes.</p>
        </div>
        <div className="total-summary" aria-live="polite">
          <span>Total spending</span>
          <strong>${total.toFixed(2)}</strong>
          <small>{category || "All categories"}</small>
        </div>
      </section>

      <section aria-labelledby="form-heading" className="entry-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingExpense ? "MAKE A CHANGE" : "NEW RECORD"}</p>
            <h2 id="form-heading">{editingExpense ? "Edit expense" : "Add an expense"}</h2>
          </div>
        </div>
        <ExpenseForm
          editingExpense={editingExpense}
          onCancelEdit={() => setEditingExpense(null)}
          onSave={saveExpense}
        />
      </section>

      <section aria-labelledby="list-heading" className="records-section">
        <div className="records-toolbar">
          <div>
            <p className="eyebrow">YOUR RECORDS</p>
            <h2 id="list-heading">Recent expenses <span className="record-count">{expenses.length}</span></h2>
          </div>
          <ExpenseFilter category={category} onChange={(value) => {
            setCategory(value);
            setMessage("");
          }} />
        </div>

        {message && <p className="notice success-notice" role="status">{message}</p>}
        {pageError && <p className="notice error-notice" role="alert">{pageError}</p>}

        <ExpenseList
          deletingId={deletingId}
          expenses={expenses}
          loading={loading}
          onDelete={deleteExpense}
          onEdit={(expense) => {
            setMessage("");
            setEditingExpense(expense);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </section>

      <footer className="page-footer">A little more clarity, every day.</footer>
    </main>
  );
}

export default App;