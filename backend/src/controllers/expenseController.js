import { prisma } from "../config/prisma.js";
import crypto from "crypto";

// Create expense
export const createExpense = async (req, res) => {
  try {
    const { pet_id, category, description, amount, expense_date } = req.body;
    const user_id = req.user.user_id;

    if (!pet_id || !category || !description || !amount) {
      return res.status(400).json({ error: "Missing required fields: pet_id, category, description, amount" });
    }

    // Validate category
    const validCategories = ["food", "medicine", "accessories", "vet_visit", "grooming", "other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: pet_id, user_id },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    // Validate date
    const expenseDate = expense_date ? new Date(expense_date) : new Date();
    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({ error: "Invalid expense_date format" });
    }

    const expense = await prisma.expense.create({
      data: {
        id: crypto.randomBytes(12).toString("hex"),
        pet_id,
        user_id,
        category,
        description: description.trim(),
        amount: amountValue,
        expense_date: expenseDate,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get expenses
export const getExpenses = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { pet_id, category, start_date, end_date } = req.query;

    const where = {
      user_id,
    };

    if (pet_id) {
      // Verify pet belongs to user
      const pet = await prisma.pet.findFirst({
        where: { id: pet_id, user_id },
      });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found or unauthorized" });
      }
      where.pet_id = pet_id;
    }

    if (category) {
      const validCategories = ["food", "medicine", "accessories", "vet_visit", "grooming", "other"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }
      where.category = category;
    }

    if (start_date || end_date) {
      where.expense_date = {};
      if (start_date) {
        where.expense_date.gte = new Date(start_date);
      }
      if (end_date) {
        where.expense_date.lte = new Date(end_date);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        expense_date: "desc",
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get expense summary
export const getExpenseSummary = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { period = "all" } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = {
        expense_date: {
          gte: startOfMonth,
        },
      };
    } else if (period === "last_month") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      dateFilter = {
        expense_date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      };
    }

    const expenses = await prisma.expense.findMany({
      where: {
        user_id,
        ...dateFilter,
      },
    });

    // Calculate totals
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Group by category
    const byCategory = {};
    expenses.forEach((exp) => {
      const category = exp.category;
      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category] += parseFloat(exp.amount);
    });

    // Group by month
    const byMonth = {};
    expenses.forEach((exp) => {
      const monthKey = exp.expense_date.toISOString().slice(0, 7); // YYYY-MM
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = 0;
      }
      byMonth[monthKey] += parseFloat(exp.amount);
    });

    res.json({
      total_spent: totalSpent,
      by_category: byCategory,
      by_month: byMonth,
      count: expenses.length,
    });
  } catch (err) {
    console.error("Error fetching expense summary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const expense = await prisma.expense.findFirst({
      where: { id, user_id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error("Error fetching expense:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, amount, expense_date } = req.body;
    const user_id = req.user.user_id;

    const existingExpense = await prisma.expense.findFirst({
      where: { id, user_id },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const updateData = {};

    if (category !== undefined) {
      const validCategories = ["food", "medicine", "accessories", "vet_visit", "grooming", "other"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
      }
      updateData.category = category;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (amount !== undefined) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }
      updateData.amount = amountValue;
    }

    if (expense_date !== undefined) {
      const expenseDate = new Date(expense_date);
      if (isNaN(expenseDate.getTime())) {
        return res.status(400).json({ error: "Invalid expense_date format" });
      }
      updateData.expense_date = expenseDate;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.json(updatedExpense);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const existingExpense = await prisma.expense.findFirst({
      where: { id, user_id },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

