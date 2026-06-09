const express = require("express");
const router = express.Router();

const users = [];

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required." });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email already registered." });
  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid email or password." });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

router.delete("/delete", (req, res) => {
  const { email } = req.body;
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(404).json({ error: "User not found." });
  users.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
