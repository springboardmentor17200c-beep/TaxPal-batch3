import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ message: "User Registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user) res.json({ message: "Login Success", user });
  else res.status(401).json({ message: "Invalid Credentials" });
};
