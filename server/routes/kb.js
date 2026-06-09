const express = require("express");
const router = express.Router();

const articles = [
  { id: "KB001", title: "VPN Setup & Troubleshooting", category: "Network", tags: ["VPN", "Remote"], views: 1240, updated: "2026-05-20" },
  { id: "KB002", title: "Reset Active Directory Password", category: "Access", tags: ["Password", "AD"], views: 980, updated: "2026-05-15" },
  { id: "KB003", title: "Outlook 365 Configuration Guide", category: "Software", tags: ["Outlook", "Email"], views: 750, updated: "2026-06-01" },
  { id: "KB004", title: "New Laptop Provisioning Checklist", category: "Hardware", tags: ["Hardware", "Onboarding"], views: 612, updated: "2026-04-10" },
  { id: "KB005", title: "MFA Enrollment for New Employees", category: "Security", tags: ["MFA", "Security"], views: 520, updated: "2026-05-28" },
  { id: "KB006", title: "Printer Driver Installation", category: "Hardware", tags: ["Printer", "Drivers"], views: 410, updated: "2026-03-22" },
];

router.get("/", (req, res) => res.json({ articles, total: articles.length }));
router.get("/:id", (req, res) => {
  const a = articles.find(a => a.id === req.params.id);
  if (!a) return res.status(404).json({ error: "Not found" });
  a.views++;
  res.json(a);
});

module.exports = router;
