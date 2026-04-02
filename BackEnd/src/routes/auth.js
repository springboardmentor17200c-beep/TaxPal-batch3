import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  country: user.country,
  income_bracket: user.income_bracket,
  phone: user.phone,
  address: user.address,
  tax_id: user.tax_id,
  filing_status: user.filing_status,
  professional_role: user.professional_role,
  is_verified: user.is_verified,
  notifications: user.notifications,
  two_factor_enabled: user.two_factor_enabled,
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, country, income_bracket, phone, address, tax_id, filing_status, professional_role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      country: country || "",
      income_bracket: income_bracket || "",
      phone: phone || "",
      address: address || "",
      tax_id: tax_id || "",
      filing_status: filing_status || "",
      professional_role: professional_role || "",
    });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, country: user.country, income_bracket: user.income_bracket },
      token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginId = (email || "").trim().toLowerCase();
    if (!loginId || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email: loginId });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      user: { id: user._id, name: user.name, email: user.email, country: user.country, income_bracket: user.income_bracket },
      token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/profile", auth, async (req, res) => {
  res.json(sanitizeUser(req.user));
});

router.patch("/profile", auth, async (req, res) => {
  try {
    const { name, email, country, income_bracket, phone, address, tax_id, filing_status, professional_role } = req.body;
    if (email && email.trim().toLowerCase() !== req.user.email) {
      const existing = await User.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      req.user.email = email.trim().toLowerCase();
    }
    if (name) req.user.name = name.trim();
    if (country !== undefined) req.user.country = country;
    if (income_bracket !== undefined) req.user.income_bracket = income_bracket;
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    if (tax_id !== undefined) req.user.tax_id = tax_id;
    if (filing_status !== undefined) req.user.filing_status = filing_status;
    if (professional_role !== undefined) req.user.professional_role = professional_role;

    await req.user.save();
    res.json(sanitizeUser(req.user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/notifications", auth, async (req, res) => {
  res.json(req.user.notifications || {});
});

router.patch("/notifications", auth, async (req, res) => {
  try {
    const updates = req.body || {};
    req.user.notifications = {
      ...req.user.notifications,
      ...updates,
    };
    await req.user.save();
    res.json(req.user.notifications);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/security", auth, async (req, res) => {
  res.json({
    two_factor_enabled: req.user.two_factor_enabled,
    email: req.user.email,
  });
});

router.patch("/security", auth, async (req, res) => {
  try {
    const { two_factor_enabled } = req.body;
    if (two_factor_enabled !== undefined) {
      req.user.two_factor_enabled = Boolean(two_factor_enabled);
    }
    await req.user.save();
    res.json({ two_factor_enabled: req.user.two_factor_enabled });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/change-password", auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "current_password and new_password are required" });
    }
    const matches = await req.user.comparePassword(current_password);
    if (!matches) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }
    req.user.password = new_password;
    await req.user.save();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
