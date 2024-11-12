var express = require('express');
const { createIncome, getIncomeById, updateIncome, deleteIncome } = require('../Controllers/IncomeController');
const { getExpenseById, createExpense, updateExpense, deleteExpense, getAllExpense, getTotalExpense, getExpenseByMonth } = require('../Controllers/ExpenseController');
var router = express.Router();


router.post('/', createExpense);
router.get('/:expenseId', getExpenseById);
router.get('/all-expense/:userId', getAllExpense);
router.get('/total-expense/:userId', getTotalExpense);
router.get('/by-month/:userId', getExpenseByMonth);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

module.exports = router;
