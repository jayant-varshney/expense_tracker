const mongoose = require("mongoose");

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: (amount) => amount > 0,
        message: "Amount must be greater than 0.",
      },
    },
    category: {
      type: String,
      required: true,
      enum: categories,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = { Expense, categories };