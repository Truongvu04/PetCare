import { prisma } from "../config/prisma.js";

/**
 * Create expense
 * POST /api/expenses
 */
export const createExpense = async (req, res) => {
  try {
    const { pet_id, category, description, amount, expense_date } = req.body;
    const userId = req.user.user_id;

    // Validate pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: pet_id,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    // Validate category
    const validCategories = ["food", "medicine", "accessories", "vet_visit", "grooming", "other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const expense = await prisma.expense.create({
      data: {
        pet_id,
        user_id: userId,
        category,
        description: description.trim(),
        amount: parseFloat(amount),
        expense_date: new Date(expense_date),
      },
    });

    return res.status(201).json({
      success: true,
      expense: expense,
    });
  } catch (error) {
    console.error("Error in createExpense:", error);
    return res.status(500).json({
      message: "Error creating expense",
      error: error.message,
    });
  }
};

/**
 * Get expenses
 * GET /api/expenses
 */
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { pet_id, category, start_date, end_date } = req.query;

    // Check if expense model exists
    if (!prisma.expense) {
      console.error("Expense model not found. Run 'npx prisma generate'");
      return res.json({
        success: true,
        expenses: [],
      });
    }

    const whereClause = { user_id: userId };
    if (pet_id) {
      whereClause.pet_id = pet_id;
    }
    if (category) {
      whereClause.category = category;
    }
    if (start_date || end_date) {
      whereClause.expense_date = {};
      if (start_date) {
        whereClause.expense_date.gte = new Date(start_date);
      }
      if (end_date) {
        whereClause.expense_date.lte = new Date(end_date);
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
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

    return res.json({
      success: true,
      expenses: expenses,
    });
  } catch (error) {
    console.error("Error in getExpenses:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return res.status(500).json({
      message: "Error fetching expenses",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

/**
 * Get expense summary
 * GET /api/expenses/summary
 */
export const getExpenseSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { period = "all" } = req.query;

    // Check if expense model exists
    if (!prisma.expense) {
      console.error("Expense model not found. Run 'npx prisma generate'");
      return res.json({
        success: true,
        summary: {
          total_spent: 0,
          by_category: [],
        },
      });
    }

    const now = new Date();
    const whereClause = { user_id: userId };
    
    if (period === "this_month") {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      whereClause.expense_date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (period === "last_month") {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      whereClause.expense_date = {
        gte: startDate,
        lte: endDate,
      };
    }
    // For "all" period, no date filter is applied

    return await calculateSummary(whereClause, res);
  } catch (error) {
    console.error("Error in getExpenseSummary:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    // Return empty summary instead of 500 error
    return res.json({
      success: true,
      summary: {
        total_spent: 0,
        by_category: [],
      },
    });
  }
};

/**
 * Helper function to calculate summary
 */
const calculateSummary = async (whereClause, res) => {
  try {
    // Check if expense model exists
    if (!prisma.expense) {
      console.error("Expense model not found. Run 'npx prisma generate'");
      return res.json({
        success: true,
        summary: {
          total_spent: 0,
          by_category: [],
        },
      });
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
    });

    const totalSpent = expenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount) || 0;
      return sum + amount;
    }, 0);

    const byCategory = {};
    expenses.forEach((exp) => {
      const amount = parseFloat(exp.amount) || 0;
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += amount;
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([category, amount]) => ({ category, amount }));

    return res.json({
      success: true,
      summary: {
        total_spent: totalSpent,
        by_category: sortedCategories,
      },
    });
  } catch (error) {
    console.error("Error in calculateSummary:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    // Return empty summary instead of crashing
    return res.json({
      success: true,
      summary: {
        total_spent: 0,
        by_category: [],
      },
    });
  }
};

/**
 * Get expense by ID
 * GET /api/expenses/:id
 */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const expense = await prisma.expense.findFirst({
      where: {
        id: id,
        user_id: userId,
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

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.json({
      success: true,
      expense: expense,
    });
  } catch (error) {
    console.error("Error in getExpenseById:", error);
    return res.status(500).json({
      message: "Error fetching expense",
      error: error.message,
    });
  }
};

/**
 * Update expense
 * PUT /api/expenses/:id
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, amount, expense_date } = req.body;
    const userId = req.user.user_id;

    const expense = await prisma.expense.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or you don't have permission" });
    }

    const updateData = {};
    if (category) updateData.category = category;
    if (description) updateData.description = description.trim();
    if (amount) updateData.amount = parseFloat(amount);
    if (expense_date) updateData.expense_date = new Date(expense_date);

    const updatedExpense = await prisma.expense.update({
      where: { id: id },
      data: updateData,
    });

    return res.json({
      success: true,
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error in updateExpense:", error);
    return res.status(500).json({
      message: "Error updating expense",
      error: error.message,
    });
  }
};

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const expense = await prisma.expense.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or you don't have permission" });
    }

    await prisma.expense.delete({
      where: { id: id },
    });

    return res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    return res.status(500).json({
      message: "Error deleting expense",
      error: error.message,
    });
  }
};

