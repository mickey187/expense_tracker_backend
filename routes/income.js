var express = require('express');
const { createIncome, getIncomeById, updateIncome, deleteIncome, getAllIncome, getTotalIncome, getCurrentBalance, getIncomeByMonth } = require('../Controllers/IncomeController');
var router = express.Router();


router.post('/', createIncome);
router.get('/:incomeId', getIncomeById);
router.get('/all-income/:userId', getAllIncome);
router.get('/total-income/:userId', getTotalIncome);
router.get('/by-month/:userId', getIncomeByMonth);
router.get('/current-balance/:userId', getCurrentBalance);
router.put('/:incomeId', updateIncome);
router.delete('/:incomeId', deleteIncome);

module.exports = router;
