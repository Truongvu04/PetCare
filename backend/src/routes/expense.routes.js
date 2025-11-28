import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", verifyToken, createExpense);
router.get("/", verifyToken, getExpenses);
router.get("/summary", verifyToken, getExpenseSummary);
router.get("/:id", verifyToken, getExpenseById);
router.put("/:id", verifyToken, updateExpense);
router.delete("/:id", verifyToken, deleteExpense);

export default router;

