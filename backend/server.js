require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const { Expense, categories } = require("./models/Expense");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function validateExpenseInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: { request: "Request body must be a JSON object." } };
  }

  const { description, amount, category, date } = body;
  const errors = {};

  if (typeof description !== "string" || description.trim() === "") {
    errors.description = "Description cannot be empty.";
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be a number greater than 0.";
  }

  if (typeof category !== "string" || !categories.includes(category)) {
    errors.category = `Category must be one of: ${categories.join(", ")}.`;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const parsedDate = typeof date === "string" && datePattern.test(date)
    ? new Date(`${date}T00:00:00.000Z`)
    : null;
  const validDate = parsedDate
    && Number.isFinite(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === date;

  if (!validDate) {
    errors.date = "Date must be a valid date in YYYY-MM-DD format.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    values: {
      description: description.trim(),
      amount,
      category,
      date: parsedDate,
    },
  };
}

function sendValidationError(res, errors) {
  return res.status(400).json({
    message: "Please correct the invalid expense fields.",
    errors,
  });
}

app.post("/api/expenses", async (req, res) => {
  const { values, errors } = validateExpenseInput(req.body);
  if (errors) return sendValidationError(res, errors);

  try {
    const expense = await Expense.create(values);

    return res.status(201).json({
      message: "Expense created successfully.",
      expense,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please correct the invalid expense fields.",
        errors: Object.fromEntries(
          Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message]),
        ),
      });
    }

    console.error("Failed to create expense:", error.message);
    return res.status(500).json({ message: "Unable to create expense." });
  }
});

app.get("/api/expenses", async (req, res) => {
  const { category } = req.query;

  if (category && !categories.includes(category)) {
    return sendValidationError(res, {
      category: `Category must be one of: ${categories.join(", ")}.`,
    });
  }

  try {
    const filter = category ? { category } : {};
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    return res.status(200).json({ expenses });
  } catch (error) {
    console.error("Failed to get expenses:", error.message);
    return res.status(500).json({ message: "Unable to get expenses." });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Expense ID is invalid." });
  }

  const { values, errors } = validateExpenseInput(req.body);
  if (errors) return sendValidationError(res, errors);

  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    Object.assign(expense, values);
    await expense.save();

    return res.status(200).json({
      message: "Expense updated successfully.",
      expense,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, {
        amount: error.message,
      });
    }

    console.error("Failed to update expense:", error.message);
    return res.status(500).json({ message: "Unable to update expense." });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Expense ID is invalid." });
  }

  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    return res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    console.error("Failed to delete expense:", error.message);
    return res.status(500).json({ message: "Unable to delete expense." });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body contains invalid JSON." });
  }

  console.error("Request failed:", error.message);
  return res.status(500).json({ message: "Internal server error." });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Add it to backend/.env.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
