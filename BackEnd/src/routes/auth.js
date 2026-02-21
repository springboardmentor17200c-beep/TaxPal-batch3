import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, country, income_bracket } = req.body;
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

export default router;
