import Report from "../models/Report.js";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getReports = catchAsync(async (req, res) => {
  const list = await Report.find({ user_id: req.user._id }).sort({ createdAt: -1 }).lean();
  const formatted = list.map((r) => ({
    ...r,
    id: r._id,
    name: r.report_type,
    generated: r.createdAt,
    period: r.period,
    format: r.format || "PDF"
  }));
  return successResponse(res, 200, formatted, "Reports retrieved");
});

export const createReport = catchAsync(async (req, res) => {
  const { period, report_type, file_path, format } = req.body;
  const doc = await Report.create({
    user_id: req.user._id,
    period,
    report_type,
    file_path: file_path || "",
    format: format || "PDF",
  });
  return successResponse(res, 201, {
    ...doc.toObject(),
    id: doc._id,
    name: doc.report_type,
    generated: doc.createdAt,
  }, "Report entry created");
});

export const getReport = catchAsync(async (req, res) => {
  const doc = await Report.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
  if (!doc) {
    throw new ApiError(404, "Report not found");
  }
  return successResponse(res, 200, { ...doc, id: doc._id, name: doc.report_type, generated: doc.createdAt }, "Report retrieved");
});

export const deleteReport = catchAsync(async (req, res) => {
  const doc = await Report.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!doc) {
    throw new ApiError(404, "Report not found");
  }
  return res.status(204).send();
});

export const downloadReport = catchAsync(async (req, res) => {
  const report = await Report.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  let query = { user_id: req.user._id };
  if (report.report_type === "Income Statement") {
    query.type = "income";
  } else if (report.report_type === "Expense Report") {
    query.type = "expense";
  }

  const now = new Date();
  let startDate = null;
  let endDate = null;

  if (report.period === "Current Month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (report.period === "Last Month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (report.period === "Last 3 Months") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  } else if (report.period === "Last 6 Months") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  } else if (report.period === "Year to Date") {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else if (report.period === "Last Year") {
    startDate = new Date(now.getFullYear() - 1, 0, 1);
    endDate = new Date(now.getFullYear(), 0, 1);
  }

  if (startDate) {
    query.date = { $gte: startDate };
    if (endDate) {
      query.date.$lt = endDate;
    }
  }

  const transactions = await Transaction.find(query);
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=TaxPal-Report.pdf`
  );

  doc.pipe(res);

  doc
    .fontSize(22)
    .fillColor("#333")
    .text("TaxPal Financial Report", { align: "center" });

  doc.moveDown(1);

  doc
    .fontSize(12)
    .fillColor("#555")
    .text(`Report Type: ${report.report_type}`)
    .text(`Period: ${report.period}`)
    .text(`Generated On: ${new Date().toDateString()}`);

  doc.moveDown(1.5);

  doc
    .fontSize(14)
    .fillColor("#000")
    .text("Transactions", { underline: true });

  doc.moveDown(0.5);

  doc
    .fontSize(11)
    .fillColor("#000")
    .text("Type".padEnd(12), { continued: true })
    .text("Category".padEnd(15), { continued: true })
    .text("Amount".padEnd(12), { continued: true })
    .text("Date");

  doc.moveDown(0.5);
  doc.moveDown(0.5);

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      totalIncome += t.amount || 0;
    } else if (t.type === "expense") {
      totalExpense += t.amount || 0;
    }

    doc
      .fontSize(10)
      .fillColor("#444")
      .text(t.type.padEnd(12), { continued: true })
      .text(t.category.padEnd(15), { continued: true })
      .text(`Rs. ${t.amount}`.padEnd(12), { continued: true })
      .text(new Date(t.date).toDateString());

    doc.moveDown(0.5);
  });

  doc.moveDown(1);

  doc
    .fontSize(14)
    .fillColor("#000")
    .text("Summary", { underline: true });

  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .fillColor("green")
    .text(`Total Income: Rs. ${totalIncome}`);

  doc
    .fillColor("red")
    .text(`Total Expense: Rs. ${totalExpense}`);

  doc
    .fillColor("#000")
    .text(`Net Balance: Rs. ${totalIncome - totalExpense}`);

  doc.end();
});
