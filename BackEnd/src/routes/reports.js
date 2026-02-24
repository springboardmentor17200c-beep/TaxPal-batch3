import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Report from "../models/Report.js";
import PDFDocument from "pdfkit";
import Transaction from "../models/Transaction.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const list = await Report.find({ user_id: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(list.map((r) => ({ ...r, id: r._id, name: r.report_type, generated: r.createdAt, period: r.period, format: r.format || "PDF" })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { period, report_type, file_path, format } = req.body;
    if (!period || !report_type) {
      return res.status(400).json({ error: "period and report_type are required" });
    }
    const doc = await Report.create({
      user_id: req.user._id,
      period,
      report_type,
      file_path: file_path || "",
      format: format || "PDF",
    });
    res.status(201).json({
      ...doc.toObject(),
      id: doc._id,
      name: doc.report_type,
      generated: doc.createdAt,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Report.findOne({ _id: req.params.id, user_id: req.user._id }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ ...doc, id: doc._id, name: doc.report_type, generated: doc.createdAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Report.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/download/:id", async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Fetch transactions
    const transactions = await Transaction.find({
      user_id: req.user._id,
    });

    const doc = new PDFDocument({ margin: 40 });

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=TaxPal-Report.pdf`
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc
      .fontSize(22)
      .fillColor("#333")
      .text("TaxPal Financial Report", { align: "center" });

    doc.moveDown(1);

    // ================= REPORT INFO =================
    doc
      .fontSize(12)
      .fillColor("#555")
      .text(`Report Type: ${report.report_type}`)
      .text(`Period: ${report.period}`)
      .text(`Generated On: ${new Date().toDateString()}`);

    doc.moveDown(1.5);

    // ================= TABLE HEADER =================
    doc
      .fontSize(14)
      .fillColor("#000")
      .text("Transactions", { underline: true });

    doc.moveDown(0.5);

    // Column headers
    doc
  .fontSize(11)
  .fillColor("#000")
  .text("Type".padEnd(12), { continued: true })
  .text("Category".padEnd(15), { continued: true })
  .text("Amount".padEnd(12), { continued: true })
  .text("Date");

doc.moveDown(0.5);

    doc.moveDown(0.5);

    // ================= DATA =================
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
  doc
    .fontSize(10)
    .fillColor("#444")
    .text(t.type.padEnd(12), { continued: true })
    .text(t.category.padEnd(15), { continued: true })
    .text(`₹${t.amount}`.padEnd(12), { continued: true })
    .text(new Date(t.date).toDateString());

  doc.moveDown(0.5);
});

    doc.moveDown(1);

    // ================= TOTALS =================
    doc
      .fontSize(14)
      .fillColor("#000")
      .text("Summary", { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("green")
      .text(`Total Income: ₹${totalIncome}`);

    doc
      .fillColor("red")
      .text(`Total Expense: ₹${totalExpense}`);

    doc
      .fillColor("#000")
      .text(`Net Balance: ₹${totalIncome - totalExpense}`);

    doc.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
