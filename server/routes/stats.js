const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // Import tickets dynamically to get current state
  const ticketsRouter = require("./tickets");
  res.json({ message: "stats" });
});

module.exports = router;
