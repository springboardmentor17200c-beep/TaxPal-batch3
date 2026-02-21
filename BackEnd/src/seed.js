import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";
import Budget from "./models/Budget.js";
import TaxEstimate from "./models/TaxEstimate.js";
import Report from "./models/Report.js";
import SuggestedCategory from "./models/SuggestedCategory.js";
import Alert from "./models/Alert.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tax1";

const incomeCategories = ["Consulting", "Freelance", "Salary", "Investment", "Sales", "Other"];
const expenseCategories = ["Rent/Mortgage", "Utilities", "Food", "Business", "Transportation", "Software", "Marketing", "Meals", "Other"];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Budget.deleteMany({});
  await TaxEstimate.deleteMany({});
  await Report.deleteMany({});
  await SuggestedCategory.deleteMany({});
  await Alert.deleteMany({});

  const password = await bcrypt.hash("password", 10);
  const demo = await User.create({
    name: "Alex Demo",
    email: "demo@taxpal.demo",
    password,
    country: "United States",
    income_bracket: "$50,000 - $75,000",
  });

  await SuggestedCategory.insertMany([
    ...incomeCategories.map((name) => ({ name, type: "income", description: `${name} income` })),
    ...expenseCategories.map((name) => ({ name, type: "expense", description: `${name} expense` })),
  ]);

  const transactions = [
    { user_id: demo._id, type: "income", category: "Freelance", amount: 3500, date: new Date("2026-02-15"), description: "Client Payment - ABC Corp" },
    { user_id: demo._id, type: "expense", category: "Rent/Mortgage", amount: -2000, date: new Date("2026-02-14"), description: "Office Rent" },
    { user_id: demo._id, type: "expense", category: "Software", amount: -54.99, date: new Date("2026-02-13"), description: "Software Subscription - Adobe" },
    { user_id: demo._id, type: "income", category: "Freelance", amount: 1200, date: new Date("2026-02-12"), description: "Consulting Fee" },
    { user_id: demo._id, type: "expense", category: "Utilities", amount: -145, date: new Date("2026-02-11"), description: "Electricity Bill" },
    { user_id: demo._id, type: "expense", category: "Meals", amount: -87.5, date: new Date("2026-02-10"), description: "Team Lunch" },
    { user_id: demo._id, type: "income", category: "Sales", amount: 560, date: new Date("2026-02-09"), description: "Product Sale" },
    { user_id: demo._id, type: "expense", category: "Utilities", amount: -79, date: new Date("2026-02-08"), description: "Internet Service" },
    { user_id: demo._id, type: "income", category: "Investments", amount: 420, date: new Date("2026-02-07"), description: "Investment Return" },
    { user_id: demo._id, type: "expense", category: "Marketing", amount: -350, date: new Date("2026-02-06"), description: "Marketing Campaign" },
    { user_id: demo._id, type: "income", category: "Consulting", amount: 850, date: new Date("2026-05-05"), description: "Freelance Work" },
    { user_id: demo._id, type: "expense", category: "Food", amount: -65.3, date: new Date("2026-05-07"), description: "Grocery Store" },
    { user_id: demo._id, type: "expense", category: "Utilities", amount: -142, date: new Date("2026-05-06"), description: "Electric Bill" },
    { user_id: demo._id, type: "income", category: "Consulting", amount: 120, date: new Date("2026-05-08"), description: "Design Project" },
    { user_id: demo._id, type: "expense", category: "Business", amount: -29.99, date: new Date("2026-05-04"), description: "Software Sub" },
  ];
  await Transaction.insertMany(transactions);

  await Budget.insertMany([
    { user_id: demo._id, category: "Rent/Mortgage", budget_amount: 2000, month: "2025-05", description: "Monthly rent" },
    { user_id: demo._id, category: "Business Expenses", budget_amount: 1500, month: "2025-05", description: "" },
    { user_id: demo._id, category: "Utilities", budget_amount: 300, month: "2025-05", description: "" },
    { user_id: demo._id, category: "Food & Groceries", budget_amount: 600, month: "2025-05", description: "" },
  ]);

  await TaxEstimate.insertMany([
    {
      user_id: demo._id,
      country: "United States",
      quarter: "Q2 (Apr-Jun 2025)",
      estimated_tax: 1850,
      due_date: new Date("2025-06-15"),
      state: "California",
      filing_status: "Single",
      gross_income_for_quarter: 12000,
      business_expenses: 1200,
      retirement_contribution: 500,
      health_insurance_premiums: 400,
      home_office_deduction: 300,
    },
  ]);

  await Report.insertMany([
    { user_id: demo._id, period: "Last Month", report_type: "Income Statement", file_path: "", format: "PDF" },
    { user_id: demo._id, period: "Last 3 Months", report_type: "Expense Report", file_path: "", format: "CSV" },
    { user_id: demo._id, period: "Last Year", report_type: "Tax Summary", file_path: "", format: "PDF" },
  ]);

  await Alert.insertMany([
    { user_id: demo._id, type: "reminder", message: "Q2 estimated tax payment due Jun 15, 2025", alert_date: new Date("2025-06-01"), is_read: false },
    { user_id: demo._id, type: "payment", message: "Q2 Estimated Tax Payment due Jun 15, 2025", alert_date: new Date("2025-06-15"), is_read: false },
  ]);

  console.log("Seed complete. Demo user: demo@taxpal.demo / password");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
