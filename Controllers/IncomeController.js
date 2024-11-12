const Expense = require("../models/Expense");
const Income = require("../models/Income");
const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const CURRENCY_FREAKS_API_KEY = process.env.CURRENCY_FREAK_API_KEY;

const createIncome = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { userId, amount, source, date } = req.body;
    const newIncome = new Income({
      user: userId,
      source: source,
      amount: amount,
      date: date,
    });
    await newIncome.save();
    return res.status(201).json({
      message: "success",
      data: newIncome,
    });
  } catch (error) {
    console.error("error creating income: ", error.message);
  }
};

const getIncomeById = async (req, res) => {
  try {
    const incomeId = req.params.incomeId;
    const income = Income.findById(incomeId);
    return res.status(200).json({
      message: "success",
      data: income,
    });
  } catch (error) {
    console.error("error fetching income: ", error.message);
  }
};

const getAllIncome = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);
    const incomes = await Income.find({ user: userId });
    console.log("incomes", incomes);
    return res.status(200).json({
      message: "success",
      error: false,
      data: incomes,
    });
  } catch (error) {
    console.error("error fetching income: ", error.message);
  }
};

const getTotalIncome = async (req, res) => {
  try {
    // Calculate total income
    const { userId } = req.params;
    const incomes = await Income.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]);
    return res.status(200).json({
      message: "success",
      error: false,
      data: incomes[0]?.totalIncome || 0,
    });
  } catch (error) {
    console.error("error getting total income: ", error.message);
    return res.status(500).json({
      message: "error getting total income: " + error.message,
      error: true,
    });
  }
};

const getCurrentBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const incomes = await Income.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]);

    const expenses = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
    ]);

    const totalIncome = incomes[0]?.totalIncome || 0;
    const totalExpenses = expenses[0]?.totalExpenses || 0;

    const currentBalance = totalIncome - totalExpenses;
    return res
      .status(200)
      .json({ message: "success", error: false, data: currentBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting current balance" });
  }
};

const getCurrentBalanceFx = async (req, res) => {
  try {
    const { userId } = req.params;
    // Step 1: Fetch total income
    const totalIncomeResult = await Income.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } },
    ]);
    const totalIncome = totalIncomeResult[0]?.totalIncome || 0;

    // Step 2: Fetch total expenses
    const totalExpensesResult = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
    ]);
    const totalExpenses = totalExpensesResult[0]?.totalExpenses || 0;

    // Step 3: Calculate balance
    const balance = totalIncome - totalExpenses;

    // Step 4: Fetch conversion rates from Currency Freaks API
    const response = await axios.get(
      `https://api.currencyfreaks.com/latest?apikey=${CURRENCY_FREAKS_API_KEY}`
    );

    const rates = response.data.rates;
    const etbRate = parseFloat(rates.ETB);
    const eurRate = parseFloat(rates.EUR);

    if (!etbRate || !eurRate) {
      return res
        .status(500)
        .json({ message: "Failed to fetch conversion rates" ,
          error: true, });
    }

    // Step 5: Convert balance to ETB and EUR
    const balanceETB = balance * etbRate;
    const balanceEUR = balance * eurRate;
    console.log("balanceETB", balanceETB);

    // Step 6: Send the result
    res.status(200).json({
      message: "success",
      error: false,
      data: {
        balanceUSD: balance.toFixed(2), // Balance in USD
        balanceETB: balanceETB.toFixed(2), // Converted to ETB
        balanceEUR: balanceEUR.toFixed(2), // Converted to EUR}
      },
    });
  } catch (error) {
    console.error(error);
   return res.status(500).json({ message: "Error fetching balance fx" });
  }
};

const getIncomeByMonth = async (req, res) => {
  try {
    const incomesByMonth = await Income.aggregate([
      {
        $group: {
          _id: { $month: "$date" }, // Group by month (1 = January, 2 = February, ...)
          totalIncome: { $sum: "$amount" }, // Sum the amount field
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
          income: "$totalIncome", // Rename `totalIncome` to `income`
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month number (optional)
      },
    ]);

    console.log(incomesByMonth);
    return res.status(200).json({
      message: "success",
      error: false,
      data: incomesByMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching income" });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedIncome = await Income.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.json(updatedIncome);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating income" });
  }
};
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIncome = await Income.findByIdAndDelete(id);
    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.json({ message: "Income deleted", deletedIncome });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting income" });
  }
};

module.exports = {
  createIncome,
  getIncomeById,
  getAllIncome,
  getTotalIncome,
  getIncomeByMonth,
  getCurrentBalance,
  getCurrentBalanceFx,
  updateIncome,
  deleteIncome,
};
