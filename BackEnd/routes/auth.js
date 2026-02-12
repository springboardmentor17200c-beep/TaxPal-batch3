import express from "express";
import { users } from "../data/db.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const user = req.body;
  users.push(user);
  res.json({ message: "User Registered", user });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) res.json({ message: "Login Success", user });
  else res.status(401).json({ message: "Invalid Credentials" });
});

export default router;   
