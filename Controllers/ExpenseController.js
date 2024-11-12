const Expense = require("../models/Expense");
const Income = require("../models/Income");
const mongoose = require('mongoose');

const createExpense = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { userId, amount, category, description, date } = req.body;
    const expense = new Expense({
      user: userId,
      amount,
      category,
      description,
      date,
    });
    await expense.save();
    res.status(201).json({ message: "success", error: false, data: expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating expense" });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { userId } = req.params;
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
    res.json({ message: "success", error: false, data: expenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching expenses" });
  }
};

const getAllExpense = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);
    const expenses = await Expense.find({ user: userId });
    console.log("incomes", expenses);
    return res.status(200).json({
      message: "success",
      data: expenses,
    });
  } catch (error) {
    console.error("error fetching expenses: ", error.message);
  }
};

const getTotalExpense = async (req, res) => {
  try {
    // Calculate total income
    const {userId} = req.params;
    console.log("userId", userId);
    const expenses = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    ]);
    console.log("expenses", expenses);
    return res.status(200).json({
      message: "success",
      error: false,
      data: expenses[0]?.totalExpense || 0,
    });
  } catch (error) {
    console.error("error getting total expense: ", error.message);
    return res.status(500).json({
      message: "error getting total expense: " + error.message,
      error: true,
    });
  }
};


const getExpenseByMonth = async(req, res) => {
  try {
    const expenseByMonth = await Expense.aggregate([
      {
        $group: {
          _id: { $month: "$date" }, // Group by month (1 = January, 2 = February, ...)
          totalExpense: { $sum: "$amount" }, // Sum the amount field
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default `_id` field
          month: {
            $arrayElemAt: [
              [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ],
              "$_id",
            ],
          }, // Convert month number to month name
          expense: "$totalExpense", // Rename `totalIncome` to `income`
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month number (optional)
      },
    ]);
    
    console.log(expenseByMonth);
    return res.status(200).json({
      message: "success",
      error: false,
      data: expenseByMonth
    })
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching income" });
  }
}

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "success", error: false, data: updatedExpense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating expense" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ error: false, message: "Expense deleted", deletedExpense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting expense" });
  }
};

module.exports = {
  createExpense,
  getExpenseById,
  getTotalExpense,
  getAllExpense,
  getExpenseByMonth,
  updateExpense,
  deleteExpense,
};
