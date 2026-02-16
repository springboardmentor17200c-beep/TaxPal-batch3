import User from "../models/User.js";
import { mockDB } from "../config/mockDB.js";
import mongoose from "mongoose";

// Check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

export const registerUser = async (req, res) => {
  try {
    const userDB = isMongoConnected() ? User : mockDB.users;
    const user = await userDB.create(req.body);
    res.json({ message: "User Registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDB = isMongoConnected() ? User : mockDB.users;
    const user = await userDB.findOne({ email, password });

    if (user) res.json({ message: "Login Success", user });
    else res.status(401).json({ message: "Invalid Credentials" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
